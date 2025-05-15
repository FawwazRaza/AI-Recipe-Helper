import React, { createContext, useContext, useState } from 'react';
import type { Recipe } from '../types';

interface RecipeContextType {
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const useRecipeContext = () => {
  const ctx = useContext(RecipeContext);
  if (!ctx) throw new Error('useRecipeContext must be used within a RecipeProvider');
  return ctx;
};

export const RecipeProvider = ({ children }: { children: React.ReactNode }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  return (
    <RecipeContext.Provider value={{ recipes, setRecipes }}>
      {children}
    </RecipeContext.Provider>
  );
}; 