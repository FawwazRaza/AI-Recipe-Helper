import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';
import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
  const {
    darkMode,
    setDarkMode,
    theme,
    setTheme,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
  } = useTheme();

  return (
    <nav className={styles.navbar} aria-label="Main navigation" role="navigation">
      <div className={styles.logoArea}>
        <Image src="/images/logo.svg" alt="AI Recipe Assistant Logo" className={styles.logo} width={32} height={32} loading="eager" />
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
          onClick={() => setDarkMode(!darkMode)}
          className={styles.darkToggle}
          title="Toggle dark mode"
          aria-label="Toggle dark mode"
        >
          {darkMode ? '🌙' : '☀️'}
        </button>
        <select
          value={theme}
          onChange={e => setTheme(e.target.value)}
          aria-label="Select color theme"
          className={styles.themeSelect}
        >
          <option value="default">Default</option>
          <option value="red">Red</option>
          <option value="green">Green</option>
          <option value="blue">Blue</option>
        </select>
        <select
          value={fontSize}
          onChange={e => setFontSize(e.target.value)}
          aria-label="Select font size"
          className={styles.fontSelect}
        >
          <option value="small">A-</option>
          <option value="medium">A</option>
          <option value="large">A+</option>
        </select>
        <button
          onClick={() => setHighContrast(!highContrast)}
          className={styles.contrastToggle}
          title="Toggle high contrast mode"
          aria-label="Toggle high contrast mode"
        >
          {highContrast ? '🟡' : '⬛'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 