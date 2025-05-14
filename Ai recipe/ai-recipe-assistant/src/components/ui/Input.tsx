import React from 'react';
import styles from './Input.module.css';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ ...props }, ref) => (
  <input
    ref={ref}
    className={styles.input}
    aria-label={props['aria-label'] || 'Input'}
    role="textbox"
    {...props}
  />
));
Input.displayName = 'Input';
export default Input; 
