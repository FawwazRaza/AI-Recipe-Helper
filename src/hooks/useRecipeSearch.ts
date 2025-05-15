import type { Recipe } from '../types';

export function useRecipeSearch(recipes: Recipe[], query: string) {
  // Simple search by name
  const results = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(query.toLowerCase())
  );
  return { results };
} 