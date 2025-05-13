import React, { useEffect, useState } from 'react';
import RecipeCard from '../../components/recipe/RecipeCard';
import RecipeFilter, { RecipeFilterOptions } from '../../components/recipe/RecipeFilter';
import Input from '../../components/ui/Input';
import IngredientInput from '../../components/recipe/IngredientInput';
import styles from './RecipesPage.module.css';

interface Recipe {
  id: string;
  name: string;
  image: string;
  cookingTime: string;
  difficulty: string;
  diet: string[];
  popularity: number;
  ingredients: { name: string }[];
  nutrition: string;
}

interface RecipeMatch {
  recipe: Recipe;
  matchCount: number;
  total: number;
  matchPercent: number;
  missingIngredients: string[];
}

const fetchRecipes = async (): Promise<Recipe[]> => {
  const res = await fetch('/data/recipes.json');
  return res.json();
};

const RecipesPage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState<Recipe[]>([]);
  const [filterObj, setFilterObj] = useState<RecipeFilterOptions>({
    diet: [],
    cookingTime: '',
    cuisine: '',
    mealType: '',
    calories: '',
    difficulty: '',
  });
  const [sort, setSort] = useState('time');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientMode, setIngredientMode] = useState(false);
  const [matchedRecipes, setMatchedRecipes] = useState<RecipeMatch[]>([]);

  useEffect(() => {
    fetchRecipes().then(setRecipes);
  }, []);

  useEffect(() => {
    let result = [...recipes];
    if (ingredientMode && ingredients.length > 0) {
      // Compute match info for each recipe
      const matches: RecipeMatch[] = result.map(r => {
        const recipeIngs = r.ingredients.map(i => i.name.toLowerCase());
        const userIngs = ingredients.map(i => i.toLowerCase());
        const matchCount = userIngs.filter(ing => recipeIngs.includes(ing)).length;
        const total = recipeIngs.length;
        const matchPercent = total === 0 ? 0 : Math.round((matchCount / total) * 100);
        const missingIngredients = recipeIngs.filter(ing => !userIngs.includes(ing));
        return { recipe: r, matchCount, total, matchPercent, missingIngredients };
      });
      // Sort by match percentage descending, then by match count
      matches.sort((a, b) => b.matchPercent - a.matchPercent || b.matchCount - a.matchCount);
      setMatchedRecipes(matches);
      // Only show recipes with at least one matching ingredient
      result = matches.filter(m => m.matchCount > 0).map(m => m.recipe);
    } else {
      setMatchedRecipes([]);
      // Advanced filter logic
      if (search) {
        result = result.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
      }
      if (filterObj) {
        // Diet
        if (filterObj.diet && filterObj.diet.length) {
          result = result.filter(r => filterObj.diet.every((f: string) => r.diet.includes(f)));
        }
        // Cooking Time
        if (filterObj.cookingTime) {
          result = result.filter(r => {
            const min = parseInt(r.cookingTime);
            if (filterObj.cookingTime === 'under30') return min < 30;
            if (filterObj.cookingTime === '30to60') return min >= 30 && min <= 60;
            if (filterObj.cookingTime === 'over60') return min > 60;
            return true;
          });
        }
        // Cuisine (for demo, match by name keyword)
        if (filterObj.cuisine) {
          result = result.filter(r => r.name.toLowerCase().includes(filterObj.cuisine.toLowerCase()));
        }
        // Meal Type (for demo, match by name keyword)
        if (filterObj.mealType) {
          result = result.filter(r => r.name.toLowerCase().includes(filterObj.mealType.toLowerCase()));
        }
        // Calories
        if (filterObj.calories) {
          result = result.filter(r => {
            const match = r.nutrition.match(/(\d+)/);
            const kcal = match ? parseInt(match[1]) : 0;
            if (filterObj.calories === 'under400') return kcal < 400;
            if (filterObj.calories === '400to600') return kcal >= 400 && kcal <= 600;
            if (filterObj.calories === 'over600') return kcal > 600;
            return true;
          });
        }
        // Difficulty
        if (filterObj.difficulty) {
          result = result.filter(r => r.difficulty.toLowerCase() === filterObj.difficulty.toLowerCase());
        }
      }
    }
    if (sort === 'time') {
      result.sort((a, b) => parseInt(a.cookingTime) - parseInt(b.cookingTime));
    } else if (sort === 'popularity') {
      result.sort((a, b) => b.popularity - a.popularity);
    }
    setFiltered(result);
  }, [recipes, search, filterObj, sort, ingredients, ingredientMode]);

  const handleFilterChange = (filters: RecipeFilterOptions) => {
    setFilterObj(filters);
  };

  const handleIngredientSearch = () => {
    setIngredientMode(true);
  };

  const handleAddMissingToShopping = (missing: string[]) => {
    // For demo: just alert, but could integrate with shopping list context
    alert('Added to shopping list: ' + missing.join(', '));
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <RecipeFilter onFilterChange={handleFilterChange} onSortChange={setSort} />
      </div>
      <div className={styles.main}>
        <h1 className={styles.heading}>All Recipes</h1>
        <IngredientInput
          ingredients={ingredients}
          onChange={ings => { setIngredients(ings); setIngredientMode(false); }}
          onSearch={handleIngredientSearch}
        />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search recipes..."
        />
        <div className={styles.grid}>
          {ingredientMode && ingredients.length > 0 && matchedRecipes.length > 0 ? (
            matchedRecipes.filter(m => m.matchCount > 0).map(({ recipe, matchPercent, missingIngredients }) => (
              <div key={recipe.id} className={styles.recipeCardWrapper}>
                <RecipeCard
                  image={recipe.image}
                  name={recipe.name}
                  cookingTime={recipe.cookingTime + ' min'}
                  difficulty={recipe.difficulty}
                />
                <div className={styles.matchPercent}>
                  {matchPercent}% match
                </div>
                {missingIngredients.length > 0 && (
                  <div className={styles.missingIngredients}>
                    Missing: {missingIngredients.join(', ')}
                    <button
                      className={styles.addMissingBtn}
                      onClick={() => handleAddMissingToShopping(missingIngredients)}
                    >
                      Add missing to shopping list
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            filtered.map(recipe => (
              <RecipeCard
                key={recipe.id}
                image={recipe.image}
                name={recipe.name}
                cookingTime={recipe.cookingTime + ' min'}
                difficulty={recipe.difficulty}
              />
            ))
          )}
        </div>
        {filtered.length === 0 && <p className={styles.empty}>No recipes found.</p>}
      </div>
    </div>
  );
};

export default RecipesPage; 