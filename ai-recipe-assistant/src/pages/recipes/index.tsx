import React, { useEffect, useState } from 'react';
import RecipeCard from '../../components/recipe/RecipeCard';
import RecipeFilter, { RecipeFilterOptions } from '../../components/recipe/RecipeFilter';
import Input from '../../components/ui/Input';
import IngredientInput from '../../components/recipe/IngredientInput';
import styles from './RecipesPage.module.css';
import useSWR from 'swr';
import Button from '../../components/ui/Button';

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

const fetcher = (url: string) => fetch(url).then(res => res.json());

function loadNutritionSettings() {
  try {
    return JSON.parse(localStorage.getItem('nutritionSettings')) || {};
  } catch {
    return {};
  }
}

const RecipesPage = () => {
  const { data: recipes = [], error, isLoading } = useSWR<Recipe[]>('/data/recipes.json', fetcher, { revalidateOnFocus: false });
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
  const [nutritionSettings, setNutritionSettings] = useState(loadNutritionSettings());

  useEffect(() => {
    setNutritionSettings(loadNutritionSettings());
  }, []);

  useEffect(() => {
    if (nutritionSettings && nutritionSettings.restrictions) {
      const diet = [];
      if (nutritionSettings.restrictions.vegetarian) diet.push('vegetarian');
      if (nutritionSettings.restrictions.vegan) diet.push('vegan');
      if (nutritionSettings.restrictions.glutenFree) diet.push('gluten-free');
      // Optionally add dairyFree/nutFree if recipes support
      setFilterObj(f => ({ ...f, diet }));
    }
  }, [nutritionSettings]);

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
    // Filter out recipes that don't match restrictions
    if (nutritionSettings && nutritionSettings.restrictions) {
      if (nutritionSettings.restrictions.vegetarian) result = result.filter(r => r.diet.includes('vegetarian'));
      if (nutritionSettings.restrictions.vegan) result = result.filter(r => r.diet.includes('vegan'));
      if (nutritionSettings.restrictions.glutenFree) result = result.filter(r => r.diet.includes('gluten-free'));
      // Optionally add dairyFree/nutFree if recipes support
    }
    if (sort === 'time') {
      result.sort((a, b) => parseInt(a.cookingTime) - parseInt(b.cookingTime));
    } else if (sort === 'popularity') {
      result.sort((a, b) => b.popularity - a.popularity);
    }
    setFiltered(result);
  }, [recipes, search, filterObj, sort, ingredients, ingredientMode, nutritionSettings]);

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
    <div className={styles.wrapper}>
      <h1 className={styles.heading}>All Recipes</h1>
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <RecipeFilter onFilterChange={handleFilterChange} onSortChange={setSort} />
        </div>
        <div className={styles.main}>
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
          <div className={styles.recipeList} aria-live="polite">
            {isLoading && <div className={styles.spinner} aria-label="Loading recipes..." role="status" />}
            {error && <div className={styles.error} role="alert">Failed to load recipes. Please try again later.</div>}
            {!isLoading && !error && filtered.length === 0 && <p className={styles.empty}>No recipes found.</p>}
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
                    {/* Focus badges */}
                    <div style={{ marginTop: 4 }}>
                      {nutritionSettings?.focus?.highProtein && recipe.nutrition?.toLowerCase().includes('protein') && <span className={styles.focusBadge}>High Protein</span>}
                      {nutritionSettings?.focus?.lowSugar && recipe.nutrition?.toLowerCase().includes('sugar') && <span className={styles.focusBadge}>Low Sugar</span>}
                      {nutritionSettings?.focus?.highFiber && recipe.nutrition?.toLowerCase().includes('fiber') && <span className={styles.focusBadge}>High Fiber</span>}
                    </div>
                  </div>
                ))
              ) : (
                filtered.map(recipe => (
                  <div key={recipe.id} className={styles.recipeCardWrapper}>
                    <RecipeCard
                      image={recipe.image}
                      name={recipe.name}
                      cookingTime={recipe.cookingTime + ' min'}
                      difficulty={recipe.difficulty}
                    />
                    {/* Focus badges */}
                    <div style={{ marginTop: 4 }}>
                      {nutritionSettings?.focus?.highProtein && recipe.nutrition?.toLowerCase().includes('protein') && <span className={styles.focusBadge}>High Protein</span>}
                      {nutritionSettings?.focus?.lowSugar && recipe.nutrition?.toLowerCase().includes('sugar') && <span className={styles.focusBadge}>Low Sugar</span>}
                      {nutritionSettings?.focus?.highFiber && recipe.nutrition?.toLowerCase().includes('fiber') && <span className={styles.focusBadge}>High Fiber</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
            {filtered.length === 0 && <p className={styles.empty}>No recipes found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipesPage; 