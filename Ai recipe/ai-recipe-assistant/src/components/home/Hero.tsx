import React from 'react';
import styles from './Hero.module.css';
import Image from 'next/image';

const Hero = () => {
  return (
    <section className={styles.hero} aria-label="Welcome section">
      <div className={styles.bgWrap} aria-hidden="true">
        <Image
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80"
          alt="Fresh healthy food ingredients"
          fill
          priority
          className={styles.bgImg}
        />
        <div className={styles.gradient}></div>
      </div>
      <div className={styles.content}>
        <h1 className={styles.headline}>
          Discover, Plan, and Enjoy <span className={styles.accent}>Delicious Recipes</span>
        </h1>
        <p className={styles.subheadline}>
          Your AI-powered kitchen companion for healthy, tasty, and easy meals.
        </p>
        <a href="#recipes" className={styles.cta}>
          Explore Recipes
        </a>
      </div>
    </section>
  );
};

export default Hero; 