import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

// Default daily goals
const DEFAULT_GOALS = { calories: 2000, protein: 75, carbs: 250, fat: 70, fiber: 30, sugar: 40 };

type MacroObject = { [key: string]: number };
type RestrictionsObject = { [key: string]: boolean };

const DEFAULT_SETTINGS = {
  goals: { calories: 2000, protein: 75, carbs: 250, fat: 70, fiber: 30, sugar: 40 },
  macroMode: 'grams', // 'grams' or 'percent' or 'gkg'
  macroPercent: { protein: 15, carbs: 55, fat: 30 } as MacroObject, // % of calories
  macroGkg: { protein: 1.2, carbs: 4, fat: 0.8 } as MacroObject, // g/kg body weight
  bodyWeight: 70, // kg
  restrictions: { vegetarian: false, vegan: false, glutenFree: false, dairyFree: false, nutFree: false } as RestrictionsObject,
  focus: { highProtein: false, lowSugar: false, highFiber: false }
};

function loadGoals(): typeof DEFAULT_GOALS {
  try {
    const stored = localStorage.getItem('nutritionGoals');
    return stored ? JSON.parse(stored) : DEFAULT_GOALS;
  } catch {
    return DEFAULT_GOALS;
  }
}
function saveGoals(goals: typeof DEFAULT_GOALS) {
  localStorage.setItem('nutritionGoals', JSON.stringify(goals));
}

