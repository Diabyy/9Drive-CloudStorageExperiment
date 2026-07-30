---
name: i18n-9drive
description: Enforce bilingual (ID/EN) translation consistency for 9DRIVE. Use when adding UI text, labels, buttons, toast messages, or modifying any user-facing string.
---

# i18n — 9DRIVE Bilingual Enforcement

## Translation File

All translations live in a single file:
- `src/i18n/translations.ts`

Type: `Language = 'id' | 'en'`
Storage: `localStorage` key `9drive_lang`, default `'id'`

## Rules

### 1. Always Both Languages
Every new UI string MUST be added to **both** `id` and `en` blocks in `translations.ts`. No exceptions. If you add a key to `id`, you add it to `en` in the same edit.

### 2. Key Naming Convention
Use `sectionName.elementDescription` format:
```
✅  sidebar.allFiles
✅  settings.savePreferences
✅  uploadZone.dropFilesHere
❌  text1
❌  btn_submit
❌  label2
```

New sections get a comment header matching existing style:
```typescript
// Section Name
keyName: 'Value',
```

### 3. Natural Translation
Indonesian is **not** word-for-word English. Translate idiomatically:
```
✅  "Drop files here" → "Lepaskan berkas di sini"
❌  "Drop files here" → "Jatuhkan berkas di sini"

✅  "Clear Finished"  → "Bersihkan Selesai"
❌  "Clear Finished"  → "Hapus Yang Sudah Selesai"
```

Keep the same register (formal-casual) as existing translations.

### 4. Completeness Check
After editing `translations.ts`, verify that the `id` block and `en` block have **identical key structures**. Nested objects (like `categories`) must mirror exactly.

### 5. Component Usage Pattern
Pass `lang` prop from parent. Access via:
```tsx
import { translations } from '../i18n/translations';
// ...
const t = translations[lang];
return <span>{t.sidebar.allFiles}</span>;
```

Do NOT hardcode strings in components. Every user-facing string goes through `translations`.
