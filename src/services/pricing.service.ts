import { prisma } from '@server/database/prisma';
import { logger } from '@server/utils/logger';

interface PricingFactors {
  basePrice: number;
  demandScore?: number;
  isWeekend?: boolean;
  isHoliday?: boolean;
  seasonMultiplier?: number;
  bookingLeadTime?: number; // days in advance
  itemPopularity?: number; // views/bookings ratio
}

interface PriceBreakdown {
  basePrice: number;
  demandAdjustment: number;
  weekendAdjustment: number;
  holidayAdjustment: number;
  seasonalAdjustment: number;
  finalPrice: number;
  pricePerDay: number;
  totalDays: number;
}

/**
 * Calculate dynamic pricing based on multiple factors
 */
export function calculateDynamicPrice(
  itemId: string,
  startDate: Date,
  endDate: Date,
  factors?: PricingFactors
): Promise<PriceBreakdown> {
  return calculatePriceWithDemand(itemId, startDate, endDate, factors);
}

/**
 * Get current demand score for an item
 */
export async function getItemDemandScore(itemId: string): Promise<number> {
  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get item details
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: {
      bookings: {
        where: {
          createdAt: { gte: last30Days },
          status: { not: 'CANCELLED' },
        },
      },
      _count: {
        select: {
          bookings: {
            where: {
              createdAt: { gte: last30Days },
              status: { not: 'CANCELLED' },
            },
          },
        },
      },
    },
  });

  if (!item) return 0;

  const recentBookings = item.bookings.length;
  
  // Calculate demand score (0-100)
  // More than 10 bookings in 30 days = high demand
  const demandScore = Math.min(100, (recentBookings / 10) * 100);

  // Update item with demand score
  await prisma.item.update({
    where: { id: itemId },
    data: { demandScore },
  });

  return demandScore;
}

/**
 * Check if date falls on weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

/**
 * Check if date falls on UK holiday
 */
export function isHoliday(date: Date): boolean {
  const month = date.getMonth();
  const day = date.getDate();

  // Common UK holidays (simplified)
  const holidays = [
    // New Year's Day
    { month: 0, day: 1 },
    // Good Friday (varies, simplified)
    { month: 3, day: 15 },
    // Easter Monday
    { month: 3, day: 18 },
    // Early May Bank Holiday
    { month: 4, day: 1 },
    // Spring Bank Holiday
    { month: 4, day: 29 },
    // Summer Bank Holiday
    { month: 7, day: 26 },
    // Christmas Day
    { month: 11, day: 25 },
    // Boxing Day
    { month: 11, day: 26 },
  ];

  return holidays.some(holiday => holiday.month === month && holiday.day === day);
}

/**
 * Get seasonal multiplier based on time of year
 */
export function getSeasonalMultiplier(date: Date): number {
  const month = date.getMonth();

  // Peak seasons (higher demand)
  const peakMonths = [5, 6, 7]; // June, July, August
  const holidaySeason = [11]; // December

  if (peakMonths.includes(month)) {
    return 1.3; // 30% increase
  } else if (holidaySeason.includes(month)) {
    return 1.2; // 20% increase
  }

  // Off-peak seasons
  const offPeakMonths = [0, 1, 2, 10]; // Jan, Feb, Mar, Nov
  if (offPeakMonths.includes(month)) {
    return 0.85; // 15% decrease
  }

  return 1.0; // Standard rate
}

/**
 * Calculate price with all factors
 */
async function calculatePriceWithDemand(
  itemId: string,
  startDate: Date,
  endDate: Date,
  factors?: PricingFactors
): Promise<PriceBreakdown> {
  // Get item base price
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: { pricePerDay: true },
  });

  if (!item) {
    throw new Error('Item not found');
  }

  const basePrice = factors?.basePrice ?? item.pricePerDay;
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (totalDays < 1) {
    throw new Error('Invalid date range');
  }

  // Get demand score
  const demandScore = factors?.demandScore ?? await getItemDemandScore(itemId);
  
  // Calculate adjustments
  const demandAdjustment = basePrice * (demandScore / 100) * 0.2; // Up to 20% increase
  
  // Check dates for weekends and holidays
  let weekendDays = 0;
  let holidayDays = 0;
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (isWeekend(currentDate)) weekendDays++;
    if (isHoliday(currentDate)) holidayDays++;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const weekendAdjustment = weekendDays > 0 ? basePrice * 0.15 * weekendDays : 0; // 15% weekend premium
  const holidayAdjustment = holidayDays > 0 ? basePrice * 0.25 * holidayDays : 0; // 25% holiday premium

  // Seasonal adjustment
  const avgSeasonalMultiplier = getAverageSeasonalMultiplier(startDate, endDate);
  const seasonalAdjustment = basePrice * (avgSeasonalMultiplier - 1) * totalDays;

  // Calculate final price
  const pricePerDay = basePrice + demandAdjustment + (weekendAdjustment / totalDays) + (holidayAdjustment / totalDays) + (seasonalAdjustment / totalDays);
  const finalPrice = Math.round((pricePerDay * totalDays));

  logger.info(`Dynamic pricing calculated for item ${itemId}: £${finalPrice} (${totalDays} days)`);

  return {
    basePrice: basePrice * totalDays,
    demandAdjustment: Math.round(demandAdjustment * totalDays),
    weekendAdjustment: Math.round(weekendAdjustment),
    holidayAdjustment: Math.round(holidayAdjustment),
    seasonalAdjustment: Math.round(seasonalAdjustment),
    finalPrice,
    pricePerDay: Math.round(pricePerDay),
    totalDays,
  };
}

