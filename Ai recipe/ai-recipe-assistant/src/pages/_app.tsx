import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { RecipeProvider } from '../context/RecipeContext';
import { MealPlanProvider } from '../context/MealPlanContext';
import Layout from '../components/layout/Layout';
import { ThemeProvider } from '../context/ThemeContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <RecipeProvider>
        <MealPlanProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </MealPlanProvider>
      </RecipeProvider>
    </ThemeProvider>
  );
}

export default MyApp; 