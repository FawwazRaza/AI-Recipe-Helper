import React, { useState, useEffect, useMemo } from 'react';
import styles from '../components/meal-planner/NutritionDashboard.module.css';
import dynamic from 'next/dynamic';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

// Default daily goals
const DEFAULT_GOALS = { calories: 2000, protein: 75, carbs: 250, fat: 70, fiber: 30, sugar: 40 };

const DEFAULT_SETTINGS = {
  goals: { calories: 2000, protein: 75, carbs: 250, fat: 70, fiber: 30, sugar: 40 },
  macroMode: 'grams', // 'grams' or 'percent' or 'gkg'
  macroPercent: { protein: 15, carbs: 55, fat: 30 }, // % of calories
  macroGkg: { protein: 1.2, carbs: 4, fat: 0.8 }, // g/kg body weight
  bodyWeight: 70, // kg
  restrictions: { vegetarian: false, vegan: false, glutenFree: false, dairyFree: false, nutFree: false },
  focus: { highProtein: false, lowSugar: false, highFiber: false }
};

function loadGoals() {
  try {
    return JSON.parse(localStorage.getItem('nutritionGoals')) || DEFAULT_GOALS;
  } catch {
    return DEFAULT_GOALS;
  }
}
function saveGoals(goals) {
  localStorage.setItem('nutritionGoals', JSON.stringify(goals));
}

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem('nutritionSettings')) || DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
function saveSettings(settings) {
  localStorage.setItem('nutritionSettings', JSON.stringify(settings));
}

// Try to load real meal plan data from localStorage (if available)
function loadMealPlan() {
  try {
    return JSON.parse(localStorage.getItem('mealPlan')) || null;
  } catch {
    return null;
  }
}

// Helper: parse nutrition string (e.g., "500 kcal, 20g protein, 60g carbs, 15g fat, 5g fiber, 8g sugar")
function parseNutrition(nutrition) {
  const result = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 };
  if (!nutrition) return result;
  const cal = nutrition.match(/(\d+)\s*kcal/); if (cal) result.calories = parseInt(cal[1]);
  const protein = nutrition.match(/(\d+)g\s*protein/); if (protein) result.protein = parseInt(protein[1]);
  const carbs = nutrition.match(/(\d+)g\s*carb/); if (carbs) result.carbs = parseInt(carbs[1]);
  const fat = nutrition.match(/(\d+)g\s*fat/); if (fat) result.fat = parseInt(fat[1]);
  const fiber = nutrition.match(/(\d+)g\s*fiber/); if (fiber) result.fiber = parseInt(fiber[1]);
  const sugar = nutrition.match(/(\d+)g\s*sugar/); if (sugar) result.sugar = parseInt(sugar[1]);
  return result;
}

function sumNutrients(meals) {
  return Object.values(meals).reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + (m.protein || 0),
      carbs: acc.carbs + (m.carbs || 0),
      fat: acc.fat + (m.fat || 0),
      fiber: acc.fiber + (m.fiber || 0),
      sugar: acc.sugar + (m.sugar || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
  );
}

// Pie chart for macro distribution
function MacroPieChart({ protein, carbs, fat }) {
  const total = protein + carbs + fat;
  const p = total ? (protein / total) * 100 : 0;
  const c = total ? (carbs / total) * 100 : 0;
  const f = total ? (fat / total) * 100 : 0;
  // Pie chart SVG (simple, 3 slices)
  const angle = (v) => (v / 100) * 360;
  const describeArc = (start, end) => {
    const r = 50, cx = 60, cy = 60;
    const rad = (deg) => (Math.PI / 180) * deg;
    const x1 = cx + r * Math.cos(rad(start - 90));
    const y1 = cy + r * Math.sin(rad(start - 90));
    const x2 = cx + r * Math.cos(rad(end - 90));
    const y2 = cy + r * Math.sin(rad(end - 90));
    const large = end - start > 180 ? 1 : 0;
    return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
  };
  let a1 = angle(p), a2 = angle(c), a3 = angle(f);
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <path d={describeArc(0, a1)} fill="#10B981" />
      <path d={describeArc(a1, a1 + a2)} fill="#F59E42" />
      <path d={describeArc(a1 + a2, 360)} fill="#9CA3AF" />
      <circle cx="60" cy="60" r="50" fill="none" stroke="#fff" strokeWidth="2" />
      <text x="60" y="65" textAnchor="middle" fontSize="13" fill="#3B2F2F">Macros</text>
    </svg>
  );
}

