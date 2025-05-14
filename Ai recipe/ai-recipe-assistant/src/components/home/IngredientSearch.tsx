import React, { useState } from 'react';
import IngredientInput from '../recipe/IngredientInput';

const IngredientSearch = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);

  const handleSearch = () => {
    // Placeholder for search logic
    alert('Searching recipes with: ' + ingredients.join(', '));
  };

  return (
    <section className="mb-8 bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-2">What&apos;s in your kitchen?</h2>
      <IngredientInput
        ingredients={ingredients}
        onChange={setIngredients}
        onSearch={handleSearch}
      />
    </section>
  );
};

export default IngredientSearch; 