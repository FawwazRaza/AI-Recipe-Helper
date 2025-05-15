# AI Recipe Assistant

## 1. Project Overview

**AI Recipe Assistant** is a user-friendly web application that helps you discover, plan, and customize recipes using artificial intelligence. It provides personalized meal suggestions, nutrition insights, and interactive cooking assistance. Whether you're a home cook, a busy professional, or someone with dietary restrictions, this app makes meal planning and cooking easier and more enjoyable.

**Problem Solved:**
- Finding recipes that match your preferences and dietary needs can be time-consuming.
- Planning meals and shopping for ingredients is often a hassle.
- Adapting recipes for allergies or diets is challenging without expert help.

**Use Case:**
- Get recipe suggestions based on ingredients you have.
- Plan meals for the week.
- Ask cooking questions and get instant AI-powered answers.
- Adjust recipes for vegan, vegetarian, or gluten-free diets.

**Workflow Diagram:**
```
[User] → [Web App UI] → [AI Assistant / Recipe Engine] → [Recipe Data & Suggestions]
```

---

## 2. Technologies Used

| Technology      | Why It Was Chosen                                      |
|----------------|--------------------------------------------------------|
| Next.js        | Fast, modern React framework for web apps              |
| React          | Component-based UI development                         |
| TypeScript     | Type safety and better developer experience            |
| SWR            | Efficient data fetching and caching                    |
| Tesseract.js   | OCR for extracting text from images (e.g., recipes)    |
| Tailwind CSS   | Utility-first, responsive styling                      |
| OpenAI/Groq API| AI-powered chat and recipe suggestions                 |
| Vercel         | Easy, scalable deployment                              |

---

## 3. Project Structure

```
ai-recipe-assistant/
├── public/           # Static files (images, data, favicon)
│   ├── data/         # Recipe data in JSON format
│   └── images/       # Food and UI images
├── src/
│   ├── app/          # App-wide layout and global styles
│   ├── components/   # Reusable UI and feature components
│   ├── context/      # React context for global state (e.g., meal plan)
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Next.js pages (routes)
│   ├── styles/       # CSS files (mainly Tailwind)
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Utility/helper functions
├── .env.local        # Environment variables (not committed)
├── package.json      # Project dependencies and scripts
├── README.md         # Project documentation
└── ...               # Config and build files
```

**Folder Roles:**
- `public/`: Static assets and data.
- `src/app/`: App shell, layout, and global styles.
- `src/components/`: UI building blocks (e.g., RecipeCard, Chatbot).
- `src/context/`: Shared state (e.g., meal plan, theme).
- `src/hooks/`: Custom logic for features like speech recognition.
- `src/pages/`: Main routes (e.g., `/recipes`, `/chatbot`).
- `src/styles/`: CSS and Tailwind config.
- `src/types/`: TypeScript interfaces (e.g., Recipe, Ingredient).
- `src/utils/`: Helper functions (e.g., nutrition calculator).

---

## 4. Setting Up Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/FawwazRaza/AI-Recipe-Helper.git
   cd ai-recipe-assistant
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Set up environment variables:**
   - Create a `.env.local` file in the root directory.
   - Example:
     ```env
     NEXT_PUBLIC_GROQ_API_KEY=your-groq-or-openai-api-key
     ```
   - Replace `your-groq-or-openai-api-key` with your actual API key.

---

## 5. Running the Project

- **Start the development server:**
  ```bash
  npm run dev
  # or
  yarn dev
  ```
- **Open your browser:**
  Visit [http://localhost:3000](http://localhost:3000)
- **Build for production:**
  ```bash
  npm run build
  npm start
  ```

---

## 6. API Documentation

### Main APIs Used

| Endpoint                        | Method | Purpose                                 |
|---------------------------------|--------|-----------------------------------------|
| `/data/recipes.json`            | GET    | Fetch all recipes (local JSON)          |
| `https://api.groq.com/openai/v1/chat/completions` | POST   | AI chat and recipe suggestions         |

### Example: Fetching Recipes
```js
fetch('/data/recipes.json')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Example: AI Chat Request
```js
fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'llama3-8b-8192',
    messages: [
      { role: 'system', content: 'You are a helpful AI cooking assistant.' },
      { role: 'user', content: 'Suggest a vegan dinner.' }
    ]
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 7. Updating and Maintaining the Project

- **Add new features:**
  - Create new components in `src/components/`.
  - Add new pages/routes in `src/pages/`.
  - Update types in `src/types/` as needed.
- **Update existing functionality:**
  - Edit the relevant component, hook, or context file.
  - Update the data in `public/data/recipes.json` for new recipes.
- **Maintenance tips:**
  - Keep dependencies updated (`npm update`).
  - Regularly review and refactor code for clarity and performance.
  - Write tests for new features if possible.

---

## 8. Diagrams and Visuals

**System Architecture:**
```
[User]
   ↓
[Next.js Frontend (React)]
   ↓
[AI API (Groq/OpenAI)]
   ↓
[Recipe Data (JSON)]
```

**Recipe Data Example:**
```json
{
  "id": "1",
  "name": "Spaghetti Carbonara",
  "ingredients": [
    { "name": "Spaghetti", "quantity": "200g" },
    { "name": "Eggs", "quantity": "2" }
  ],
  "instructions": ["Boil pasta.", "Fry pancetta.", "Mix eggs and cheese.", "Combine all and serve."],
  "nutrition": "500 kcal",
  "cookingTime": "25",
  "difficulty": "Easy",
  "diet": ["gluten"]
}
```

---

## 9. Deployment Instructions

- **Deploy on Vercel:**
  1. Go to [Vercel](https://vercel.com/) and sign in.
  2. Click **New Project** and import your GitHub repository.
  3. Vercel auto-detects Next.js and configures the build.
  4. Add environment variables in the Vercel dashboard if needed.
  5. Click **Deploy**. Your app will be live on a Vercel URL.
- **Troubleshooting:**
  - Check Vercel build logs for errors.
  - Ensure all environment variables are set.
  - For custom domains, add them in the Vercel dashboard.

---

## 10. Contributing and Support

- **Contributing:**
  - Fork the repository and create a new branch for your feature or fix.
  - Submit a pull request with a clear description of your changes.
  - Follow code style and best practices.
- **Support:**
  - Open an issue in the GitHub repository for bugs or feature requests.
  - For help, contact the maintainer via GitHub or the project discussion board.
