import React from 'react';
import Hero from '../components/home/Hero';
import FeaturedRecipes from '../components/home/FeaturedRecipes';
import IngredientSearch from '../components/home/IngredientSearch';
import Benefits from '../components/home/Benefits';

const Home = () => (
  <>
    <Hero />
    <FeaturedRecipes />
    <IngredientSearch />
    <Benefits />
  </>
);

export default Home; 