// Trend line for calories/macros
function TrendLine({ data, color, label }) {
  const max = Math.max(...data, 1);
  return (
    <svg width="220" height="60" viewBox="0 0 220 60">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        points={data.map((v, i) => `${20 + i * 30},${60 - (v / max) * 50}`).join(' ')}
      />
      {data.map((v, i) => (
        <circle key={i} cx={20 + i * 30} cy={60 - (v / max) * 50} r="3" fill={color} />
      ))}
      <text x="5" y="15" fontSize="12" fill={color}>{label}</text>
    </svg>
  );
}

const NutritionDashboard = () => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [mealPlan, setMealPlan] = useState(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [draft, setDraft] = useState(settings);

  useEffect(() => {
    setSettings(loadSettings());
    setMealPlan(loadMealPlan());
  }, []);

  const weekData = useMemo(() => {
    if (mealPlan && Array.isArray(mealPlan) && mealPlan.length === 7) {
      return mealPlan.map(day => ({
        day: day.day,
        meals: Object.fromEntries(
          Object.entries(day.meals).map(([meal, recipe]) => [
            meal,
            recipe && recipe.nutrition ? parseNutrition(recipe.nutrition) : { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
          ])
        )
      }));
    } else {
      return DAYS.map(day => ({
        day,
        meals: {
          Breakfast: { calories: 320, protein: 12, carbs: 40, fat: 10, fiber: 5, sugar: 8 },
          Lunch: { calories: 500, protein: 22, carbs: 60, fat: 18, fiber: 7, sugar: 10 },
          Dinner: { calories: 600, protein: 28, carbs: 70, fat: 20, fiber: 8, sugar: 12 },
          Snacks: { calories: 180, protein: 4, carbs: 25, fat: 6, fiber: 2, sugar: 6 },
        },
      }));
    }
  }, [mealPlan]);

  const weekSummary = useMemo(() => weekData.map(day => sumNutrients(day.meals)), [weekData]);
  const totalWeek = useMemo(() => weekSummary.reduce(
    (acc, d) => ({
      calories: acc.calories + d.calories,
      protein: acc.protein + d.protein,
      carbs: acc.carbs + d.carbs,
      fat: acc.fat + d.fat,
      fiber: acc.fiber + d.fiber,
      sugar: acc.sugar + d.sugar,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
  ), [weekSummary]);
  const day = weekData[selectedDay];
  const dayTotal = sumNutrients(day.meals);

  // Simple bar chart for weekly calories
  const maxCal = Math.max(...weekSummary.map(d => d.calories), settings.goals.calories);

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.heading}>Nutrition Dashboard</h1>
      {Object.values(settings.restrictions).some(Boolean) && (
        <div style={{ marginBottom: 12 }}>
          {Object.entries(settings.restrictions).map(([key, val]) => val && (
            <span key={key} className={styles.restrictionTag}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
          ))}
        </div>
      )}
      <div className={styles.daySelector}>
        {DAYS.map((d, i) => (
          <button
            key={d}
            className={i === selectedDay ? styles.dayBtnActive : styles.dayBtn}
            onClick={() => setSelectedDay(i)}
          >
            {d}
          </button>
        ))}
        <button className={styles.goalBtn} onClick={() => { setDraft(settings); setShowGoalModal(true); }}>Set Goals</button>
      </div>
      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <h3>Calories</h3>
          <div className={styles.progressBarWrap}>
            <div className={styles.progressBar} style={{ width: `${Math.min(100, (dayTotal.calories / settings.goals.calories) * 100)}%`, background: '#EF4444' }} />
          </div>
          <span>{dayTotal.calories} / {settings.goals.calories} kcal</span>
        </div>
        <div className={styles.card + ' ' + (settings.focus.highProtein ? styles.focusHighlight : '')}>
          <h3>Protein</h3>
          <div className={styles.progressBarWrap}>
            <div className={styles.progressBar} style={{ width: `${Math.min(100, (dayTotal.protein / settings.goals.protein) * 100)}%`, background: '#10B981' }} />
          </div>
          <span>{dayTotal.protein} / {settings.goals.protein} g</span>
        </div>
        <div className={styles.card}>
          <h3>Carbs</h3>
          <div className={styles.progressBarWrap}>
            <div className={styles.progressBar} style={{ width: `${Math.min(100, (dayTotal.carbs / settings.goals.carbs) * 100)}%`, background: '#F59E42' }} />
          </div>
          <span>{dayTotal.carbs} / {settings.goals.carbs} g</span>
        </div>
        <div className={styles.card}>
          <h3>Fat</h3>
          <div className={styles.progressBarWrap}>
            <div className={styles.progressBar} style={{ width: `${Math.min(100, (dayTotal.fat / settings.goals.fat) * 100)}%`, background: '#9CA3AF' }} />
          </div>
          <span>{dayTotal.fat} / {settings.goals.fat} g</span>
        </div>
        <div className={styles.card + ' ' + (settings.focus.highFiber ? styles.focusHighlight : '')}>
          <h3>Fiber</h3>
          <div className={styles.progressBarWrap}>
            <div className={styles.progressBar} style={{ width: `${Math.min(100, (dayTotal.fiber / settings.goals.fiber) * 100)}%`, background: '#7C3AED' }} />
          </div>
          <span>{dayTotal.fiber} / {settings.goals.fiber} g</span>
        </div>
        <div className={styles.card + ' ' + (settings.focus.lowSugar ? styles.focusHighlight : '')}>
          <h3>Sugar</h3>
          <div className={styles.progressBarWrap}>
            <div className={styles.progressBar} style={{ width: `${Math.min(100, (dayTotal.sugar / settings.goals.sugar) * 100)}%`, background: '#F472B6' }} />
          </div>
          <span>{dayTotal.sugar} / {settings.goals.sugar} g</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 32, justifyContent: 'center', alignItems: 'center', margin: '2rem 0' }}>
        <MacroPieChart protein={dayTotal.protein} carbs={dayTotal.carbs} fat={dayTotal.fat} />
        <div>
          <TrendLine data={weekSummary.map(d => d.calories)} color="#EF4444" label="Calories" />
          <TrendLine data={weekSummary.map(d => d.protein)} color="#10B981" label="Protein" />
          <TrendLine data={weekSummary.map(d => d.carbs)} color="#F59E42" label="Carbs" />
          <TrendLine data={weekSummary.map(d => d.fat)} color="#9CA3AF" label="Fat" />
        </div>
      </div>
      <div className={styles.breakdownSection}>
        <h2 className={styles.subheading}>Nutritional Breakdown by Meal</h2>
        <div className={styles.breakdownGrid}>
          {MEALS.map(meal => (
            <div key={meal} className={styles.breakdownCard}>
              <h4>{meal}</h4>
              <div>Calories: {day.meals[meal].calories}</div>
              <div>Protein: {day.meals[meal].protein}g</div>
              <div>Carbs: {day.meals[meal].carbs}g</div>
              <div>Fat: {day.meals[meal].fat}g</div>
              <div>Fiber: {day.meals[meal].fiber}g</div>
              <div>Sugar: {day.meals[meal].sugar}g</div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.weeklySection}>
        <h2 className={styles.subheading}>Weekly Nutrition Summary</h2>
        <div className={styles.weeklyGrid}>
          <div className={styles.weeklyCard}><strong>Total Calories:</strong> {totalWeek.calories} kcal</div>
          <div className={styles.weeklyCard}><strong>Total Protein:</strong> {totalWeek.protein} g</div>
          <div className={styles.weeklyCard}><strong>Total Carbs:</strong> {totalWeek.carbs} g</div>
          <div className={styles.weeklyCard}><strong>Total Fat:</strong> {totalWeek.fat} g</div>
          <div className={styles.weeklyCard}><strong>Total Fiber:</strong> {totalWeek.fiber} g</div>
          <div className={styles.weeklyCard}><strong>Total Sugar:</strong> {totalWeek.sugar} g</div>
        </div>
        <div className={styles.barChartWrap}>
          <h4>Weekly Calories Chart</h4>
          <svg width="100%" height="120" viewBox={`0 0 420 120`}>
            {weekSummary.map((d, i) => (
              <g key={i}>
                <rect
                  x={20 + i * 55}
                  y={120 - (d.calories / maxCal) * 100}
                  width={35}
                  height={(d.calories / maxCal) * 100}
                  fill="#EF4444"
                  rx={7}
                />
                <text x={37 + i * 55} y={115} fontSize="13" textAnchor="middle" fill="#3B2F2F">{DAYS[i][0]}</text>
                <text x={37 + i * 55} y={120 - (d.calories / maxCal) * 100 - 6} fontSize="12" textAnchor="middle" fill="#EF4444">{d.calories}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>
      {showGoalModal && (
        <div className={styles.overlay}>
          <div className={styles.modal} style={{ minWidth: 320, maxWidth: 400 }}>
            <button className={styles.close} onClick={() => setShowGoalModal(false)} aria-label="Close">×</button>
            <h3 className={styles.heading}>Set Dietary Goals</h3>
            <h4 className={styles.subheading}>Daily Nutrition Goals</h4>
            {Object.keys(DEFAULT_SETTINGS.goals).map(key => (
              <div key={key} className={styles.goalInputRow}>
                <label className={styles.goalLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                <input
                  className={styles.goalInput}
                  type="number"
                  min="0"
                  value={draft.goals[key]}
                  onChange={e => setDraft(d => ({ ...d, goals: { ...d.goals, [key]: parseInt(e.target.value) || 0 } }))}
                />
                <span className={styles.goalUnit}>{key === 'calories' ? 'kcal' : 'g'}</span>
              </div>
            ))}
            <h4 className={styles.subheading}>Macronutrient Ratio</h4>
            <div className={styles.goalInputRow}>
              <label className={styles.goalLabel}>Mode:</label>
              <select className={styles.goalInput} value={draft.macroMode} onChange={e => setDraft(d => ({ ...d, macroMode: e.target.value }))}>
                <option value="grams">Grams/day</option>
                <option value="percent">% of calories</option>
                <option value="gkg">g/kg body weight</option>
              </select>
            </div>
            {draft.macroMode === 'percent' && (
              <>
                {['protein', 'carbs', 'fat'].map(macro => (
                  <div key={macro} className={styles.goalInputRow}>
                    <label className={styles.goalLabel}>{macro.charAt(0).toUpperCase() + macro.slice(1)} %:</label>
                    <input
                      className={styles.goalInput}
                      type="number"
                      min="0"
                      max="100"
                      value={draft.macroPercent[macro]}
                      onChange={e => setDraft(d => ({ ...d, macroPercent: { ...d.macroPercent, [macro]: parseInt(e.target.value) || 0 } }))}
                    />
                    <span className={styles.goalUnit}>%</span>
                  </div>
                ))}
              </>
            )}
            {draft.macroMode === 'gkg' && (
              <>
                <div className={styles.goalInputRow}>
                  <label className={styles.goalLabel}>Body Weight:</label>
                  <input
                    className={styles.goalInput}
                    type="number"
                    min="20"
                    max="250"
                    value={draft.bodyWeight}
                    onChange={e => setDraft(d => ({ ...d, bodyWeight: parseFloat(e.target.value) || 0 }))}
                  />
                  <span className={styles.goalUnit}>kg</span>
                </div>
                {['protein', 'carbs', 'fat'].map(macro => (
                  <div key={macro} className={styles.goalInputRow}>
                    <label className={styles.goalLabel}>{macro.charAt(0).toUpperCase() + macro.slice(1)} (g/kg):</label>
                    <input
                      className={styles.goalInput}
                      type="number"
                      min="0"
                      step="0.01"
                      value={draft.macroGkg[macro]}
                      onChange={e => setDraft(d => ({ ...d, macroGkg: { ...d.macroGkg, [macro]: parseFloat(e.target.value) || 0 } }))}
                    />
                    <span className={styles.goalUnit}>g/kg</span>
                  </div>
                ))}
              </>
            )}
            <h4 className={styles.subheading}>Dietary Restrictions</h4>
            <div className={styles.goalInputRow} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}>
              {Object.keys(DEFAULT_SETTINGS.restrictions).map(key => (
                <label key={key} style={{ fontWeight: 500, marginBottom: 4 }}>
                  <input
                    type="checkbox"
                    checked={draft.restrictions[key]}
                    onChange={e => setDraft(d => ({ ...d, restrictions: { ...d.restrictions, [key]: e.target.checked } }))}
                    style={{ marginRight: 8 }}
                  />
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                </label>
              ))}
            </div>
            <h4 className={styles.subheading}>Nutrient Focus</h4>
            <div className={styles.goalInputRow} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 0 }}>
              <label style={{ fontWeight: 500, marginBottom: 4 }}>
                <input
                  type="checkbox"
                  checked={draft.focus.highProtein}
                  onChange={e => setDraft(d => ({ ...d, focus: { ...d.focus, highProtein: e.target.checked } }))}
                  style={{ marginRight: 8 }}
                />
                Focus on High Protein
              </label>
              <label style={{ fontWeight: 500, marginBottom: 4 }}>
                <input
                  type="checkbox"
                  checked={draft.focus.lowSugar}
                  onChange={e => setDraft(d => ({ ...d, focus: { ...d.focus, lowSugar: e.target.checked } }))}
                  style={{ marginRight: 8 }}
                />
                Limit Sugar
              </label>
              <label style={{ fontWeight: 500, marginBottom: 4 }}>
                <input
                  type="checkbox"
                  checked={draft.focus.highFiber}
                  onChange={e => setDraft(d => ({ ...d, focus: { ...d.focus, highFiber: e.target.checked } }))}
                  style={{ marginRight: 8 }}
                />
                Focus on High Fiber
              </label>
            </div>
            <div className={styles.actions}>
              <button
                className={styles.btn}
                onClick={() => {
                  setSettings(draft);
                  saveSettings(draft);
                  setShowGoalModal(false);
                }}
              >Save</button>
              <button className={styles.btn} onClick={() => setShowGoalModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionDashboard; 