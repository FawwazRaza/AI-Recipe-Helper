# AI Recipe Helper

A Next.js app for AI-powered recipe suggestions and meal planning.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment

Deploy easily on [Vercel](https://vercel.com/).

# AI Recipe Assistant 🍲

Welcome to the AI Recipe Assistant project! This README provides detailed instructions for building a smart cooking companion app using Cursor AI code generation. Each phase is carefully structured so you can tell Cursor to execute them one by one.

## Project Overview

AI Recipe Assistant is a web application that helps users find recipes based on available ingredients, plan meals, track nutrition, and get real-time cooking assistance through a chatbot and voice commands.

## Technology Stack (All Free)

- **Frontend Framework**: React with Next.js
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI (free and open-source)
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **Hosting**: Vercel (free tier)
- **Voice Recognition**: Web Speech API (built into browsers)
- **Icons**: Heroicons (free)
- **Recipe Data**: Open source recipe datasets or free APIs

## Phase 1: Project Setup and Basic Structure

### 1.1 Project Initialization
```
Initialize a new Next.js project with TypeScript support
Configure Tailwind CSS
Set up ESLint and Prettier for code quality
Create a responsive layout template
```

### 1.2 Folder Structure
```
Create the following folder structure:
/ai-recipe-assistant
├── public/
│   ├── data/
│   │   └── recipes.json
│   ├── images/
│   │   ├── logo.svg
│   │   └── food-categories/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Layout.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── recipe/
│   │   │   ├── RecipeCard.tsx
│   │   │   ├── RecipeDetail.tsx
│   │   │   └── RecipeFilter.tsx
│   │   └── home/
│   │       ├── Hero.tsx
│   │       └── FeaturedRecipes.tsx
│   ├── pages/
│   │   ├── index.tsx
│   │   ├── recipes/
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   ├── meal-planner.tsx
│   │   ├── nutrition.tsx
│   │   ├── chatbot.tsx
│   │   ├── _app.tsx
│   │   └── _document.tsx
│   ├── styles/
│   │   └── globals.css
│   ├── utils/
│   │   ├── recipeUtils.ts
│   │   └── nutritionCalculator.ts
│   ├── hooks/
│   │   ├── useRecipeSearch.ts
│   │   └── useSpeechRecognition.ts
│   ├── context/
│   │   ├── RecipeContext.tsx
│   │   └── MealPlanContext.tsx
│   └── types/
│       └── index.ts
├── model/
│   └── place_model_here.txt
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

### 1.3 Base Components
```
Create reusable UI components:
- Navbar with app logo, navigation links, and a search bar
- Footer with links and copyright information
- Layout component to wrap all pages
- Basic Button component with multiple variants
- Card component for displaying recipes
```

## Phase 2: Homepage and Recipe Listing

### 2.1 Homepage Implementation
```
Create a welcoming homepage with:
- Hero section with app description and call to action
- Featured recipes carousel
- "What's in your kitchen?" ingredient search section
- Benefits of using the app section
- Quick links to meal planning and nutrition tracking
```

### 2.2 Recipe Listing and Search
```
Implement recipe listing page with:
- Grid layout for recipe cards
- Recipe card with image, name, cooking time, and difficulty
- Search functionality by recipe name
- Filter sidebar for dietary restrictions (vegetarian, vegan, gluten-free)
- Sort options (preparation time, popularity, etc.)
```

### 2.3 Recipe Detail Page
```
Create detailed recipe view with:
- Large recipe image
- Ingredients list with quantities
- Step-by-step cooking instructions
- Nutrition information
- Cooking time and difficulty
- Serving size adjuster
- Save to meal plan button
```
### 2.4: Beautiful Theme and Color Scheme
Enhance the visual appeal of the application by implementing a clean, modern, and user-friendly theme. Instruct Cursor AI to:

1. **Define a Color Palette**:
   - **Primary Color**: 🍅 Tomato Red (`#EF4444`) — used for buttons, highlights, and key actions.
   - **Secondary Color**: 🥬 Leaf Green (`#10B981`) — for accents, filters, and tags.
   - **Background Color**: 🥛 Off-White (`#FAFAFA`) — clean and light background for high readability.
   - **Text Color**: 🍫 Dark Brown (`#3B2F2F`) — warm and readable text tone.
   - **Muted Gray**: (`#9CA3AF`) — for borders, placeholders, and secondary text.

2. **Typography**:
   - Use a clean and legible Google Font like `Inter` or `Poppins`.
   - Heading font weight: `600-700`
   - Body text weight: `400-500`
   - Use consistent spacing and font sizes based on Tailwind's scale (`text-sm`, `text-base`, `text-lg`, etc.)

3. **Global Styles (in `globals.css`)**:
   - Set background color, font family, and text color
   - Add smooth transitions (`transition-all duration-200 ease-in-out`)
   - Normalize paddings and margins with `box-sizing: border-box` and `reset.css` (optional)

4. **Component Styling**:
   - **Buttons**: Rounded full, subtle shadows, hover effects (e.g., `hover:bg-red-600`)
   - **Cards**: Soft shadows (`shadow-md`), border radius (`rounded-lg`), and hover scale (`hover:scale-105`)
   - **Input Fields**: Subtle outlines, `focus:ring-2`, and placeholder text with muted color

5. **Dark Mode Support** (Optional but encouraged):
   - Add Tailwind's dark mode class strategy (`dark:`)
   - Use darker shades like `#1F2937` for background and `#E5E7EB` for text
   - Add a toggle in the Navbar to switch themes

6. **Images and Visual Elements**:
   - Use high-quality food images from `public/images/food-categories/`
   - Add subtle hover effects and animations (e.g., fade-in, slide-in) using Tailwind and Framer Motion

7. **Accessibility and UX Enhancements**:
   - Ensure color contrast meets WCAG standards
   - Add `aria-labels` to key components
   - Use `focus-visible` and keyboard navigation support

Once this phase is complete, the application should have a polished, user-friendly visual identity that enhances both usability and engagement.

## Phase 3: Ingredient-Based Recipe Search

### 3.1 Ingredient Input System
```
Build an ingredient input system:
- Multi-select input for adding ingredients
- Common ingredients quick-add buttons
- Ingredient categories (produce, dairy, proteins, etc.)
- "What can I make?" search button
```

### 3.2 Recipe Matching Algorithm
```
Implement recipe matching logic:
- Match recipes based on available ingredients
- Sort by match percentage (how many ingredients the user has)
- Show alternative ingredients for partial matches
- Include "Add missing ingredients to shopping list" button
```

### 3.3 Recipe Filter Enhancements
```
Add advanced filtering options:
- By cooking time (quick meals, under 30 min, etc.)
- By cuisine type (Italian, Mexican, Asian, etc.)
- By meal type (breakfast, lunch, dinner, snack)
- By calorie range
- By preparation difficulty
```

## Phase 4: Meal Planning System

### 4.1 Weekly Meal Planner
```
Create a meal planning calendar:
- 7-day view with breakfast, lunch, dinner, and snacks
- Drag and drop interface for adding recipes
- Recipe preview on hover
- Clear or randomize options
```

### 4.2 Shopping List Generator
```
Implement automatic shopping list creation:
- Consolidated ingredients from planned meals
- Quantity calculation based on serving sizes
- Category organization (produce, dairy, etc.)
- Checkboxes for shopping
- Export to PDF or email functionality
```

### 4.3 Meal Plan Templates
```
Add meal plan templates for common diets:
- Balanced diet plan
- Weight loss plan
- High protein plan
- Vegetarian/vegan plans
- Quick and easy meals plan
```

## Phase 5: Nutrition Tracking

### 5.1 Nutrition Dashboard
```
Build a nutrition tracking dashboard:
- Daily nutrient intake visualization (calories, protein, carbs, fat)
- Weekly nutrition summary
- Progress towards daily goals
- Nutritional breakdown by meal
```

### 5.2 Recipe Nutrition Analysis
```
Implement nutrition calculation for recipes:
- Calculate nutrition facts based on ingredients
- Show macronutrient breakdown
- Highlight nutritional benefits
- Flag potential allergens
```

### 5.3 Dietary Goal Setting
```
Create a system for setting dietary goals:
- Calorie target setting
- Macronutrient ratio customization
- Dietary restriction settings
- Nutrient focus areas (e.g., more protein, less sugar)
```


## Phase 6: Cooking Assistant Chatbot

### 6.1 Basic Chatbot Interface
```
Implement a cooking chatbot:
- Chat interface with message history
- Quick question templates
- Recipe suggestion capability
- Cooking technique explanations
```


### 6.2 Recipe Modification Assistant
```
Add recipe modification features:
- Ingredient substitution suggestions
- Serving size adjustment
- Dietary adaptation (make it vegetarian, gluten-free, etc.)
- Cooking method alternatives
```

### 6.3 Voice Recognition and Commands
```
Implement hands-free cooking assistance:
- Voice activation for the chatbot
- Command recognition for common actions
- Step-by-step recipe reading
- Timer setting via voice
- Hands-free navigation
```


## Phase 7: User Experience Enhancements

### 7.1 Responsive Design Optimization
```
Ensure perfect responsiveness across devices:
- Mobile-first approach
- Touch-friendly controls for tablets
- Optimized layout for different screen sizes
- Portrait and landscape mode handling
```

### 7.2 Dark Mode and Themes
```
Add visual customization options:
- Dark/light mode toggle
- Color theme options
- Font size adjustments
- High contrast mode for accessibility
```


### 7.3 Performance Optimization
```
Optimize application performance:
- Image optimization and lazy loading
- Code splitting for faster page loads
- Caching strategies for recipe data
- Reduced bundle size
```
 

## Phase 8: Testing and Bug Fixing

### 8.1 Functional Testing
```
Perform thorough testing:
- Test all interactive elements
- Verify recipe search accuracy
- Check meal planning functionality
- Validate nutrition calculations
- Test chatbot responses
- Verify voice command recognition
```


### 8.2 Bug Fixing and Refinement
```
Address any issues found during testing:
- Fix UI inconsistencies
- Resolve functional bugs
- Improve error handling
- Add loading states
- Enhance user feedback
```

## Phase 9: Deployment

### 9.1 GitHub Repository Setup
```
Prepare for deployment:
- https://github.com/FawwazRaza/AI-Recipe-Helper this is the link for repo
- Initialize Git in the project folder
- Commit all code with descriptive messages
- Push to the remote repository
- please add everything needed for vercel deployment in gtihub repo
```

### 9.2 Vercel Deployment
```
Deploy the application:
- Connect GitHub repository to Vercel
- Configure build settings
- Set up environment variables if needed
- Deploy the application
- Verify the deployed site works correctly
```

### 9.3 Final Checks and Submission
```
Perform final verification:
- Test all functionality on the live site
- Check performance using Lighthouse
- Verify all links work correctly
- Submit the deployed site URL
```
please execute phase 9.3 complety full fledge and do the updatoin in code automatically

Free Resources for Development

Recipe Data: Open Food Facts API(https://world.openfoodfacts.org/data) or TheMealDB API (free tier) (https://www.themealdb.com/api.php)
Food Images: Unsplash https://unsplash.com/ and Pexels https://www.pexels.com/(free stock photos)
Icons: Heroicons https://heroicons.com/ or Feather Icons  https://feathericons.com/ (free)
UI Components: Headless UI https://headlessui.dev/ (free) works well with Tailwind
Voice Recognition: Web Speech API (built into browsers, completely free)
Deployment: Vercel's free tier is sufficient for this project

You can now start your development server with:

```sh
npm run dev
```

This will use Webpack by default (since Turbopack is not enabled in your config and you are not passing `--turbopack`).

**You should now be able to run your app without the previous errors.**

If you encounter any further issues or need additional configuration, just let me know!

npx playwright test