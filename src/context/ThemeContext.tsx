'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'default' | 'red' | 'green' | 'blue';
export type FontSize = 'small' | 'medium' | 'large';

interface ThemeContextProps {
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  fontSize: FontSize;
  setFontSize: (f: FontSize) => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [theme, setTheme] = useState<Theme>('default');
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [highContrast, setHighContrast] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const storedDark = localStorage.getItem('darkMode');
    const storedTheme = localStorage.getItem('theme');
    const storedFont = localStorage.getItem('fontSize');
    const storedContrast = localStorage.getItem('highContrast');
    if (storedDark) setDarkMode(storedDark === 'true');
    if (storedTheme) setTheme(storedTheme as Theme);
    if (storedFont) setFontSize(storedFont as FontSize);
    if (storedContrast) setHighContrast(storedContrast === 'true');
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
    localStorage.setItem('theme', theme);
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('highContrast', String(highContrast));
  }, [darkMode, theme, fontSize, highContrast]);

  // Apply classes to <html>
  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) html.classList.add('dark'); else html.classList.remove('dark');
    html.setAttribute('data-theme', theme);
    html.setAttribute('data-font', fontSize);
    if (highContrast) html.classList.add('high-contrast'); else html.classList.remove('high-contrast');
  }, [darkMode, theme, fontSize, highContrast]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, theme, setTheme, fontSize, setFontSize, highContrast, setHighContrast }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}; 