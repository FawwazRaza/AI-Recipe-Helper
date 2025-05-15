import React from 'react';
import Link from 'next/link';
import styles from './QuickLinks.module.css';

const links = [
  { href: '/meal-planner', icon: '🗓️', label: 'Meal Planner' },
  { href: '/nutrition', icon: '🥗', label: 'Nutrition Tracking' },
];

const QuickLinks = () => (
  <section className={styles.section}>
    {links.map((link, idx) => (
      <Link key={idx} href={link.href} className={styles.link}>
        <span className={styles.icon}>{link.icon}</span>
        <span className={styles.label}>{link.label}</span>
      </Link>
    ))}
  </section>
);

export default QuickLinks; 