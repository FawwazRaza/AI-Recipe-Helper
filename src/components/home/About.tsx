import React from 'react';
import styles from './About.module.css';
import Image from 'next/image';

const About = () => (
  <section className={styles.section} aria-label="About AI Recipe Assistant">
    <div className={styles.inner}>
      <div className={styles.imageWrap}>
        <Image
          src="https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=600&q=80"
          alt="Cooking together in a modern kitchen"
          width={480}
          height={360}
          className={styles.image}
          priority
        />
      </div>
      <div className={styles.content}>
        <h2 className={styles.heading}>About Our Mission</h2>
        <p className={styles.text}>
          <strong>AI Recipe Assistant</strong> was created to make healthy, delicious, and creative cooking accessible to everyone. Our mission is to empower home cooks with smart tools, personalized suggestions, and seamless meal planning—so you can spend less time worrying and more time enjoying food.
        </p>
      </div>
    </div>
  </section>
);

export default About; 