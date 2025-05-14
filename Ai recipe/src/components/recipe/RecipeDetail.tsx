import React, { useState } from 'react';
import Image from 'next/image';
import styles from './RecipeDetail.module.css';

interface Ingredient {
  name: string;
  quantity: string;
}

interface RecipeDetailProps {
  image: string;
  name: string;
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: string;
  cookingTime: string;
  difficulty: string;
  servings?: number;
}

// Add index signature to fix TS error
interface NutritionDB {
  [key: string]: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    allergens: string[];
  };
}

// Simple nutrition database (per 100g or per unit)
const NUTRITION_DB: NutritionDB = {
  'egg': { calories: 70, protein: 6, carbs: 1, fat: 5, fiber: 0, sugar: 1, allergens: ['egg'] },
  'spaghetti': { calories: 158, protein: 6, carbs: 31, fat: 1, fiber: 2, sugar: 1, allergens: ['gluten'] },
  'pancetta': { calories: 500, protein: 37, carbs: 1, fat: 39, fiber: 0, sugar: 0, allergens: [] },
  'parmesan': { calories: 431, protein: 38, carbs: 4, fat: 29, fiber: 0, sugar: 0, allergens: ['dairy'] },
  'quinoa': { calories: 120, protein: 4, carbs: 21, fat: 2, fiber: 2, sugar: 0, allergens: [] },
  'chickpeas': { calories: 164, protein: 9, carbs: 27, fat: 3, fiber: 8, sugar: 5, allergens: [] },
  'avocado': { calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, sugar: 0, allergens: [] },
  'spinach': { calories: 23, protein: 3, carbs: 4, fat: 0, fiber: 2, sugar: 0, allergens: [] },
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 4, fiber: 0, sugar: 0, allergens: [] },
  'yogurt': { calories: 59, protein: 10, carbs: 3, fat: 0, fiber: 0, sugar: 3, allergens: ['dairy'] },
  'tomato puree': { calories: 38, protein: 2, carbs: 9, fat: 0, fiber: 2, sugar: 5, allergens: [] },
  // ...add more as needed
};

const ALLERGENS = ['egg', 'gluten', 'dairy', 'soy', 'peanut', 'tree nut', 'fish', 'shellfish'];

function parseQuantity(quantity: string) {
  // Only parse numbers, leave 'to taste' and similar as is
  const match = quantity.match(/^(\d+)([a-zA-Z]*)$/);
  if (!match) return null;
  return { value: Number(match[1]), unit: match[2] };
}

function analyzeNutrition(ingredients: Ingredient[], ratio: number) {
  let total = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 };
  let foundAllergens: string[] = [];
  ingredients.forEach(ing => {
    const key = ing.name.toLowerCase();
    const db = NUTRITION_DB[key];
    const parsed = parseQuantity(ing.quantity);
    let mult = 1;
    if (parsed) {
      if (parsed.unit === 'g') mult = (parsed.value * ratio) / 100;
      else mult = parsed.value * ratio; // assume per unit
    }
    if (db) {
      total.calories += db.calories * mult;
      total.protein += db.protein * mult;
      total.carbs += db.carbs * mult;
      total.fat += db.fat * mult;
      total.fiber += db.fiber * mult;
      total.sugar += db.sugar * mult;
      foundAllergens.push(...db.allergens);
    }
  });
  return { ...total, allergens: Array.from(new Set(foundAllergens)) };
}

function getBenefits(nutrition: any) {
  const benefits = [];
  if (nutrition.protein > 20) benefits.push('High Protein');
  if (nutrition.fiber > 5) benefits.push('High Fiber');
  if (nutrition.carbs < 20) benefits.push('Low Carb');
  if (nutrition.fat < 10) benefits.push('Low Fat');
  return benefits;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ image, name, ingredients, instructions, nutrition, cookingTime, difficulty, servings = 2 }) => {
  const [currentServings, setCurrentServings] = useState(servings);
  const ratio = currentServings / servings;
  const analysis = analyzeNutrition(ingredients, ratio);
  const benefits = getBenefits(analysis);

  return (
    <div className={styles.wrapper}>
      <Image src={image} alt={name} width={600} height={400} className={styles.image} loading="lazy" />
      <h2 className={styles.title}>{name}</h2>
      <div className={styles.meta}>
        <span>⏱ {cookingTime} min</span>
        <span>⭐ {difficulty}</span>
        <span>🍽
          <button onClick={() => setCurrentServings(s => Math.max(1, s - 1))} className={styles.servBtn}>-</button>
          {currentServings} servings
          <button onClick={() => setCurrentServings(s => s + 1)} className={styles.servBtn}>+</button>
        </span>
      </div>
      <h3 className={styles.sectionTitle}>Ingredients</h3>
      <ul className={styles.ingredientList}>
        {ingredients.map((ing, idx) => {
          const parsed = parseQuantity(ing.quantity);
          return (
            <li key={idx}>
              {parsed ? `${Math.round(parsed.value * ratio * 100) / 100}${parsed.unit}` : ing.quantity} {ing.name}
            </li>
          );
        })}
      </ul>
      <h3 className={styles.sectionTitle}>Instructions</h3>
      <ol className={styles.instructionList}>
        {instructions.map((step, idx) => (
          <li key={idx}>{step}</li>
        ))}
      </ol>
      <div className={styles.nutritionSection}>
        <h3>Nutrition Analysis</h3>
        <div className={styles.nutritionGrid}>
          <div><strong>Calories:</strong> {Math.round(analysis.calories)} kcal</div>
          <div><strong>Protein:</strong> {Math.round(analysis.protein)} g</div>
          <div><strong>Carbs:</strong> {Math.round(analysis.carbs)} g</div>
          <div><strong>Fat:</strong> {Math.round(analysis.fat)} g</div>
          <div><strong>Fiber:</strong> {Math.round(analysis.fiber)} g</div>
          <div><strong>Sugar:</strong> {Math.round(analysis.sugar)} g</div>
        </div>
        <div className={styles.benefits}>
          {benefits.length > 0 && <span className={styles.benefitLabel}>Benefits: {benefits.join(', ')}</span>}
        </div>
        <div className={styles.allergens}>
          {analysis.allergens.length > 0 && (
            <span className={styles.allergenLabel}>⚠ Allergens: {analysis.allergens.join(', ')}</span>
          )}
        </div>
      </div>
      <div className={styles.nutritionRaw}><strong>Nutrition (from data):</strong> {nutrition}</div>
      <button className={styles.saveBtn}>Save to Meal Plan</button>
    </div>
  );
};

export default RecipeDetail; 