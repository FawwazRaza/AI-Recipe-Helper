import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  return (
    <nav className={styles.navbar} aria-label="Main navigation">
      <div className={styles.logoArea}>
        <Image src="/images/logo.svg" alt="AI Recipe Assistant Logo" className={styles.logo} width={32} height={32} />
        <span className={styles.brand}>AI Recipe Assistant</span>
      </div>
      <div className={styles.links}>
        <Link href="/" className={styles.link} aria-label="Home">Home</Link>
        <Link href="/recipes" className={styles.link} aria-label="Recipes">Recipes</Link>
        <Link href="/meal-planner" className={styles.link} aria-label="Meal Planner">Meal Planner</Link>
        <Link href="/nutrition" className={styles.link} aria-label="Nutrition">Nutrition</Link>
        <Link href="/chatbot" className={styles.link} aria-label="Chatbot">Chatbot</Link>
      </div>
      <div className={styles.actions}>
        <input type="text" placeholder="Search recipes..." className={styles.search} aria-label="Search recipes" />
        <button
          onClick={() => setDark(d => !d)}
          className={styles.darkToggle}
          title="Toggle dark mode"
          aria-label="Toggle dark mode"
        >
          {dark ? '🌙' : '☀️'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 