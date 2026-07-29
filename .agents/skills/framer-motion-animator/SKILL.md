---
name: framer-motion-animator
description: Adds smooth page transitions, micro-interactions, spring physics, and animated entrance effects using Framer Motion (Motion).
---

# Framer Motion Animation Guidelines & Patterns

Manual for designing fluid micro-interactions, spring physics, and animated entrance/exit transitions in React components using `motion` / `framer-motion`.

## 🎭 Animation Principles & Motion Specs

### 1. Spring Physics Configuration
Use natural spring physics over linear easing for UI micro-interactions:
```typescript
export const SPRING_TRANSITION = {
  type: 'spring',
  stiffness: 350,
  damping: 25,
};
```

### 2. Entrance & Stagger Variants
```typescript
export const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};
```

### 3. Modal & Overlay Transitions with AnimatePresence
```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={SPRING_TRANSITION}
      >
        {/* Modal Content */}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

### 4. Interactive Gesture Scales
- Button Hover: `whileHover={{ scale: 1.02 }}`
- Button Tap/Click: `whileTap={{ scale: 0.97 }}`
- Card Lift: `whileHover={{ y: -4, borderColor: "rgba(6, 182, 212, 0.5)" }}`

## 🚫 Anti-Patterns to Avoid
- **NO Overly Long Durations**: Keep UI transitions between 150ms and 300ms. Long transitions feel sluggish.
- **NO Jarring Layout Shifts**: Use `layout` prop carefully when items change order.
- **NO Ignoring Reduced Motion**: Respect users who prefer reduced motion:
  ```typescript
  const prefersReducedMotion = useReducedMotion();
  ```