/**
 * Get average seasonal multiplier for date range
 */
function getAverageSeasonalMultiplier(startDate: Date, endDate: Date): number {
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  let multiplierSum = 0;
  
  let currentDate = new Date(startDate);
  for (let i = 0; i <= totalDays; i++) {
    multiplierSum += getSeasonalMultiplier(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return multiplierSum / (totalDays + 1);
}

/**
 * Generate price suggestions for an item owner
 */
export async function generatePriceSuggestions(itemId: string): Promise<{
  suggestedBasePrice: number;
  weekendPrice: number;
  holidayPrice: number;
  peakSeasonPrice: number;
  offPeakPrice: number;
  reasoning: string;
}> {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      bookings: {
        where: { status: { not: 'CANCELLED' } },
        select: { totalPrice: true, dayCount: true },
      },
    },
  });

  if (!item) {
    throw new Error('Item not found');
  }

  const currentPrice = item.pricePerDay;
  const demandScore = await getItemDemandScore(itemId);
  
  // Analyze booking history
  const avgBookingValue = item.bookings.length > 0
    ? item.bookings.reduce((sum: number, b: { totalPrice: number; dayCount: number }) => sum + b.totalPrice / b.dayCount, 0) / item.bookings.length
    : currentPrice;

  // Calculate suggested prices
  const baseSuggestion = Math.round(avgBookingValue * (1 + demandScore / 100 * 0.1));
  const weekendPrice = Math.round(baseSuggestion * 1.15);
  const holidayPrice = Math.round(baseSuggestion * 1.25);
  const peakSeasonPrice = Math.round(baseSuggestion * 1.3);
  const offPeakPrice = Math.round(baseSuggestion * 0.85);

  // Generate reasoning
  let reasoning = `Based on ${item.bookings.length} recent bookings and `;
  reasoning += demandScore > 70 ? 'high demand, ' : demandScore > 40 ? 'moderate demand, ' : 'low demand, ';
  reasoning += `we suggest adjusting your prices to optimize earnings.`;

  return {
    suggestedBasePrice: baseSuggestion,
    weekendPrice,
    holidayPrice,
    peakSeasonPrice,
    offPeakPrice,
    reasoning,
  };
}

/**
 * Track price history when price changes
 */
export async function trackPriceChange(
  itemId: string,
  oldPrice: number,
  newPrice: number,
  reason: string
): Promise<void> {
  try {
    await prisma.$executeRaw`
      INSERT INTO "PricingHistory" ("id", "itemId", "oldPrice", "newPrice", "reason", "createdAt")
      VALUES (gen_random_uuid(), ${itemId}, ${oldPrice}, ${newPrice}, ${reason}, NOW())
    `;
    
    logger.info(`Price change tracked: £${oldPrice} → £${newPrice} (${reason})`);
  } catch (error) {
    logger.error('Failed to track price change:', error);
  }
}

/**
 * Get price history for an item
 */
export async function getPriceHistory(itemId: string): Promise<Array<{
  date: string;
  oldPrice: number;
  newPrice: number;
  reason: string;
}>> {
  const history = await prisma.$queryRaw`
    SELECT "createdAt" as date, "oldPrice", "newPrice", "reason"
    FROM "PricingHistory"
    WHERE "itemId" = ${itemId}
    ORDER BY "createdAt" DESC
    LIMIT 50
  `;

  return history.map((record: any) => ({
    date: new Date(record.date).toISOString(),
    oldPrice: record.oldPrice,
    newPrice: record.newPrice,
    reason: record.reason,
  }));
}

/**
 * Automatically adjust prices based on demand (can be run as cron job)
 */
export async function autoAdjustPrices(): Promise<void> {
  const items = await prisma.item.findMany({
    where: { isActive: true },
    select: { id: true, pricePerDay: true },
  });

  for (const item of items) {
    const demandScore = await getItemDemandScore(item.id);
    
    // Adjust price based on demand
    if (demandScore > 80) {
      // High demand - increase price by 10%
      const newPrice = Math.round(item.pricePerDay * 1.1);
      await prisma.item.update({
        where: { id: item.id },
        data: { pricePerDay: newPrice },
      });
      await trackPriceChange(item.id, item.pricePerDay, newPrice, 'High demand auto-adjustment');
    } else if (demandScore < 20) {
      // Low demand - decrease price by 5%
      const newPrice = Math.round(item.pricePerDay * 0.95);
      await prisma.item.update({
        where: { id: item.id },
        data: { pricePerDay: newPrice },
      });
      await trackPriceChange(item.id, item.pricePerDay, newPrice, 'Low demand auto-adjustment');
    }
  }

  logger.info(`Auto-adjusted prices for ${items.length} items`);
}
