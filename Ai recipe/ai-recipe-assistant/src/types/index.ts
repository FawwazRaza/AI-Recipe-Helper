export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Recipe {
  id: string;
  name: string;
  image: string;
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: string;
  cookingTime: string;
  difficulty: string;
  servings: number;
  cuisine?: string;
  mealType?: string;
  calories?: number;
} 