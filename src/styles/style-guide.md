# AI Recipe Assistant – Style Guide

## 1. Color Palette

| Name           | Usage                | Hex      | Preview |
|----------------|----------------------|----------|---------|
| Soft White     | Background           | #FAFAFA  | ![#FAFAFA](https://via.placeholder.com/20/FAFAFA/000000?text=+) |
| Deep Charcoal  | Text, Header, Footer | #23272F  | ![#23272F](https://via.placeholder.com/20/23272F/FFFFFF?text=+) |
| Muted Blue     | Primary, Links, CTA  | #4F8CFF  | ![#4F8CFF](https://via.placeholder.com/20/4F8CFF/FFFFFF?text=+) |
| Fresh Green    | Accent, Success      | #3DDC97  | ![#3DDC97](https://via.placeholder.com/20/3DDC97/FFFFFF?text=+) |
| Warm Coral     | Accent, Error        | #FF6B6B  | ![#FF6B6B](https://via.placeholder.com/20/FF6B6B/FFFFFF?text=+) |

## 2. Typography

- **Headings:** [Poppins](https://fonts.google.com/specimen/Poppins), sans-serif
- **Body:** [Inter](https://fonts.google.com/specimen/Inter), sans-serif

**Sample Usage:**
```css
font-family: 'Poppins', sans-serif; /* Headings */
font-family: 'Inter', sans-serif;   /* Body */
```

## 3. Spacing System

- Use multiples of 8px for margin and padding:
  - 8, 16, 24, 32, 40, 48, 56, 64

## 4. Components

### Buttons
- Primary: Muted Blue background, white text, rounded corners, subtle shadow.
- Secondary: Transparent or Soft White background, Muted Blue border, Muted Blue text.
- Accent: Fresh Green or Warm Coral for special actions.

### Cards
- White background, subtle shadow, rounded corners, padding (24px), hover effect (lift/scale).

### Inputs
- White background, Deep Charcoal text, Muted Blue border on focus, rounded corners.

### Navigation
- Sticky header, logo left, nav links right, hamburger menu on mobile.

### Icons
- Use [Heroicons](https://heroicons.com/) or [Feather Icons](https://feathericons.com/), consistent line style.

## 5. Imagery
- Use high-quality, royalty-free images from [Unsplash](https://unsplash.com/) or [Pexels](https://pexels.com/).
- Use alt text for all images.

## 6. Animations
- Use `framer-motion` or CSS transitions for section reveals, button hovers, and micro-interactions.

## 7. Accessibility
- Ensure color contrast meets WCAG AA.
- All interactive elements are keyboard accessible.
- Use semantic HTML and ARIA labels where needed.

---

> **Tip:** Stick to these guidelines for a consistent, professional, and accessible UI. 