import React from 'react';
import Image from 'next/image';
import styles from './RecipeCard.module.css';

interface RecipeCardProps {
  image: string;
  name: string;
  cookingTime: string;
  difficulty: string;
  onClick?: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ image, name, cookingTime, difficulty, onClick }) => (
  <div className={styles.card} onClick={onClick}>
    <Image src={image} alt={name} width={400} height={250} className={styles.image} loading="lazy" />
    <div className={styles.name}>{name}</div>
    <div className={styles.meta}>{cookingTime} • {difficulty}</div>
  </div>
);

export default RecipeCard; 