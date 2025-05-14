import React, { useState, useEffect, useMemo } from 'react';
import styles from '../components/meal-planner/MealPlanner.module.css';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import useSWR from 'swr';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const TEMPLATES = [
  { label: 'Balanced', value: 'balanced' },
  { label: 'Weight Loss', value: 'weightloss' },
  { label: 'High Protein', value: 'highprotein' },
  { label: 'Vegetarian/Vegan', value: 'vegetarian' },
  { label: 'Quick & Easy', value: 'quick' },
];

const ShoppingListModal = dynamic(() => import('../components/meal-planner/ShoppingListModal'));

// Simple ingredient category mapping
const INGREDIENT_CATEGORIES = {
  'egg': 'Dairy',
  'milk': 'Dairy',
  'cheese': 'Dairy',
  'yogurt': 'Dairy',
  'butter': 'Dairy',
  'chicken': 'Protein',
  'beef': 'Protein',
  'pancetta': 'Protein',
  'quinoa': 'Grains',
  'spaghetti': 'Grains',
  'rice': 'Grains',
  'bread': 'Grains',
  'spinach': 'Produce',
  'avocado': 'Produce',
  'tomato': 'Produce',
  'chickpeas': 'Produce',
  'fruit': 'Produce',
  'parmesan': 'Dairy',
  'lettuce': 'Produce',
  'carrot': 'Produce',
  'onion': 'Produce',
  'potato': 'Produce',
  'tofu': 'Protein',
  'beans': 'Produce',
  'oil': 'Pantry',
  'salt': 'Pantry',
  'pepper': 'Pantry',
  'spices': 'Pantry',
  // ...add more as needed
};

function getEmptyPlan() {
  return DAYS.map(day => ({
    day,
    meals: MEALS.reduce((acc, meal) => ({ ...acc, [meal]: null }), {}),
  }));
}

function planToCSV(plan) {
  let csv = 'Day,Meal,Recipe\n';
  plan.forEach(dayObj => {
    Object.entries(dayObj.meals).forEach(([meal, recipe]) => {
      csv += `${dayObj.day},${meal},${recipe ? recipe.name : ''}\n`;
    });
  });
  return csv;
}

function planToText(plan) {
  return plan.map(dayObj => {
    const meals = Object.entries(dayObj.meals)
      .map(([meal, recipe]) => `  ${meal}: ${recipe ? recipe.name : ''}`)
      .join('\n');
    return `${dayObj.day}:\n${meals}`;
  }).join('\n\n');
}

function getShoppingList(plan) {
  // Consolidate all ingredients from planned meals
  const items = {};
  plan.forEach(dayObj => {
    Object.values(dayObj.meals).forEach(recipe => {
      if (recipe && recipe.ingredients) {
        recipe.ingredients.forEach(ing => {
          const key = ing.name.toLowerCase();
          const category = INGREDIENT_CATEGORIES[key] || 'Other';
          if (!items[key]) {
            items[key] = { name: ing.name, quantity: ing.quantity ? [ing.quantity] : [], checked: false, category };
          } else if (ing.quantity) {
            items[key].quantity.push(ing.quantity);
          }
        });
      }
    });
  });
  // Try to sum quantities if possible (simple sum for numbers + same unit)
  Object.values(items).forEach(item => {
    if (item.quantity.length > 1) {
      const match = item.quantity[0].match(/^(\d+)(\w*)/);
      if (match) {
        const unit = match[2];
        let total = 0;
        let canSum = true;
        item.quantity.forEach(q => {
          const m = q.match(/^(\d+)(\w*)/);
          if (!m || m[2] !== unit) canSum = false;
        });
        if (canSum) {
          total = item.quantity.reduce((sum, q) => sum + parseInt(q), 0);
          item.quantity = [`${total}${unit}`];
        }
      }
    }
    if (item.quantity.length > 1) item.quantity = [item.quantity.join(' + ')];
  });
  // Group by category
  const grouped = {};
  Object.values(items).forEach(item => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });
  return grouped;
}

