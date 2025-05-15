# Test info

- Name: Homepage >> should navigate to recipes page from quick link
- Location: C:\Users\DELL\Desktop\Ai recipe\ai-recipe-assistant\tests\functional.spec.ts:12:7

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('link', { name: /recipes/i }) resolved to 2 elements:
    1) <a href="/recipes" aria-label="Recipes" class="Navbar_link__wMX_K">Recipes</a> aka getByRole('navigation', { name: 'Main navigation' }).getByLabel('Recipes', { exact: true })
    2) <a href="/recipes" aria-label="Recipes" class="Footer_link___mmVB">Recipes</a> aka getByRole('contentinfo', { name: 'Footer' }).getByLabel('Recipes')

Call log:
  - waiting for getByRole('link', { name: /recipes/i })

    at C:\Users\DELL\Desktop\Ai recipe\ai-recipe-assistant\tests\functional.spec.ts:14:56
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | // Homepage tests
   4 |
   5 | test.describe('Homepage', () => {
   6 |   test('should render hero section and featured recipes', async ({ page }) => {
   7 |     await page.goto('/');
   8 |     await expect(page.getByText(/AI Recipe Assistant/i)).toBeVisible();
   9 |     await expect(page.getByText(/Featured Recipes/i)).toBeVisible();
  10 |   });
  11 |
  12 |   test('should navigate to recipes page from quick link', async ({ page }) => {
  13 |     await page.goto('/');
> 14 |     await page.getByRole('link', { name: /recipes/i }).click();
     |                                                        ^ Error: locator.click: Error: strict mode violation: getByRole('link', { name: /recipes/i }) resolved to 2 elements:
  15 |     await expect(page).toHaveURL(/.*recipes/);
  16 |     await expect(page.getByText(/All Recipes/i)).toBeVisible();
  17 |   });
  18 | });
  19 |
  20 | // Recipe Listing and Search
  21 |
  22 | test.describe('Recipe Listing', () => {
  23 |   test('should display recipe cards and allow search', async ({ page }) => {
  24 |     await page.goto('/recipes');
  25 |     await expect(page.getByText(/All Recipes/i)).toBeVisible();
  26 |     const cards = await page.locator('[data-testid="recipe-card"]').count();
  27 |     expect(cards).toBeGreaterThan(0);
  28 |     await page.getByPlaceholder('Search recipes').fill('chicken');
  29 |     await page.keyboard.press('Enter');
  30 |     await expect(page.getByText(/chicken/i)).toBeVisible();
  31 |   });
  32 | });
  33 |
  34 | // Recipe Detail
  35 |
  36 | test.describe('Recipe Detail', () => {
  37 |   test('should show recipe details when a card is clicked', async ({ page }) => {
  38 |     await page.goto('/recipes');
  39 |     const firstCard = page.locator('[data-testid="recipe-card"]').first();
  40 |     await firstCard.click();
  41 |     await expect(page.getByText(/Ingredients/i)).toBeVisible();
  42 |     await expect(page.getByText(/Instructions/i)).toBeVisible();
  43 |   });
  44 | });
  45 |
  46 | // Meal Planner
  47 |
  48 | test.describe('Meal Planner', () => {
  49 |   test('should render meal planner and allow adding recipes', async ({ page }) => {
  50 |     await page.goto('/meal-planner');
  51 |     await expect(page.getByText(/Weekly Meal Planner/i)).toBeVisible();
  52 |     // Drag and drop or add recipe logic can be added here if implemented
  53 |   });
  54 | });
  55 |
  56 | // Nutrition Dashboard
  57 |
  58 | test.describe('Nutrition Dashboard', () => {
  59 |   test('should render nutrition dashboard', async ({ page }) => {
  60 |     await page.goto('/nutrition');
  61 |     await expect(page.getByText(/Nutrition Dashboard/i)).toBeVisible();
  62 |     await expect(page.getByText(/Calories/i)).toBeVisible();
  63 |   });
  64 | });
  65 |
  66 | // Chatbot
  67 |
  68 | test.describe('Chatbot', () => {
  69 |   test('should render chatbot and send a message', async ({ page }) => {
  70 |     await page.goto('/chatbot');
  71 |     await expect(page.getByText(/Cooking Assistant/i)).toBeVisible();
  72 |     await page.getByPlaceholder('Type your message').fill('How do I boil an egg?');
  73 |     await page.keyboard.press('Enter');
  74 |     await expect(page.getByText(/egg/i)).toBeVisible();
  75 |   });
  76 | }); 
```