function loadSettings(): typeof DEFAULT_SETTINGS {
  try {
    const stored = localStorage.getItem('nutritionSettings');
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}
function saveSettings(settings: typeof DEFAULT_SETTINGS) {
  localStorage.setItem('nutritionSettings', JSON.stringify(settings));
}

// Try to load real meal plan data from localStorage (if available)
function loadMealPlan(): any {
  try {
    const stored = localStorage.getItem('mealPlan');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Helper: parse nutrition string (e.g., "500 kcal, 20g protein, 60g carbs, 15g fat, 5g fiber, 8g sugar")
function parseNutrition(nutrition: string): { calories: number; protein: number; carbs: number; fat: number; fiber: number; sugar: number } {
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

function sumNutrients(meals: Record<string, { calories: number; protein: number; carbs: number; fat: number; fiber: number; sugar: number }>): { calories: number; protein: number; carbs: number; fat: number; fiber: number; sugar: number } {
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
function MacroPieChart({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const total = protein + carbs + fat;
  const p = total ? (protein / total) * 100 : 0;
  const c = total ? (carbs / total) * 100 : 0;
  const f = total ? (fat / total) * 100 : 0;
  // Pie chart SVG (simple, 3 slices)
  const angle = (v: number) => (v / 100) * 360;
  const describeArc = (start: number, end: number) => {
    const r = 50, cx = 60, cy = 60;
    const rad = (deg: number) => (Math.PI / 180) * deg;
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
function TrendLine({ data, color, label }: { data: number[]; color: string; label: string }) {
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

interface Nutrients { calories: number; protein: number; carbs: number; fat: number; fiber: number; sugar: number }
interface DayMeals { day: string; meals: Record<string, Nutrients> }

const NutritionDashboard = () => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [settings, setSettings] = useState<typeof DEFAULT_SETTINGS>(DEFAULT_SETTINGS);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [draft, setDraft] = useState<typeof DEFAULT_SETTINGS>(settings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSettings(loadSettings());
    setMealPlan(loadMealPlan());
  }, []);

  const weekData: DayMeals[] = useMemo(() => {
    if (mealPlan && Array.isArray(mealPlan) && mealPlan.length === 7) {
      return mealPlan.map((day: any) => ({
        day: day.day,
        meals: Object.fromEntries(
          Object.entries(day.meals).map(([meal, recipe]: [string, any]) => [
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

  const weekSummary: Nutrients[] = useMemo(() => weekData.map((day: DayMeals) => sumNutrients(day.meals)), [weekData]);
  const totalWeek: Nutrients = useMemo(() => weekSummary.reduce(
    (acc: Nutrients, d: Nutrients) => ({
      calories: acc.calories + d.calories,
      protein: acc.protein + d.protein,
      carbs: acc.carbs + d.carbs,
      fat: acc.fat + d.fat,
      fiber: acc.fiber + d.fiber,
      sugar: acc.sugar + d.sugar,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
  ), [weekSummary]);
  const day: DayMeals = weekData[selectedDay];
  const dayTotal: Nutrients = sumNutrients(day.meals);

  // Simple bar chart for weekly calories
  const maxCal = Math.max(...weekSummary.map((d: Nutrients) => d.calories), settings.goals.calories);

  if (!mounted) return <div style={{textAlign:'center',marginTop:'3rem',fontSize:'1.2rem'}}>Loading...</div>;

  return (
    <div style={{padding: 24, maxWidth: 900, margin: '0 auto'}}>
      <h1 style={{fontSize: '2rem', fontWeight: 700, marginBottom: 16}}>Nutrition Dashboard</h1>
      {Object.entries(settings.restrictions as Record<string, boolean>).some(Boolean) && (
        <div style={{ marginBottom: 12 }}>
          {Object.entries(settings.restrictions as Record<string, boolean>).map(([key, val]) => val && (
            <span key={key} style={{display:'inline-block',background:'#eee',borderRadius:8,padding:'2px 8px',marginRight:6,fontSize:13}}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
          ))}
        </div>
      )}
      <div style={{display:'flex',gap:8,margin:'16px 0'}}>
        {DAYS.map((d, i) => (
          <button
            key={d}
            style={i === selectedDay ? {background:'#10B981',color:'#fff',border:'none',padding:'6px 16px',borderRadius:6,fontWeight:600} : {background:'#f3f3f3',color:'#222',border:'none',padding:'6px 16px',borderRadius:6}}
            onClick={() => setSelectedDay(i)}
          >
            {d}
          </button>
        ))}
      </div>
      <div style={{display:'flex',gap:8,margin:'16px 0'}}>
        <button style={{background:'#F59E42',color:'#fff',border:'none',padding:'6px 16px',borderRadius:6,fontWeight:600}} onClick={() => { setDraft(settings); setShowGoalModal(true); }}>Set Goals</button>
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:16,margin:'24px 0'}}>
        <div style={{background:settings.focus.highProtein?'#e6f9f2':'#fff',borderRadius:10,padding:16,boxShadow:'0 1px 4px rgba(16,185,129,0.08)',flex:'1 1 180px',minWidth:180}}>
          <h3>Calories</h3>
          <div style={{background:'#f3f3f3',borderRadius:6,height:10,margin:'8px 0',overflow:'hidden'}}>
            <div style={{height:10,borderRadius:6,width:`${Math.min(100, (dayTotal.calories / settings.goals.calories) * 100)}%`,background:'#EF4444',transition:'width 0.3s'}} />
          </div>
          <span>{dayTotal.calories} / {settings.goals.calories} kcal</span>
        </div>
        <div style={{background:settings.focus.highProtein?'#e6f9f2':'#fff',borderRadius:10,padding:16,boxShadow:'0 1px 4px rgba(16,185,129,0.08)',flex:'1 1 180px',minWidth:180}}>
          <h3>Protein</h3>
          <div style={{background:'#f3f3f3',borderRadius:6,height:10,margin:'8px 0',overflow:'hidden'}}>
            <div style={{height:10,borderRadius:6,width:`${Math.min(100, (dayTotal.protein / settings.goals.protein) * 100)}%`,background:'#10B981',transition:'width 0.3s'}} />
          </div>
          <span>{dayTotal.protein} / {settings.goals.protein} g</span>
        </div>
        <div style={{background:settings.focus.highProtein?'#e6f9f2':'#fff',borderRadius:10,padding:16,boxShadow:'0 1px 4px rgba(16,185,129,0.08)',flex:'1 1 180px',minWidth:180}}>
          <h3>Carbs</h3>
          <div style={{background:'#f3f3f3',borderRadius:6,height:10,margin:'8px 0',overflow:'hidden'}}>
            <div style={{height:10,borderRadius:6,width:`${Math.min(100, (dayTotal.carbs / settings.goals.carbs) * 100)}%`,background:'#F59E42',transition:'width 0.3s'}} />
          </div>
          <span>{dayTotal.carbs} / {settings.goals.carbs} g</span>
        </div>
        <div style={{background:settings.focus.highProtein?'#e6f9f2':'#fff',borderRadius:10,padding:16,boxShadow:'0 1px 4px rgba(16,185,129,0.08)',flex:'1 1 180px',minWidth:180}}>
          <h3>Fat</h3>
          <div style={{background:'#f3f3f3',borderRadius:6,height:10,margin:'8px 0',overflow:'hidden'}}>
            <div style={{height:10,borderRadius:6,width:`${Math.min(100, (dayTotal.fat / settings.goals.fat) * 100)}%`,background:'#9CA3AF',transition:'width 0.3s'}} />
          </div>
          <span>{dayTotal.fat} / {settings.goals.fat} g</span>
        </div>
        <div style={{background:settings.focus.highProtein?'#e6f9f2':'#fff',borderRadius:10,padding:16,boxShadow:'0 1px 4px rgba(16,185,129,0.08)',flex:'1 1 180px',minWidth:180}}>
          <h3>Fiber</h3>
          <div style={{background:'#f3f3f3',borderRadius:6,height:10,margin:'8px 0',overflow:'hidden'}}>
            <div style={{height:10,borderRadius:6,width:`${Math.min(100, (dayTotal.fiber / settings.goals.fiber) * 100)}%`,background:'#7C3AED',transition:'width 0.3s'}} />
          </div>
          <span>{dayTotal.fiber} / {settings.goals.fiber} g</span>
        </div>
        <div style={{background:settings.focus.highProtein?'#e6f9f2':'#fff',borderRadius:10,padding:16,boxShadow:'0 1px 4px rgba(16,185,129,0.08)',flex:'1 1 180px',minWidth:180}}>
          <h3>Sugar</h3>
          <div style={{background:'#f3f3f3',borderRadius:6,height:10,margin:'8px 0',overflow:'hidden'}}>
            <div style={{height:10,borderRadius:6,width:`${Math.min(100, (dayTotal.sugar / settings.goals.sugar) * 100)}%`,background:'#F472B6',transition:'width 0.3s'}} />
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
      <div style={{margin:'32px 0'}}>
        <h2 style={{fontSize: '2rem', fontWeight: 700, marginBottom: 16}}>Nutritional Breakdown by Meal</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16}}>
          {MEALS.map(meal => (
            <div key={meal} style={{background:'#fff',borderRadius:10,padding:16,boxShadow:'0 1px 4px rgba(16,185,129,0.08)'}}>
              <h4>{meal}</h4>
              <div>Calories: {(day.meals[meal] as Nutrients).calories}</div>
              <div>Protein: {(day.meals[meal] as Nutrients).protein}g</div>
              <div>Carbs: {(day.meals[meal] as Nutrients).carbs}g</div>
              <div>Fat: {(day.meals[meal] as Nutrients).fat}g</div>
              <div>Fiber: {(day.meals[meal] as Nutrients).fiber}g</div>
              <div>Sugar: {(day.meals[meal] as Nutrients).sugar}g</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{marginTop:24}}>
        <h2 style={{fontSize: '2rem', fontWeight: 700, marginBottom: 16}}>Weekly Nutrition Summary</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16}}>
          <div><strong>Total Calories:</strong> {totalWeek.calories} kcal</div>
          <div><strong>Total Protein:</strong> {totalWeek.protein} g</div>
          <div><strong>Total Carbs:</strong> {totalWeek.carbs} g</div>
          <div><strong>Total Fat:</strong> {totalWeek.fat} g</div>
          <div><strong>Total Fiber:</strong> {totalWeek.fiber} g</div>
          <div><strong>Total Sugar:</strong> {totalWeek.sugar} g</div>
        </div>
      </div>
      <div style={{marginTop:24}}>
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
      {showGoalModal && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.18)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{ minWidth: 320, maxWidth: 400, background:'#fff',borderRadius:12,padding:24,boxShadow:'0 2px 16px rgba(0,0,0,0.12)',position:'relative' }}>
            <button style={{position:'absolute',top:8,right:12,fontSize:22,background:'none',border:'none',cursor:'pointer'}} onClick={() => setShowGoalModal(false)} aria-label="Close">×</button>
            <h3 style={{fontSize:'1.4rem',fontWeight:700,marginBottom:8}}>Set Dietary Goals</h3>
            <h4 style={{fontSize:'1.1rem',fontWeight:600,margin:'12px 0 8px'}}>Daily Nutrition Goals</h4>
            {Object.keys(DEFAULT_SETTINGS.goals).map(key => (
              <div key={key} style={{display:'flex',alignItems:'center',marginBottom:8}}>
                <label style={{width:90,fontWeight:500}}>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                <input
                  style={{flex:1,padding:'4px 8px',borderRadius:6,border:'1px solid #ddd',marginRight:8}}
                  type="number"
                  min="0"
                  value={(draft.goals as Record<string, number>)[key]}
                  onChange={e => setDraft((d: typeof DEFAULT_SETTINGS) => ({ ...d, goals: { ...d.goals, [key]: parseInt(e.target.value) || 0 } }))}
                />
                <span style={{fontSize:13,color:'#888'}}>{key === 'calories' ? 'kcal' : 'g'}</span>
              </div>
            ))}
            <h4 style={{fontSize:'1.1rem',fontWeight:600,margin:'12px 0 8px'}}>Macronutrient Ratio</h4>
            <div style={{display:'flex',alignItems:'center',marginBottom:8}}>
              <label style={{width:90,fontWeight:500}}>Mode:</label>
              <select style={{flex:1,padding:'4px 8px',borderRadius:6,border:'1px solid #ddd'}} value={draft.macroMode} onChange={e => setDraft((d: typeof DEFAULT_SETTINGS) => ({ ...d, macroMode: e.target.value }))}>
                <option value="grams">Grams/day</option>
                <option value="percent">% of calories</option>
                <option value="gkg">g/kg body weight</option>
              </select>
            </div>
            {draft.macroMode === 'percent' && (
              <>
                {['protein', 'carbs', 'fat'].map(macro => (
                  <div key={macro} style={{display:'flex',alignItems:'center',marginBottom:8}}>
                    <label style={{width:90,fontWeight:500}}>{macro.charAt(0).toUpperCase() + macro.slice(1)} %:</label>
                    <input
                      style={{flex:1,padding:'4px 8px',borderRadius:6,border:'1px solid #ddd',marginRight:8}}
                      type="number"
                      min="0"
                      max="100"
                      value={draft.macroPercent[macro]}
                      onChange={e => setDraft((d: typeof DEFAULT_SETTINGS) => ({ ...d, macroPercent: { ...d.macroPercent, [macro]: parseInt(e.target.value) || 0 } }))}
                    />
                    <span style={{fontSize:13,color:'#888'}}>%</span>
                  </div>
                ))}
              </>
            )}
            {draft.macroMode === 'gkg' && (
              <>
                <div style={{display:'flex',alignItems:'center',marginBottom:8}}>
                  <label style={{width:90,fontWeight:500}}>Body Weight:</label>
                  <input
                    style={{flex:1,padding:'4px 8px',borderRadius:6,border:'1px solid #ddd',marginRight:8}}
                    type="number"
                    min="20"
                    max="250"
                    value={draft.bodyWeight}
                    onChange={e => setDraft((d: typeof DEFAULT_SETTINGS) => ({ ...d, bodyWeight: parseFloat(e.target.value) || 0 }))}
                  />
                  <span style={{fontSize:13,color:'#888'}}>kg</span>
                </div>
                {['protein', 'carbs', 'fat'].map(macro => (
                  <div key={macro} style={{display:'flex',alignItems:'center',marginBottom:8}}>
                    <label style={{width:90,fontWeight:500}}>{macro.charAt(0).toUpperCase() + macro.slice(1)} (g/kg):</label>
                    <input
                      style={{flex:1,padding:'4px 8px',borderRadius:6,border:'1px solid #ddd',marginRight:8}}
                      type="number"
                      min="0"
                      step="0.01"
                      value={draft.macroGkg[macro]}
                      onChange={e => setDraft((d: typeof DEFAULT_SETTINGS) => ({ ...d, macroGkg: { ...d.macroGkg, [macro]: parseFloat(e.target.value) || 0 } }))}
                    />
                    <span style={{fontSize:13,color:'#888'}}>g/kg</span>
                  </div>
                ))}
              </>
            )}
            <h4 style={{fontSize:'1.1rem',fontWeight:600,margin:'12px 0 8px'}}>Dietary Restrictions</h4>
            <div style={{ display:'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0, marginBottom: 12 }}>
              {Object.keys(DEFAULT_SETTINGS.restrictions).map(key => (
                <label key={key} style={{ fontWeight: 500, marginBottom: 4 }}>
                  <input
                    type="checkbox"
                    checked={draft.restrictions[key]}
                    onChange={e => setDraft((d: typeof DEFAULT_SETTINGS) => ({ ...d, restrictions: { ...d.restrictions, [key]: e.target.checked } }))}
                    style={{ marginRight: 8 }}
                  />
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                </label>
              ))}
            </div>
            <h4 style={{fontSize:'1.1rem',fontWeight:600,margin:'12px 0 8px'}}>Nutrient Focus</h4>
            <div style={{ display:'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0, marginBottom: 12 }}>
              <label style={{ fontWeight: 500, marginBottom: 4 }}>
                <input
                  type="checkbox"
                  checked={draft.focus.highProtein}
                  onChange={e => setDraft((d: typeof DEFAULT_SETTINGS) => ({ ...d, focus: { ...d.focus, highProtein: e.target.checked } }))}
                  style={{ marginRight: 8 }}
                />
                Focus on High Protein
              </label>
              <label style={{ fontWeight: 500, marginBottom: 4 }}>
                <input
                  type="checkbox"
                  checked={draft.focus.lowSugar}
                  onChange={e => setDraft((d: typeof DEFAULT_SETTINGS) => ({ ...d, focus: { ...d.focus, lowSugar: e.target.checked } }))}
                  style={{ marginRight: 8 }}
                />
                Limit Sugar
              </label>
              <label style={{ fontWeight: 500, marginBottom: 4 }}>
                <input
                  type="checkbox"
                  checked={draft.focus.highFiber}
                  onChange={e => setDraft((d: typeof DEFAULT_SETTINGS) => ({ ...d, focus: { ...d.focus, highFiber: e.target.checked } }))}
                  style={{ marginRight: 8 }}
                />
                Focus on High Fiber
              </label>
            </div>
            <div style={{display:'flex',gap:8,marginTop:16}}>
              <button
                style={{background:'#10B981',color:'#fff',border:'none',padding:'8px 20px',borderRadius:6,fontWeight:600,cursor:'pointer'}}
                onClick={() => {
                  setSettings(draft);
                  saveSettings(draft);
                  setShowGoalModal(false);
                }}
              >Save</button>
              <button style={{background:'#eee',color:'#222',border:'none',padding:'8px 20px',borderRadius:6,fontWeight:600,cursor:'pointer'}} onClick={() => setShowGoalModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionDashboard; 