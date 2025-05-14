import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import type { Recipe } from '../../types';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const RecipeDetail = dynamic(() => import('../../components/recipe/RecipeDetail'), { loading: () => <div>Loading recipe...</div> });

const RecipeDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: recipes = [], isLoading } = useSWR<Recipe[]>('/data/recipes.json', fetcher, { revalidateOnFocus: false });
  const recipe = recipes.find((r: Recipe) => r.id === id);
  if (!recipe) return <div>Loading...</div>;
  return <RecipeDetail {...recipe} />;
};

export default RecipeDetailPage; 