import React, { useState } from 'react';
import Image from 'next/image';

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

function parseQuantity(quantity: string) {
  // Only parse numbers, leave 'to taste' and similar as is
  const match = quantity.match(/^(\d+)([a-zA-Z]*)$/);
  if (!match) return null;
  return { value: Number(match[1]), unit: match[2] };
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ image, name, ingredients, instructions, nutrition, cookingTime, difficulty, servings = 2 }) => {
  const [currentServings, setCurrentServings] = useState(servings);
  const ratio = currentServings / servings;

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-background-dark rounded-lg shadow p-6">
      <Image src={image} alt={name} width={600} height={400} className="rounded-lg w-full h-64 object-cover mb-4" />
      <h2 className="text-2xl font-bold mb-2">{name}</h2>
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-4">
        <span>⏱ {cookingTime} min</span>
        <span>⭐ {difficulty}</span>
        <span>🍽
          <button onClick={() => setCurrentServings(s => Math.max(1, s - 1))} className="px-2">-</button>
          {currentServings} servings
          <button onClick={() => setCurrentServings(s => s + 1)} className="px-2">+</button>
        </span>
      </div>
      <h3 className="font-semibold mb-1">Ingredients</h3>
      <ul className="mb-4 list-disc list-inside">
        {ingredients.map((ing, idx) => {
          const parsed = parseQuantity(ing.quantity);
          return (
            <li key={idx}>
              {parsed ? `${Math.round(parsed.value * ratio * 100) / 100}${parsed.unit}` : ing.quantity} {ing.name}
            </li>
          );
        })}
      </ul>
      <h3 className="font-semibold mb-1">Instructions</h3>
      <ol className="mb-4 list-decimal list-inside">
        {instructions.map((step, idx) => (
          <li key={idx}>{step}</li>
        ))}
      </ol>
      <div className="mb-2"><strong>Nutrition:</strong> {nutrition}</div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save to Meal Plan</button>
    </div>
  );
};

export default RecipeDetail; 