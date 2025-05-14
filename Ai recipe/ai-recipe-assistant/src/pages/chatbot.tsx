import React, { useState, useRef, useEffect } from 'react';
import styles from '../components/ui/Chatbot.module.css';
import dynamic from 'next/dynamic';
import { useRecipeContext } from '../context/RecipeContext';
import { marked } from 'marked';
import Tesseract from 'tesseract.js';
import Button from '../components/ui/Button';

// --- LLM API integration (Groq, OpenAI-compatible endpoint) ---
const LLM_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const LLM_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || '';

const SYSTEM_PROMPT = `You are a helpful AI cooking assistant. Answer questions, suggest recipes, and help with meal planning. If the user asks about their meal plan or nutrition, use the provided context.`;

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    ...(LLM_API_KEY ? { 'Authorization': `Bearer ${LLM_API_KEY}` } : {})
  };
}

async function fetchLLM(messages, context) {
  // Groq format (OpenAI-compatible)
  const body = {
    model: 'llama3-8b-8192', // or another Groq-supported model
    messages: [
      { role: 'system', content: SYSTEM_PROMPT + (context ? `\nContext: ${context}` : '') },
      ...messages
    ],
    max_tokens: 256,
    temperature: 0.7
  };
  const res = await fetch(LLM_API_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('Groq API error');
  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'Sorry, I could not answer.';
}

const quickPrompts = [
  'Suggest a healthy dinner',
  'What can I cook with chicken and spinach?',
  'How do I make pancakes vegan?',
  'Show me a 3-day meal plan',
  'What are some high-protein snacks?'
];

const modificationPrompts = [
  {
    label: 'Suggest Ingredient Substitutions',
    prompt: 'Suggest ingredient substitutions for my recipe.'
  },
  {
    label: 'Make Vegetarian',
    prompt: 'How can I make this recipe vegetarian?'
  },
  {
    label: 'Make Vegan',
    prompt: 'How can I make this recipe vegan?'
  },
  {
    label: 'Make Gluten-Free',
    prompt: 'How can I make this recipe gluten-free?'
  },
  {
    label: 'Suggest Cooking Method Alternatives',
    prompt: 'Suggest alternative cooking methods for this recipe.'
  }
];

const SUPPORTED_LANGUAGES = [
  { code: 'en-US', label: 'English' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'zh-CN', label: 'Chinese' },
];

const Modal = dynamic(() => import('../components/ui/Modal'), { loading: () => <div>Loading...</div> });

const ChatbotPage = () => {
  const { recipes, setRecipes } = useRecipeContext();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your AI cooking assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [context, setContext] = useState(''); // For meal plan/recipe context
  const [showImport, setShowImport] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const inputRef = useRef(null);
  const chatEndRef = useRef(null);
  const [ocrText, setOcrText] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState('');
  const fileInputRef = useRef(null);
  const [customRecipeModal, setCustomRecipeModal] = useState(false);
  const [customRecipe, setCustomRecipe] = useState({ name: '', ingredients: '', instructions: '', nutrition: '', diet: '' });
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [listening, setListening] = useState(false);
  const [continuous, setContinuous] = useState(false);
  const [voiceLang, setVoiceLang] = useState('en-US');
  const [currentStep, setCurrentStep] = useState(0);
  const recognitionRef = useRef(null);
  const [toast, setToast] = useState('');

  // Get selected recipe object
  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update context when recipe changes
  useEffect(() => {
    if (selectedRecipe) {
      setContext(
        `Recipe: ${selectedRecipe.name}\nIngredients: ${selectedRecipe.ingredients.map(i => `${i.quantity} ${i.name}`).join(', ')}\nInstructions: ${selectedRecipe.instructions.join(' ')}\nNutrition: ${selectedRecipe.nutrition}\nDiet: ${(selectedRecipe.diet || []).join(', ')}`
      );
    } else {
      setContext('');
    }
  }, [selectedRecipe]);

  // Keyboard accessibility
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter' && document.activeElement === inputRef.current) {
        handleSend();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  // Auto-suggest recipes based on chat
  useEffect(() => {
    if (!selectedRecipeId && messages.length > 1) {
      const lastUserMsg = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
      const keywords = lastUserMsg.toLowerCase().split(/\W+/).filter(Boolean);
      const scored = recipes.map(r => {
        let score = 0;
        keywords.forEach(k => {
          if (r.name.toLowerCase().includes(k)) score += 2;
          if (r.ingredients.some(i => i.name.toLowerCase().includes(k))) score += 1;
        });
        return { ...r, score };
      });
      const top = scored.filter(r => r.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
      setSuggestedRecipes(top);
    } else {
      setSuggestedRecipes([]);
    }
  }, [messages, selectedRecipeId, recipes]);

  // Voice recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = false;
      recognition.lang = voiceLang;
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleVoiceCommand(transcript);
      };
      recognition.onend = () => {
        setListening(false);
        if (continuous) {
          setTimeout(() => recognition.start(), 300);
        }
      };
      recognitionRef.current = recognition;
    }
  }, [continuous, voiceLang]);

  function startListening() {
    if (recognitionRef.current) {
      setListening(true);
      recognitionRef.current.start();
    }
  }
  function stopListening() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  }

  function handleVoiceCommand(transcript) {
    const text = transcript.toLowerCase();
    // Voice activation
    if (text.includes('hey chef')) {
      setListening(true);
      return;
    }
    // Timer command
    const timerMatch = text.match(/set timer for (\d+) (minute|minutes|second|seconds)/);
    if (timerMatch) {
      const value = parseInt(timerMatch[1], 10);
      const unit = timerMatch[2].startsWith('minute') ? 60 : 1;
      const seconds = value * unit;
      window.setTimeout(() => alert('⏰ Timer done!'), seconds * 1000);
      setInput('Set timer for ' + value + ' ' + timerMatch[2]);
      return;
    }
    // Step-by-step navigation
    if (selectedRecipe) {
      if (text.includes('next step')) {
        setCurrentStep(s => Math.min(s + 1, selectedRecipe.instructions.length - 1));
        speak(selectedRecipe.instructions[Math.min(currentStep + 1, selectedRecipe.instructions.length - 1)]);
        return;
      }
      if (text.includes('previous step')) {
        setCurrentStep(s => Math.max(s - 1, 0));
        speak(selectedRecipe.instructions[Math.max(currentStep - 1, 0)]);
        return;
      }
      if (text.includes('repeat')) {
        speak(selectedRecipe.instructions[currentStep]);
        return;
      }
      if (text.includes('pause')) {
        if ('speechSynthesis' in window) window.speechSynthesis.pause();
        return;
      }
      if (text.includes('resume')) {
        if ('speechSynthesis' in window) window.speechSynthesis.resume();
        return;
      }
      if (text.includes('stop speaking')) {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        return;
      }
      const goToStepMatch = text.match(/go to step (\d+)/);
      if (goToStepMatch) {
        const stepNum = Math.max(1, Math.min(selectedRecipe.instructions.length, parseInt(goToStepMatch[1], 10)));
        setCurrentStep(stepNum - 1);
        speak(selectedRecipe.instructions[stepNum - 1]);
        return;
      }
      if (text.includes('read step')) {
        speak(selectedRecipe.instructions[currentStep]);
        return;
      }
      if (text.includes('read ingredients')) {
        speak(selectedRecipe.ingredients.map(i => `${i.quantity} ${i.name}`).join(', '));
        return;
      }
      if (text.includes('read all steps')) {
        speak(selectedRecipe.instructions.join('. '));
        return;
      }
      if (text.includes('read nutrition')) {
        speak(selectedRecipe.nutrition || 'No nutrition info available.');
        return;
      }
      if (text.includes('read diet')) {
        speak((selectedRecipe.diet || []).join(', ') || 'No diet info available.');
        return;
      }
    }
    // If not a command, treat as chat input
    setInput(transcript);
  }

  function speak(text) {
    if ('speechSynthesis' in window) {
      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = voiceLang;
      window.speechSynthesis.speak(utter);
    }
  }

  async function handleSend() {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    try {
      const reply = await fetchLLM(newMessages, context);
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
      setToast('Message sent!');
      setTimeout(() => setToast(''), 2000);
    } catch (e) {
      setError('Failed to get response.');
    } finally {
      setLoading(false);
    }
  }

  function handleQuickPrompt(prompt) {
    setInput(prompt);
    inputRef.current?.focus();
  }

  // --- Recipe Import Modal (URL/OCR placeholder) ---
  function handleImportRecipe() {
    setShowImport(true);
  }

  async function handleOcrUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrLoading(true);
    setOcrError('');
    setOcrText('');
    try {
      const { data } = await Tesseract.recognize(file, 'eng');
      setOcrText(data.text);
      setToast('Text extracted from image!');
      setTimeout(() => setToast(''), 2000);
    } catch (err) {
      setOcrError('Failed to extract text from image.');
    } finally {
      setOcrLoading(false);
    }
  }

  // Handle custom recipe modal
  function handleCustomRecipeSubmit(e) {
    e.preventDefault();
    const newRecipe = {
      id: 'custom-' + Date.now(),
      name: customRecipe.name,
      ingredients: customRecipe.ingredients.split('\n').map(line => {
        const [quantity, ...nameParts] = line.split(' ');
        return { name: nameParts.join(' '), quantity };
      }),
      instructions: customRecipe.instructions.split('\n'),
      nutrition: customRecipe.nutrition,
      cookingTime: 'N/A',
      difficulty: 'Custom',
      diet: customRecipe.diet ? customRecipe.diet.split(',').map(d => d.trim()) : [],
      image: '/images/food-categories/custom.jpg',
      popularity: 0
    };
    setRecipes(prev => [...prev, newRecipe]);
    setSelectedRecipeId(newRecipe.id);
    setCustomRecipeModal(false);
    setCustomRecipe({ name: '', ingredients: '', instructions: '', nutrition: '', diet: '' });
  }

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Assistant Tools</h2>
        <div className={styles.recipeSelectSection}>
          <label htmlFor="recipe-select" className={styles.recipeSelectLabel}>Recipe Context:</label>
          <select
            id="recipe-select"
            className={styles.servingSelect}
            value={selectedRecipeId}
            onChange={e => setSelectedRecipeId(e.target.value)}
            aria-label="Select a recipe for context"
          >
            <option value="">None</option>
            {recipes.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <Button variant="outline" style={{marginTop:8}} onClick={() => setCustomRecipeModal(true)} aria-label="Add custom recipe">+ Custom Recipe</Button>
        </div>
        {selectedRecipe && (
          <div className={styles.selectedRecipeSummary} aria-label="Selected recipe summary">
            <strong>{selectedRecipe.name}</strong> | {selectedRecipe.cookingTime} min | {selectedRecipe.difficulty}<br/>
            <span style={{fontSize:'0.97em'}}>
              Ingredients: {selectedRecipe.ingredients.map(i => i.name).join(', ')}<br/>
              Diet: {(selectedRecipe.diet || []).join(', ')}
            </span>
          </div>
        )}
        {suggestedRecipes.length > 0 && (
          <div className={styles.suggestedRecipesSection} aria-label="Suggested recipes">
            <div className={styles.suggestedRecipesTitle}>Suggested Recipes:</div>
            <div className={styles.suggestedRecipesList}>
              {suggestedRecipes.map(r => (
                <button key={r.id} className={styles.suggestedRecipeCard} onClick={() => setSelectedRecipeId(r.id)} aria-label={`Select ${r.name}`}>
                  <div className={styles.suggestedRecipeName}>{r.name}</div>
                  <div className={styles.suggestedRecipeMeta}>{r.cookingTime} min | {r.difficulty}</div>
                  <div className={styles.suggestedRecipeIngredients}>{r.ingredients.map(i => i.name).join(', ')}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className={styles.quickPrompts} aria-label="Quick prompts">
          {quickPrompts.map((p, i) => (
            <button key={i} className={styles.quickBtn} onClick={() => handleQuickPrompt(p)}>{p}</button>
          ))}
          <button className={styles.quickBtn} onClick={handleImportRecipe} aria-label="Import recipe">Import Recipe</button>
        </div>
        <div className={styles.modificationSection} aria-label="Recipe modification assistant">
          <div className={styles.modificationTitle}>Modification Assistant</div>
          <div className={styles.modificationActions}>
            {modificationPrompts.map((item, idx) => (
              <button
                key={item.label}
                className={styles.quickBtn}
                onClick={() => handleQuickPrompt(item.prompt)}
                aria-label={item.label}
              >
                {item.label}
              </button>
            ))}
            <label htmlFor="serving-size-select" className={styles.servingLabel} style={{marginLeft:8,marginRight:4}}>Serving Size:</label>
            <select
              id="serving-size-select"
              className={styles.servingSelect}
              onChange={e => handleQuickPrompt(`Adjust this recipe to serve ${e.target.value} people.`)}
              defaultValue=""
              aria-label="Adjust serving size"
            >
              <option value="" disabled>Choose</option>
              {[...Array(10)].map((_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
          </div>
        </div>
      </aside>
      <main className={styles.chatMain}>
        <h1 className={styles.title} tabIndex={0}>🍳 Cooking Chatbot</h1>
        <div className={styles.chatArea} role="log" aria-live="polite">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={msg.role === 'assistant' ? styles.assistantMsg : styles.userMsg}
              aria-label={msg.role === 'assistant' ? 'Assistant' : 'You'}
              tabIndex={0}
              {...(msg.role === 'assistant' ? { dangerouslySetInnerHTML: { __html: marked.parse(msg.content) } } : {})}
            >
              {msg.role === 'user' ? msg.content : null}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form
          className={styles.inputArea}
          onSubmit={e => { e.preventDefault(); handleSend(); }}
          aria-label="Chat input"
        >
          <input
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your question... or use the mic"
            aria-label="Type your question"
            disabled={loading}
          />
          <button
            type="button"
            className={styles.micBtn + (listening ? ' ' + styles.micActive : '')}
            aria-label={listening ? 'Stop listening' : 'Start voice recognition'}
            onClick={listening ? stopListening : startListening}
            style={{marginRight:4}}
          >
            <span role="img" aria-label="microphone">🎤</span>
          </button>
          <label className={styles.voiceLangLabel} htmlFor="voice-lang-select" style={{marginLeft:4}}>
            <span className="sr-only">Recognition language</span>
            <select
              id="voice-lang-select"
              className={styles.voiceLangSelect}
              value={voiceLang}
              onChange={e => setVoiceLang(e.target.value)}
              aria-label="Recognition language"
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </label>
          <label className={styles.continuousLabel} style={{marginLeft:8}}>
            <input
              type="checkbox"
              checked={continuous}
              onChange={e => setContinuous(e.target.checked)}
              aria-label="Continuous listening"
              style={{marginRight:4}}
            />
            Continuous
          </label>
          <Button type="submit" variant="primary" aria-label="Send" disabled={loading || !input.trim()}>{loading ? <span className={styles.spinner} aria-label="Loading"></span> : 'Send'}</Button>
        </form>
        {selectedRecipe && (
          <div className={styles.stepNavSection} aria-label="Step-by-step navigation">
            <div className={styles.stepNavTitle}>Step-by-Step Cooking</div>
            <div className={styles.stepNavControls}>
              <Button variant="outline" onClick={() => { setCurrentStep(s => Math.max(s - 1, 0)); speak(selectedRecipe.instructions[Math.max(currentStep - 1, 0)]); }} disabled={currentStep === 0}>Previous Step</Button>
              <span className={styles.stepNavStep}>Step {currentStep + 1} of {selectedRecipe.instructions.length}</span>
              <Button variant="outline" onClick={() => { setCurrentStep(s => Math.min(s + 1, selectedRecipe.instructions.length - 1)); speak(selectedRecipe.instructions[Math.min(currentStep + 1, selectedRecipe.instructions.length - 1)]); }} disabled={currentStep === selectedRecipe.instructions.length - 1}>Next Step</Button>
              <Button variant="outline" onClick={() => speak(selectedRecipe.instructions[currentStep])}>Read Step Aloud</Button>
            </div>
            <div className={styles.stepNavInstruction}>{selectedRecipe.instructions[currentStep]}</div>
          </div>
        )}
        {error && <div className={styles.error} role="alert">{error}</div>}
        {ocrLoading && <div className={styles.spinner} aria-label="Extracting text..." role="status" />}
        {ocrError && <div className={styles.error} role="alert">{ocrError}</div>}
        {toast && <div className={styles.toast} role="status" aria-live="polite">{toast}</div>}
      </main>
      <Modal isOpen={showImport} onClose={() => setShowImport(false)}>
        <h2>Import Recipe</h2>
        <p>Paste a recipe URL or upload an image (OCR supported).</p>
        <input type="text" placeholder="Paste recipe URL..." className={styles.input} aria-label="Recipe URL" style={{ marginBottom: 8 }} />
        <div style={{ marginBottom: 8 }}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleOcrUpload}
            aria-label="Upload recipe image for OCR"
            style={{ marginBottom: 4 }}
          />
          {ocrLoading && <div>Extracting text...</div>}
          {ocrError && <div className={styles.error}>{ocrError}</div>}
          {ocrText && (
            <textarea
              className={styles.input}
              style={{ minHeight: 60, marginTop: 4 }}
              value={ocrText}
              onChange={e => setOcrText(e.target.value)}
              aria-label="Extracted recipe text"
            />
          )}
        </div>
        <Button variant="secondary" style={{ marginTop: 8 }}>Import</Button>
      </Modal>
      <Modal isOpen={customRecipeModal} onClose={() => setCustomRecipeModal(false)}>
        <h2>Add Custom Recipe</h2>
        <form onSubmit={handleCustomRecipeSubmit}>
          <label className={styles.customRecipeLabel}>Name:<br/>
            <input className={styles.input} required value={customRecipe.name} onChange={e => setCustomRecipe(r => ({...r, name: e.target.value}))} />
          </label>
          <label className={styles.customRecipeLabel}>Ingredients (one per line, e.g. "200g pasta"):<br/>
            <textarea className={styles.input} required rows={3} value={customRecipe.ingredients} onChange={e => setCustomRecipe(r => ({...r, ingredients: e.target.value}))} />
          </label>
          <label className={styles.customRecipeLabel}>Instructions (one per line):<br/>
            <textarea className={styles.input} required rows={3} value={customRecipe.instructions} onChange={e => setCustomRecipe(r => ({...r, instructions: e.target.value}))} />
          </label>
          <label className={styles.customRecipeLabel}>Nutrition (optional):<br/>
            <input className={styles.input} value={customRecipe.nutrition} onChange={e => setCustomRecipe(r => ({...r, nutrition: e.target.value}))} />
          </label>
          <label className={styles.customRecipeLabel}>Diet (comma separated, optional):<br/>
            <input className={styles.input} value={customRecipe.diet} onChange={e => setCustomRecipe(r => ({...r, diet: e.target.value}))} />
          </label>
          <Button type="submit" variant="primary" style={{marginTop:8}}>Add Recipe</Button>
        </form>
      </Modal>
    </div>
  );
};

export default ChatbotPage; 
