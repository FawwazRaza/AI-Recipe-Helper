import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { RecipeProvider } from '../context/RecipeContext';
import { MealPlanProvider } from '../context/MealPlanContext';
import Layout from '../components/layout/Layout';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecipeProvider>
      <MealPlanProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </MealPlanProvider>
    </RecipeProvider>
  );
}

export default MyApp; 