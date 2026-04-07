import type { DashboardSummary } from "@shared/contracts";
import { api } from "./http";

export async function getDashboardSummary() {
  const response = await api.get<DashboardSummary>("/dashboard/summary");
  return response.data;
}
