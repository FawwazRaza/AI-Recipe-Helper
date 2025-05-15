import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';
import { useTheme } from '../../context/ThemeContext';
import type { Theme, FontSize } from '../../context/ThemeContext';
const navLinks = [
  { href: '/', label: 'Home', aria: 'Home' },
  { href: '/recipes', label: 'Recipes', aria: 'Recipes' },
  { href: '/meal-planner', label: 'Meal Planner', aria: 'Meal Planner' },
  { href: '/nutrition', label: 'Nutrition', aria: 'Nutrition' },
  { href: '/chatbot', label: 'Chatbot', aria: 'Chatbot' },
];

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

  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on navigation
  const handleNavClick = () => setMenuOpen(false);

  return (
    <nav className={styles.navbar} aria-label="Main navigation" role="navigation">
      <div className={styles.logoArea}>
        <Image src="/images/logo.svg" alt="AI Recipe Assistant Logo" className={styles.logo} width={32} height={32} loading="eager" />
        <span className={styles.brand}>AI Recipe Assistant</span>
      </div>
      <button
        className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="main-menu"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
        <span className={styles.bar}></span>
      </button>
      <div className={`${styles.links} ${menuOpen ? styles.mobileMenuOpen : ''}`} id="main-menu" role="menu">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={styles.link}
            aria-label={link.aria}
            tabIndex={menuOpen || typeof window === 'undefined' || window.innerWidth > 700 ? 0 : -1}
            onClick={handleNavClick}
            role="menuitem"
          >
            {link.label}
          </Link>
        ))}
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
          onChange={e => setTheme(e.target.value as Theme)}
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
          onChange={e => setFontSize(e.target.value as FontSize)}
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
      {/* Overlay for mobile menu */}
      {menuOpen && <div className={styles.overlay} onClick={() => setMenuOpen(false)} aria-hidden="true"></div>}
    </nav>
  );
};

export default Navbar; 
