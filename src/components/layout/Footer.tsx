import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

const Footer = () => (
  <footer className={styles.footer} role="contentinfo" aria-label="Footer">
    <nav className={styles.links} aria-label="Footer navigation">
      <Link href="/" className={styles.link} aria-label="Home">Home</Link>
      <Link href="/recipes" className={styles.link} aria-label="Recipes">Recipes</Link>
      <Link href="/chatbot" className={styles.link} aria-label="Chatbot">Chatbot</Link>
    </nav>
    <div className={styles.copyright}>&copy; {new Date().getFullYear()} AI Recipe Assistant. All rights reserved.</div>
  </footer>
);

export default Footer; 