import React from 'react';
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ children, variant = 'primary', ...props }, ref) => (
  <button
    ref={ref}
    className={`${styles.base} ${styles[variant]}`}
    aria-disabled={props.disabled}
    role="button"
    tabIndex={0}
    {...props}
  >
    {children}
  </button>
));
Button.displayName = 'Button';
export default Button; 
