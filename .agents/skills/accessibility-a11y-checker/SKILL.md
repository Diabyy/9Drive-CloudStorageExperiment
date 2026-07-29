---
name: accessibility-a11y-checker
description: Audits UI components for WCAG AA/AAA compliance, color contrast ratios, keyboard navigation, and ARIA attributes.
---

# Accessibility (A11y) & WCAG Compliance Manual

Technical audit standards ensuring generated UI components comply with WCAG 2.1 Level AA and Level AAA accessibility specifications.

## ♿ Technical Accessibility Checklist

### 1. Color Contrast Ratios (WCAG 2.1 AA/AAA)
- **Normal Text (< 18pt)**: Minimum 4.5:1 contrast ratio against its background.
- **Large Text (>= 18pt or 14pt bold)**: Minimum 3.0:1 contrast ratio.
- **UI Components & Icons**: Minimum 3.0:1 contrast ratio against adjacent colors.

### 2. Interactive Controls & Focus Indicators
- Every clickable button, link, or input MUST display an explicit, high-visibility focus outline when navigated via keyboard:
  ```tsx
  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 cursor-pointer"
  ```
- Interactive target size MUST be at least 44x44 pixels (or padded sufficiently).

### 3. ARIA Roles & Attributes
- Dynamic buttons without visible text MUST include `aria-label`:
  ```tsx
  <button aria-label="Close Preview Modal" onClick={onClose}>
    <X className="w-5 h-5" />
  </button>
  ```
- Expandable controls (accordions, dropdowns) MUST include `aria-expanded={isOpen}`.
- Dialogs/Modals MUST include `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.

### 4. Keyboard Navigation & Focus Trap
- Modals MUST trap focus inside while open and close on pressing the `Escape` key.
- Tab order MUST follow logical visual flow.

### 5. Semantic HTML Elements
Use proper semantic HTML structure instead of generic `<div>` tags:
- `<main>` for primary workspace content.
- `<header>` for global navigation and app title.
- `<nav>` for sidebar or navbar navigation links.
- `<button>` for clickable trigger actions (never `<div onClick>`).

## 🚫 Anti-Patterns to Avoid
- **NO `outline-none` Without Replacement**: Never strip default browser focus without adding `focus-visible:ring-*`.
- **NO Low Contrast Text**: Avoid muted gray text (`text-gray-600`) on dark backgrounds (`#111827`).
- **NO Missing Image Alt Tags**: Every `<img />` MUST have a descriptive `alt` attribute.
