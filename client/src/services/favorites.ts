import { api } from "./http";

export interface FavoriteItem {
  id: string;
  userId: string;
  itemId: string;
  createdAt: string;
}

// Get user's favorites
export async function getFavorites() {
  const response = await api.get<FavoriteItem[]>("/favorites");
  return response.data;
}

// Add item to favorites
export async function addToFavorites(itemId: string) {
  const response = await api.post<FavoriteItem>("/favorites", { itemId });
  return response.data;
}

// Remove item from favorites
export async function removeFromFavorites(itemId: string) {
  await api.delete(`/favorites/${itemId}`);
}

// Toggle favorite status (convenience method)
export async function toggleFavorite(itemId: string): Promise<boolean> {
  try {
    const favorites = await getFavorites();
    const isFavorite = favorites.some(fav => fav.itemId === itemId);
    
    if (isFavorite) {
      await removeFromFavorites(itemId);
      return false; // Removed
    } else {
      await addToFavorites(itemId);
      return true; // Added
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
}
