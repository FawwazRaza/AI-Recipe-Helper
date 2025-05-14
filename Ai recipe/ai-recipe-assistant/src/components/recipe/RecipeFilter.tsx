import React, { useState } from 'react';
import styles from './RecipeFilter.module.css';

export interface RecipeFilterOptions {
  diet: string[];
  cookingTime: string;
  cuisine: string;
  mealType: string;
  calories: string;
  difficulty: string;
}

interface RecipeFilterProps {
  onFilterChange: (filters: RecipeFilterOptions) => void;
  onSortChange: (sort: string) => void;
}

const CUISINES = ['Italian', 'Mexican', 'Asian', 'Indian', 'American'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const RecipeFilter: React.FC<RecipeFilterProps> = ({ onFilterChange, onSortChange }) => {
  const [diet, setDiet] = useState<string[]>([]);
  const [cookingTime, setCookingTime] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [mealType, setMealType] = useState('');
  const [calories, setCalories] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const handleDietChange = (d: string) => {
    setDiet(prev => {
      const next = prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d];
      onFilterChange({ diet: next, cookingTime, cuisine, mealType, calories, difficulty });
      return next;
    });
  };
  const handleChange = (type: string, value: string) => {
    if (type === 'cookingTime') setCookingTime(value);
    if (type === 'cuisine') setCuisine(value);
    if (type === 'mealType') setMealType(value);
    if (type === 'calories') setCalories(value);
    if (type === 'difficulty') setDifficulty(value);
    onFilterChange({
      diet,
      cookingTime: type === 'cookingTime' ? value : cookingTime,
      cuisine: type === 'cuisine' ? value : cuisine,
      mealType: type === 'mealType' ? value : mealType,
      calories: type === 'calories' ? value : calories,
      difficulty: type === 'difficulty' ? value : difficulty,
    });
  };

  return (
    <aside className={styles.sidebar}>
      <h3 className={styles.heading}>Filters</h3>
      <div className={styles.section}>
        <label className={styles.label}>Dietary Restrictions</label>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}><input type="checkbox" checked={diet.includes('vegetarian')} onChange={() => handleDietChange('vegetarian')} /> Vegetarian</label>
          <label className={styles.checkboxLabel}><input type="checkbox" checked={diet.includes('vegan')} onChange={() => handleDietChange('vegan')} /> Vegan</label>
          <label className={styles.checkboxLabel}><input type="checkbox" checked={diet.includes('gluten-free')} onChange={() => handleDietChange('gluten-free')} /> Gluten-Free</label>
        </div>
      </div>
      <div className={styles.section}>
        <label className={styles.label}>Cooking Time</label>
        <select className={styles.select} value={cookingTime} onChange={e => handleChange('cookingTime', e.target.value)}>
          <option value="">Any</option>
          <option value="under30">Under 30 min</option>
          <option value="30to60">30-60 min</option>
          <option value="over60">Over 60 min</option>
        </select>
      </div>
      <div className={styles.section}>
        <label className={styles.label}>Cuisine Type</label>
        <select className={styles.select} value={cuisine} onChange={e => handleChange('cuisine', e.target.value)}>
          <option value="">Any</option>
          {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className={styles.section}>
        <label className={styles.label}>Meal Type</label>
        <select className={styles.select} value={mealType} onChange={e => handleChange('mealType', e.target.value)}>
          <option value="">Any</option>
          {MEAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className={styles.section}>
        <label className={styles.label}>Calorie Range</label>
        <select className={styles.select} value={calories} onChange={e => handleChange('calories', e.target.value)}>
          <option value="">Any</option>
          <option value="under400">Under 400 kcal</option>
          <option value="400to600">400-600 kcal</option>
          <option value="over600">Over 600 kcal</option>
        </select>
      </div>
      <div className={styles.section}>
        <label className={styles.label}>Difficulty</label>
        <select className={styles.select} value={difficulty} onChange={e => handleChange('difficulty', e.target.value)}>
          <option value="">Any</option>
          {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>
      <div className={styles.section}>
        <label className={styles.label}>Sort By</label>
        <select className={styles.select} onChange={e => onSortChange(e.target.value)}>
          <option value="time">Preparation Time</option>
          <option value="popularity">Popularity</option>
        </select>
      </div>
    </aside>
  );
};

export default RecipeFilter; 