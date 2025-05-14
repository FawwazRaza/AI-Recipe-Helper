import React from 'react';
import Hero from '../components/home/Hero';
import FeaturedRecipes from '../components/home/FeaturedRecipes';
import IngredientSearch from '../components/home/IngredientSearch';
import Benefits from '../components/home/Benefits';
import About from '../components/home/About';
import Testimonials from '../components/home/Testimonials';
import Gallery from '../components/home/Gallery';
import Contact from '../components/home/Contact';

const Home = () => (
  <>
    <Hero />
    <FeaturedRecipes />
    <IngredientSearch />
    <Benefits />
    <About />
    <Testimonials />
    <Gallery />
    <Contact />
  </>
);

export default Home; 