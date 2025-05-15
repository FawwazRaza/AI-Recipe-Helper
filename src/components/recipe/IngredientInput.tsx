import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const COMMON_INGREDIENTS = [
  'Eggs', 'Milk', 'Butter', 'Chicken', 'Tomato', 'Onion', 'Garlic', 'Cheese', 'Rice', 'Potato',
];

const INGREDIENT_CATEGORIES = {
  Produce: ['Tomato', 'Onion', 'Garlic', 'Potato', 'Spinach', 'Avocado'],
  Dairy: ['Milk', 'Butter', 'Cheese', 'Yogurt', 'Parmesan'],
  Proteins: ['Chicken', 'Eggs', 'Chickpeas', 'Pancetta'],
  Grains: ['Rice', 'Quinoa', 'Spaghetti'],
};

interface IngredientInputProps {
  ingredients: string[];
  onChange: (ings: string[]) => void;
  onSearch: () => void;
}

const IngredientInput: React.FC<IngredientInputProps> = ({ ingredients, onChange, onSearch }) => {
  const [input, setInput] = useState('');

  const addIngredient = (ing: string) => {
    if (ing && !ingredients.includes(ing)) {
      onChange([...ingredients, ing]);
      setInput('');
    }
  };

  const removeIngredient = (ing: string) => {
    onChange(ingredients.filter(i => i !== ing));
  };

  return (
    <div className="mb-4 bg-white rounded-lg shadow p-4">
      <div className="flex gap-2 mb-2">
        <Input
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          placeholder="Add an ingredient..."
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') addIngredient(input);
          }}
        />
        <Button onClick={() => addIngredient(input)}>Add</Button>
      </div>
      <div className="mb-2">
        <div className="font-semibold mb-1">Quick Add:</div>
        <div className="flex flex-wrap gap-2">
          {COMMON_INGREDIENTS.map(ing => (
            <Button key={ing} variant="outline" onClick={() => addIngredient(ing)}>{ing}</Button>
          ))}
        </div>
      </div>
      <div className="mb-2">
        <div className="font-semibold mb-1">Categories:</div>
        <div className="flex flex-wrap gap-4">
          {Object.entries(INGREDIENT_CATEGORIES).map(([cat, ings]) => (
            <div key={cat}>
              <div className="text-sm font-medium mb-1">{cat}</div>
              <div className="flex flex-wrap gap-1">
                {ings.map(ing => (
                  <Button key={ing} variant="outline" onClick={() => addIngredient(ing)}>{ing}</Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        {ingredients.map((ing, idx) => (
          <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center">
            {ing}
            <button className="ml-1 text-xs" onClick={() => removeIngredient(ing)}>&times;</button>
          </span>
        ))}
      </div>
      <Button variant="primary" onClick={onSearch}>What can I make?</Button>
    </div>
  );
};

export default IngredientInput; 
