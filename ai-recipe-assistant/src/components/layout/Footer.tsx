import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.links}>
      <Link href="/" className={styles.link}>Home</Link>
      <Link href="/recipes" className={styles.link}>Recipes</Link>
      <Link href="/meal-planner" className={styles.link}>Meal Planner</Link>
      <Link href="/nutrition" className={styles.link}>Nutrition</Link>
      <Link href="/chatbot" className={styles.link}>Chatbot</Link>
    </div>
    <div className={styles.copyright}>&copy; {new Date().getFullYear()} AI Recipe Assistant. All rights reserved.</div>
  </footer>
);

export default Footer; 