---
name: tailwind-component-builder
description: Converts wireframes, layouts, and design systems into clean, responsive, utility-first Tailwind CSS components.
---

# Tailwind Component Builder Manual & Technical Guidelines

Specialized skill for building ultra-clean, high-performance, responsive Tailwind CSS components following modern UI design systems (Dark Cyber Minimalism, Glassmorphism, Bento Grid, Neumorphism).

## 🎨 Styling Principles & Rules

### 1. Color System & Surface Hierarchy
- Use curated, high-contrast dark mode surface tokens:
  - **Main Background**: `#090D16` (`bg-[#090D16]`)
  - **Card Surface**: `#111827` (`bg-[#111827]`) or `#0F172A` (`bg-slate-900`)
  - **Borders**: `#1F2937` (`border-gray-800`) or subtle cyan glow (`border-cyan-500/30`)
- **Accents**: Neon Cyan (`#06B6D4`), Deep Indigo (`#6366F1`), Emerald (`#10B981`), Rose (`#F43F5E`).

### 2. Glassmorphism & Depth Effects
```tsx
// Standard Premium Glass Surface Pattern
className="bg-[#111827]/80 backdrop-blur-md border border-gray-800/80 rounded-2xl shadow-xl shadow-black/40"
```

### 3. Typography & Spacing Scales
- Use high-tracking headings (`tracking-wider`, `tracking-widest`, `uppercase`).
- Spacing consistency: `p-4 sm:p-6 lg:p-8`, `gap-4 sm:gap-6`, `space-y-4`.

### 4. Responsive Breakpoints
Ensure layout adapts fluidly across 4 standard viewports:
- Mobile: `375px` (default)
- Tablet: `768px` (`md:`)
- Desktop: `1024px` (`lg:`)
- Wide Desktop: `1440px+` (`xl:`, `2xl:`)

### 5. Interactive States & Micro-Transitions
- Always include explicit hover and active states with duration:
  `transition-all duration-200 ease-out hover:scale-[1.01] hover:border-cyan-500/50 cursor-pointer`

## 🚫 Anti-Patterns to Avoid
- **NO Plain Red/Blue/Green**: Use curated HSL/Hex palette tokens.
- **NO Emojis as Icons**: Use SVG vectors (`lucide-react` icons).
- **NO Arbitrary Hardcoded Spacing**: Use standard Tailwind spacing scale (`gap-4`, `p-6`).
- **NO Missing Focus Outlines**: Always provide `focus-visible:ring-2 focus-visible:ring-cyan-500`.
