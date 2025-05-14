import React from 'react';
import styles from './Benefits.module.css';

const benefits = [
  { icon: '🤖', title: 'AI-Powered Suggestions', desc: 'Get recipe ideas based on what you have at home.' },
  { icon: '🥗', title: 'Healthy Choices', desc: 'Track nutrition and make healthier meals with ease.' },
  { icon: '🗓️', title: 'Meal Planning', desc: 'Plan your week and generate smart shopping lists.' },
  { icon: '🎤', title: 'Voice Assistant', desc: 'Hands-free cooking with voice commands.' },
];

const Benefits = () => (
  <section className={styles.section} aria-label="App Features">
    <h2 className={styles.heading}>Why Use AI Recipe Assistant?</h2>
    <div className={styles.grid}>
      {benefits.map((b, idx) => (
        <div key={idx} className={styles.card} tabIndex={0} aria-label={b.title}>
          <div className={styles.icon}>{b.icon}</div>
          <div className={styles.title}>{b.title}</div>
          <div className={styles.desc}>{b.desc}</div>
        </div>
      ))}
    </div>
  </section>
);

export default Benefits; 