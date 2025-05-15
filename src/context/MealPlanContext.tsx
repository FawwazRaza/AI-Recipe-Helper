import React, { createContext, useContext, useState } from 'react';

// Placeholder type for MealPlan, update as needed
interface MealPlan {
  [key: string]: unknown;
}

interface MealPlanContextType {
  mealPlan: MealPlan[];
  setMealPlan: React.Dispatch<React.SetStateAction<MealPlan[]>>;
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

export const useMealPlanContext = () => {
  const ctx = useContext(MealPlanContext);
  if (!ctx) throw new Error('useMealPlanContext must be used within a MealPlanProvider');
  return ctx;
};

export const MealPlanProvider = ({ children }: { children: React.ReactNode }) => {
  const [mealPlan, setMealPlan] = useState<MealPlan[]>([]);
  return (
    <MealPlanContext.Provider value={{ mealPlan, setMealPlan }}>
      {children}
    </MealPlanContext.Provider>
  );
}; 