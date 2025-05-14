import React from 'react';
import Image from 'next/image';
import styles from './FeaturedRecipes.module.css';

const featured = [
  { name: 'Pasta', image: '/images/food-categories/pexels-n-voitkevich-5426108.jpg' },
  { name: 'Salad Bowl', image: '/images/food-categories/pexels-yuuilina-9589799.jpg' },
  { name: 'Chicken Dish', image: '/images/food-categories/pexels-tima-miroshnichenko-7879978.jpg' },
];

const FeaturedRecipes = () => (
  <section className={styles.section}>
    <h2 className={styles.heading}>Featured Recipes</h2>
    <div className={styles.grid}>
      {featured.map((recipe, idx) => (
        <div key={idx} className={styles.card}>
          <Image src={recipe.image} alt={recipe.name} width={400} height={250} className={styles.image} 
            loading={idx === 0 ? undefined : 'lazy'}
            priority={idx === 0}
          />
          <h3 className={styles.name}>{recipe.name}</h3>
        </div>
      ))}
    </div>
  </section>
);

export default FeaturedRecipes; 