// Persistent shopping list (localStorage placeholder)
function saveShoppingList(list) {
  localStorage.setItem('shoppingList', JSON.stringify(list));
}
function loadShoppingList() {
  try {
    return JSON.parse(localStorage.getItem('shoppingList')) || {};
  } catch {
    return {};
  }
}

function getUserTemplates() {
  try {
    return JSON.parse(localStorage.getItem('userTemplates')) || [];
  } catch {
    return [];
  }
}
function saveUserTemplates(templates) {
  localStorage.setItem('userTemplates', JSON.stringify(templates));
}

function loadNutritionSettings() {
  try {
    return JSON.parse(localStorage.getItem('nutritionSettings')) || {};
  } catch {
    return {};
  }
}

const MealPlanner = () => {
  const [plan, setPlan] = useState(getEmptyPlan());
  const [draggedRecipe, setDraggedRecipe] = useState(null);
  const [dragSource, setDragSource] = useState(null); // { type: 'list' | 'cell', dayIdx, meal }
  const [previewRecipe, setPreviewRecipe] = useState(null);
  const [search, setSearch] = useState('');
  const [dragOverRemove, setDragOverRemove] = useState(false);
  const [dragOverCell, setDragOverCell] = useState({ dayIdx: null, meal: null });
  const [copied, setCopied] = useState(false);
  const [showShopping, setShowShopping] = useState(false);
  const [persistedShopping, setPersistedShopping] = useState({});
  const [activeTemplate, setActiveTemplate] = useState('');
  const [userTemplates, setUserTemplates] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [editTemplateIdx, setEditTemplateIdx] = useState(null);
  const [editTemplateName, setEditTemplateName] = useState('');
  const [nutritionSettings, setNutritionSettings] = useState({});
  const [mounted, setMounted] = useState(false);

  const { data: recipes = [] } = useSWR('/data/recipes.json', (url: string) => fetch(url).then(res => res.json()), { revalidateOnFocus: false });

  useEffect(() => {
    setMounted(true);
    setUserTemplates(getUserTemplates());
    setPersistedShopping(loadShoppingList());
    setNutritionSettings(loadNutritionSettings());
  }, []);

  const filteredRecipes = useMemo(() => recipes.filter(r => r.name.toLowerCase().includes(search.toLowerCase())), [recipes, search]);

  // Helper to check if a recipe matches restrictions
  function matchesRestrictions(recipe) {
    if (!nutritionSettings || !nutritionSettings.restrictions) return true;
    if (nutritionSettings.restrictions.vegetarian && !(recipe.diet && recipe.diet.includes('vegetarian'))) return false;
    if (nutritionSettings.restrictions.vegan && !(recipe.diet && recipe.diet.includes('vegan'))) return false;
    if (nutritionSettings.restrictions.glutenFree && !(recipe.diet && recipe.diet.includes('gluten-free'))) return false;
    // Optionally add dairyFree/nutFree if recipes support
    return true;
  }
  // Helper to check if a recipe matches focus
  function matchesFocus(recipe) {
    if (!nutritionSettings || !nutritionSettings.focus) return true;
    if (nutritionSettings.focus.highProtein && recipe.nutrition?.toLowerCase().includes('protein')) return true;
    if (nutritionSettings.focus.lowSugar && recipe.nutrition?.toLowerCase().includes('sugar')) return true;
    if (nutritionSettings.focus.highFiber && recipe.nutrition?.toLowerCase().includes('fiber')) return true;
    return false;
  }

  // --- Template logic ---
  function getTemplateRecipes(template) {
    if (!recipes.length) return [];
    let pool = recipes.filter(matchesRestrictions);
    switch (template) {
      case 'balanced':
        break;
      case 'weightloss':
        pool = pool.filter(r => {
          const kcal = parseInt((r.nutrition||'').match(/(\d+)/)?.[1] || '0');
          return kcal > 0 && kcal <= 450;
        });
        break;
      case 'highprotein':
        pool = pool.filter(r => matchesFocus(r) || (r.diet && r.diet.includes('high-protein')));
        break;
      case 'vegetarian':
        pool = pool.filter(r => (r.diet && (r.diet.includes('vegetarian') || r.diet.includes('vegan'))));
        break;
      case 'quick':
        pool = pool.filter(r => parseInt(r.cookingTime) <= 25 || (r.difficulty && r.difficulty.toLowerCase() === 'easy'));
        break;
      default:
        break;
    }
    // Prefer recipes matching focus if possible
    if (nutritionSettings && nutritionSettings.focus && Object.values(nutritionSettings.focus).some(Boolean)) {
      const focusPool = pool.filter(matchesFocus);
      if (focusPool.length > 0) return focusPool;
    }
    return pool;
  }

  function applyTemplate(template) {
    const pool = getTemplateRecipes(template);
    setPlan(plan => plan.map(day => ({
      ...day,
      meals: MEALS.reduce((acc, meal) => ({
        ...acc,
        [meal]: pool.length ? pool[Math.floor(Math.random() * pool.length)] : null
      }), {})
    })));
    setActiveTemplate(template);
  }

  // --- End template logic ---

  // --- User template logic ---
  function saveCurrentAsTemplate(name) {
    const template = { name, plan };
    const updated = [...userTemplates, template];
    setUserTemplates(updated);
    saveUserTemplates(updated);
  }
  function applyUserTemplate(idx) {
    setPlan(userTemplates[idx].plan);
    setActiveTemplate('user-' + idx);
  }
  function deleteUserTemplate(idx) {
    const updated = userTemplates.filter((_, i) => i !== idx);
    setUserTemplates(updated);
    saveUserTemplates(updated);
    if (activeTemplate === 'user-' + idx) setActiveTemplate('');
  }
  function startEditTemplate(idx) {
    setEditTemplateIdx(idx);
    setEditTemplateName(userTemplates[idx].name);
  }
  function saveEditTemplate() {
    const updated = userTemplates.map((t, i) => i === editTemplateIdx ? { ...t, name: editTemplateName } : t);
    setUserTemplates(updated);
    saveUserTemplates(updated);
    setEditTemplateIdx(null);
    setEditTemplateName('');
  }
  // --- End user template logic ---

  const handleDrop = (dayIdx, meal) => {
    if (!draggedRecipe) return;
    setPlan(plan => plan.map((d, i) => {
      if (i !== dayIdx) return d;
      // If dragging from another cell, remove from source
      if (dragSource && dragSource.type === 'cell') {
        const newPlan = plan.map((d2, i2) => {
          if (i2 === dragSource.dayIdx) {
            return { ...d2, meals: { ...d2.meals, [dragSource.meal]: null } };
          }
          return d2;
        });
        newPlan[i] = { ...newPlan[i], meals: { ...newPlan[i].meals, [meal]: draggedRecipe } };
        return newPlan[i];
      }
      // If dragging from list, just set
      return { ...d, meals: { ...d.meals, [meal]: draggedRecipe } };
    }));
    setDraggedRecipe(null);
    setDragSource(null);
    setDragOverCell({ dayIdx: null, meal: null });
  };

  const handleDragStartFromList = recipe => {
    setDraggedRecipe(recipe);
    setDragSource({ type: 'list' });
  };
  const handleDragStartFromCell = (recipe, dayIdx, meal) => {
    setDraggedRecipe(recipe);
    setDragSource({ type: 'cell', dayIdx, meal });
  };

  const handleRemoveDrop = () => {
    if (dragSource && dragSource.type === 'cell') {
      setPlan(plan => plan.map((d, i) =>
        i === dragSource.dayIdx ? { ...d, meals: { ...d.meals, [dragSource.meal]: null } } : d
      ));
    }
    setDraggedRecipe(null);
    setDragSource(null);
    setDragOverRemove(false);
  };

  const handleClear = () => setPlan(getEmptyPlan());
  const handleRandomize = () => {
    setPlan(plan => plan.map(day => ({
      ...day,
      meals: MEALS.reduce((acc, meal) => ({
        ...acc,
        [meal]: recipes.length ? recipes[Math.floor(Math.random() * recipes.length)] : null
      }), {})
    })));
  };

  const handleExportCSV = () => {
    const csv = planToCSV(plan);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meal-plan.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const text = planToText(plan);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleShowShopping = () => setShowShopping(true);
  const handleCloseShopping = () => setShowShopping(false);

  // Placeholder for future user account integration
  // (e.g., sync shopping list to user profile)

  if (!mounted) return <div style={{textAlign:'center',marginTop:'3rem',fontSize:'1.2rem'}}>Loading...</div>;

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.heading}>Weekly Meal Planner</h1>
      <div className={styles.actions}>
        <select
          className={styles.templateSelect}
          value={activeTemplate.startsWith('user-') ? '' : activeTemplate}
          onChange={e => applyTemplate(e.target.value)}
        >
          <option value="">Choose Template…</option>
          {TEMPLATES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select
          className={styles.templateSelect}
          value={activeTemplate.startsWith('user-') ? activeTemplate : ''}
          onChange={e => {
            const idx = parseInt(e.target.value.replace('user-', ''));
            if (!isNaN(idx)) applyUserTemplate(idx);
          }}
        >
          <option value="">User Templates…</option>
          {userTemplates.map((t, i) => (
            <option key={i} value={`user-${i}`}>{t.name}</option>
          ))}
        </select>
        <button className={styles.btn} onClick={() => setShowSaveModal(true)}>Save as Template</button>
        {activeTemplate && (
          <span className={styles.activeTemplateLabel}>
            {activeTemplate.startsWith('user-')
              ? userTemplates[parseInt(activeTemplate.replace('user-', ''))]?.name + ' (custom template)'
              : TEMPLATES.find(t => t.value === activeTemplate)?.label + ' template applied'}
          </span>
        )}
        <button className={styles.btn} onClick={handleClear}>Clear</button>
        <button className={styles.btn} onClick={handleRandomize}>Randomize</button>
        <button className={styles.btn} onClick={handleExportCSV}>Export CSV</button>
        <button className={styles.btn} onClick={handleCopy}>{copied ? 'Copied!' : 'Copy Plan'}</button>
        <button className={styles.btn} onClick={handleShowShopping}>Shopping List</button>
      </div>
      {/* User template list for edit/delete */}
      {userTemplates.length > 0 && (
        <div className={styles.userTemplateList}>
          <strong>Your Templates:</strong>
          <ul className={styles.userTemplateUl}>
            {userTemplates.map((t, i) => (
              <li key={i} className={styles.userTemplateItem}>
                {editTemplateIdx === i ? (
                  <>
                    <input
                      className={styles.userTemplateInput}
                      value={editTemplateName}
                      onChange={e => setEditTemplateName(e.target.value)}
                    />
                    <button className={styles.btn} onClick={saveEditTemplate}>Save</button>
                    <button className={styles.btn} onClick={() => setEditTemplateIdx(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span className={styles.userTemplateName}>{t.name}</span>
                    <button className={styles.btn} onClick={() => applyUserTemplate(i)}>Apply</button>
                    <button className={styles.btn} onClick={() => startEditTemplate(i)}>Edit</button>
                    <button className={styles.btn} onClick={() => deleteUserTemplate(i)}>Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Save template modal */}
      {showSaveModal && (
        <div className={styles.overlay}>
          <div className={styles.modal} style={{ minWidth: 320, maxWidth: 400 }}>
            <button className={styles.close} onClick={() => setShowSaveModal(false)} aria-label="Close">×</button>
            <h3 className={styles.heading}>Save as Template</h3>
            <input
              className={styles.userTemplateInput}
              placeholder="Template name"
              value={newTemplateName}
              onChange={e => setNewTemplateName(e.target.value)}
            />
            <div className={styles.actions}>
              <button
                className={styles.btn}
                onClick={() => {
                  if (newTemplateName.trim()) {
                    saveCurrentAsTemplate(newTemplateName.trim());
                    setNewTemplateName('');
                    setShowSaveModal(false);
                  }
                }}
              >Save</button>
              <button className={styles.btn} onClick={() => setShowSaveModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className={styles.grid}>
        <div className={styles.daysHeader}>
          <div className={styles.corner}></div>
          {DAYS.map(day => (
            <div key={day} className={styles.dayHeader}>{day}</div>
          ))}
        </div>
        {MEALS.map(meal => (
          <div key={meal} className={styles.mealRow}>
            <div className={styles.mealHeader}>{meal}</div>
            {plan.map((d, dayIdx) => (
              <div
                key={d.day + meal}
                className={
                  styles.cell +
                  (dragOverCell.dayIdx === dayIdx && dragOverCell.meal === meal ? ' ' + styles.cellDragOver : '')
                }
                onDragOver={e => {
                  e.preventDefault();
                  setDragOverCell({ dayIdx, meal });
                }}
                onDrop={() => handleDrop(dayIdx, meal)}
                onDragLeave={() => setDragOverCell({ dayIdx: null, meal: null })}
                onMouseEnter={() => setPreviewRecipe(d.meals[meal])}
                onMouseLeave={() => setPreviewRecipe(null)}
              >
                {d.meals[meal] ? (
                  <div
                    className={styles.recipeCard}
                    draggable
                    onDragStart={() => handleDragStartFromCell(d.meals[meal], dayIdx, meal)}
                    onDragEnd={() => {
                      setDraggedRecipe(null);
                      setDragSource(null);
                    }}
                    onMouseEnter={() => setPreviewRecipe(d.meals[meal])}
                    onMouseLeave={() => setPreviewRecipe(null)}
                  >
                    <Image src={d.meals[meal].image} alt={d.meals[meal].name} className={styles.recipeImg} width={60} height={40} loading="lazy" />
                    <div className={styles.recipeName}>{d.meals[meal].name}</div>
                  </div>
                ) : (
                  <div className={styles.emptyCell}>Drop recipe here</div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className={styles.recipeListSection}>
        <h2 className={styles.subheading}>Available Recipes</h2>
        <input
          className={styles.search}
          type="text"
          placeholder="Search recipes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className={styles.recipeList}>
          {filteredRecipes.map(recipe => (
            <div
              key={recipe.id}
              className={styles.recipeCard}
              draggable
              onDragStart={() => handleDragStartFromList(recipe)}
              onDragEnd={() => {
                setDraggedRecipe(null);
                setDragSource(null);
              }}
              onMouseEnter={() => setPreviewRecipe(recipe)}
              onMouseLeave={() => setPreviewRecipe(null)}
            >
              <Image src={recipe.image} alt={recipe.name} className={styles.recipeImg} width={60} height={40} loading="lazy" />
              <div className={styles.recipeName}>{recipe.name}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Drag-to-remove area */}
      {draggedRecipe && dragSource && dragSource.type === 'cell' && (
        <div
          className={dragOverRemove ? styles.removeAreaActive : styles.removeArea}
          onDragOver={e => {
            e.preventDefault();
            setDragOverRemove(true);
          }}
          onDrop={handleRemoveDrop}
          onDragLeave={() => setDragOverRemove(false)}
        >
          Drop here to remove from plan
        </div>
      )}
      {previewRecipe && (
        <div className={styles.preview}>
          <Image src={previewRecipe.image} alt={previewRecipe.name} className={styles.previewImg} width={180} height={120} loading="lazy" />
          <div className={styles.previewName}>{previewRecipe.name}</div>
        </div>
      )}
      <ShoppingListModal
        open={showShopping}
        onClose={handleCloseShopping}
        shoppingList={getShoppingList(plan)}
      />
      <div className={styles.complianceSummary}>
        <h3>Plan Compliance</h3>
        <ul>
          {nutritionSettings && nutritionSettings.restrictions && Object.entries(nutritionSettings.restrictions).map(([key, val]) => val && <li key={key}>All meals are {key.replace(/([A-Z])/g, ' $1')}</li>)}
          {nutritionSettings && nutritionSettings.focus && Object.entries(nutritionSettings.focus).map(([key, val]) => val && <li key={key}>Plan includes focus: {key.replace(/([A-Z])/g, ' $1')}</li>)}
        </ul>
      </div>
    </div>
  );
};

export default MealPlanner; 