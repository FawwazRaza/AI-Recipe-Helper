import React from 'react';
import styles from './Contact.module.css';

const Contact = () => (
  <section className={styles.section} aria-label="Contact">
    <h2 className={styles.heading}>Contact Us</h2>
    <form className={styles.form} autoComplete="off" onSubmit={e => e.preventDefault()}>
      <div className={styles.row}>
        <label htmlFor="name" className={styles.label}>Name</label>
        <input type="text" id="name" name="name" className={styles.input} required autoComplete="name" />
      </div>
      <div className={styles.row}>
        <label htmlFor="email" className={styles.label}>Email</label>
        <input type="email" id="email" name="email" className={styles.input} required autoComplete="email" />
      </div>
      <div className={styles.row}>
        <label htmlFor="message" className={styles.label}>Message</label>
        <textarea id="message" name="message" className={styles.input} rows={4} required></textarea>
      </div>
      <button type="submit" className={styles.button}>Send Message</button>
    </form>
    <div className={styles.info}>
      <div>Email: <a href="mailto:fawwazraza2024@gmail.com">fawwazraza2024@gmail.com</a></div>
      <div>Follow us:
        <a href="#" aria-label="Twitter" className={styles.social}>🐦</a>
        <a href="#" aria-label="Instagram" className={styles.social}>📸</a>
      </div>
    </div>
  </section>
);

export default Contact; 