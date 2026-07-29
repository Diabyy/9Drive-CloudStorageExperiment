---
name: react-next-expert
description: Architect modular, reusable, high-performance React & Next.js components following clean code principles.
---

# React & Next.js Component Architecture Manual

Architectural guidelines for building type-safe, modular, reusable, and high-performance React 18+ and Next.js App Router components.

## 🏗️ Core Architecture & Component Rules

### 1. Strict Prop Contracts & Type Safety
Define clear, explicit TypeScript interfaces for all component props, state objects, and API response structures.

```typescript
export interface ComponentProps {
  title: string;
  items: ItemType[];
  isLoading?: boolean;
  onAction?: (id: string) => void;
  className?: string;
}
```

### 2. Single Responsibility & Component Breakdown
- Separate UI presentation from data fetching and complex business logic.
- Divide large pages into focused sub-components (`<Header />`, `<Sidebar />`, `<FileBrowser />`, `<Modal />`).
- Keep components under 250 lines of code; extract logic into custom hooks (`useFileUpload`, `useQuotaTracker`).

### 3. State Management Best Practices
- **Local State**: Keep transient UI state (modal open/close, active tab, hover states) within the local component.
- **Derived State**: Compute values during render instead of duplicating state:
  ```typescript
  // DO THIS
  const freeQuotaBytes = totalQuotaBytes - usedQuotaBytes;
  ```
- **Immutability**: Never mutate state objects directly. Always return new copies using functional updates (`setItems((prev) => [...prev, newItem])`).

### 4. High Performance & Memoization
- Use `useCallback` for event handlers passed down to heavy child components to prevent un-needed re-renders.
- Use `useMemo` for expensive calculations (e.g. sorting/filtering large file lists).
- Implement clean skeleton loading states during async fetch operations.

## 🚫 Anti-Patterns to Avoid
- **NO Any Types**: Avoid `any` in TypeScript.
- **NO Direct DOM Mutations**: Never use `document.getElementById` or mutate DOM properties directly.
- **NO Prop Drilling**: Use React Context or custom hooks for deep state sharing.
- **NO Unhandled Async Errors**: Always wrap API calls in `try/catch` with user-facing toast/alert notifications.
