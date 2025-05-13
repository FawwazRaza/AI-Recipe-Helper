import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import RecipeDetail from '../../components/recipe/RecipeDetail';
import type { Recipe } from '../../types';

const fetchRecipes = async (): Promise<Recipe[]> => {
  const res = await fetch('/data/recipes.json');
  return res.json();
};

const RecipeDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchRecipes().then(recipes => {
      const found = recipes.find((r: Recipe) => r.id === id);
      setRecipe(found || null);
    });
  }, [id]);

  if (!recipe) return <div>Loading...</div>;

  return <RecipeDetail {...recipe} />;
};

export default RecipeDetailPage; 