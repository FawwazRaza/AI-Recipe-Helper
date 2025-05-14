import React from 'react';
import styles from './Testimonials.module.css';
import Image from 'next/image';

const testimonials = [
  {
    name: 'Emily R.',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    quote: 'This app has completely changed the way I cook! The AI suggestions are spot on and meal planning is a breeze.'
  },
  {
    name: 'James K.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    quote: 'I love how easy it is to find healthy recipes and track nutrition. The voice assistant is a game changer!'
  },
  {
    name: 'Priya S.',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    quote: 'Beautiful design, super intuitive, and the gallery inspires me to try new dishes every week.'
  }
];

const Testimonials = () => (
  <section className={styles.section} aria-label="User Testimonials">
    <h2 className={styles.heading}>What Our Users Say</h2>
    <div className={styles.grid}>
      {testimonials.map((t, idx) => (
        <div key={idx} className={styles.card} tabIndex={0} aria-label={`Testimonial from ${t.name}`}>
          <Image src={t.avatar} alt={`Avatar of ${t.name}`} width={56} height={56} className={styles.avatar} />
          <div className={styles.quote}>&ldquo;{t.quote}&rdquo;</div>
          <div className={styles.name}>— {t.name}</div>
        </div>
      ))}
    </div>
  </section>
);

export default Testimonials; 