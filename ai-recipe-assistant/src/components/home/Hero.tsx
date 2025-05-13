import React from 'react';
import Button from '../ui/Button';
import styles from './Hero.module.css';

const Hero = () => (
  <section className={styles.hero}>
    <h1 className={styles.title}>Welcome to AI Recipe Assistant</h1>
    <p className={styles.subtitle}>Find delicious recipes, plan your meals, and get real-time cooking help—all powered by AI.</p>
    <Button variant="primary">Get Started</Button>
  </section>
);

export default Hero; 