// Utility functions for nutrition calculations

export function calculateCalories(ingredients: { name: string; quantity: number; calories: number }[]): number {
  return ingredients.reduce((sum, ing) => sum + (ing.calories * ing.quantity), 0);
} 