# Performance Engineering - Developer Guide

## Quick Start

Cette application a ete optimisee de maniere aggressive pour maximiser les performances frontend. Ce guide explique comment maintenir et ameliorer ces performances.

---

## Architecture Performance

### Principe de Base

**OBSESSION = VITESSE**

1. **Memoization First**: Tout composant qui reçoit des props complexes doit etre memoize
2. **GPU Only**: Animations uniquement avec `transform` et `opacity`
3. **Code Split**: Lazy load tout ce qui n'est pas critique
4. **Bundle Police**: Aucun chunk > 200 KB
5. **Mobile First**: iPhone SE comme reference

---

## Regles de Performance

### ✅ DO: Best Practices

#### 1. Memoize Components

```typescript
// ✅ BON
import { memo } from 'react'

function MyComponent({ data }) {
  return <div>{data}</div>
}

export default memo(MyComponent)
```

```typescript
// ❌ MAUVAIS
export default function MyComponent({ data }) {
  return <div>{data}</div>
}
```

#### 2. Memoize Calculations

```typescript
// ✅ BON
const expensiveValue = useMemo(() => {
  return data.reduce((sum, item) => sum + item.value, 0)
}, [data])
```

```typescript
// ❌ MAUVAIS
const expensiveValue = data.reduce((sum, item) => sum + item.value, 0)
```

#### 3. Memoize Callbacks

```typescript
// ✅ BON
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

```typescript
// ❌ MAUVAIS
const handleClick = () => {
  doSomething(id)
}
```

#### 4. GPU Animations

```css
/* ✅ BON */
.card {
  transition: transform 0.3s, opacity 0.3s;
  will-change: transform;
  transform: translateZ(0);
}

.card:hover {
  transform: translateY(-4px) translateZ(0);
}
```

```css
/* ❌ MAUVAIS */
.card {
  transition: all 0.3s;
}

.card:hover {
  margin-top: -4px; /* Declenche layout! */
}
```

#### 5. Lazy Loading

```typescript
// ✅ BON
import { lazy } from 'react'
const Dashboard = lazy(() => import('./pages/Dashboard'))
```

```typescript
// ❌ MAUVAIS
import Dashboard from './pages/Dashboard'
```

---

### ❌ DON'T: Anti-patterns

#### 1. Context Sans Memoization

```typescript
// ❌ MAUVAIS - Re-cree l'objet a chaque render
const value = { data, setData, helpers }

// ✅ BON - Memoize la valeur
const value = useMemo(() => ({ data, setData, helpers }), [data, setData, helpers])
```

#### 2. Inline Functions

```typescript
// ❌ MAUVAIS - Nouvelle fonction a chaque render
<Button onClick={() => handleClick(id)}>Click</Button>

// ✅ BON - Fonction stable
const onClick = useCallback(() => handleClick(id), [id])
<Button onClick={onClick}>Click</Button>
```

#### 3. .reduce() Chains

```typescript
// ❌ MAUVAIS - Multiple iterations
const total = data
  .reduce((sum, item) => sum + item.values.reduce((s, v) => s + v, 0), 0)

// ✅ BON - Single loop
let total = 0
for (const item of data) {
  for (const value of item.values) {
    total += value
  }
}
```

#### 4. Animations Non-GPU

```css
/* ❌ MAUVAIS - Layout/Paint */
.card:hover {
  width: 300px;
  height: 400px;
  margin-left: 20px;
}

/* ✅ BON - GPU only */
.card:hover {
  transform: scale(1.1) translateZ(0);
  opacity: 0.9;
}
```

---

## Checklist Avant Commit

### Performance Audit

Avant chaque commit qui touche les composants:

```bash
# 1. Build et verifier taille bundle
npm run build

# Check output:
# - Tous les chunks < 200 KB? ✅
# - Initial bundle < 15 KB gzipped? ✅
# - CSS < 10 KB gzipped? ✅

# 2. Analyser bundle
npm run build:analyze

# Check:
# - Pas de duplication de dependances? ✅
# - Vendor chunks bien separes? ✅
# - Lazy loading fonctionne? ✅

# 3. Test dev perf
npm run dev

# Verifier:
# - Dev server < 300ms? ✅
# - HMR < 100ms? ✅
```

### Code Review Checklist

- [ ] Nouveau composant = React.memo()?
- [ ] Calculs couteux = useMemo()?
- [ ] Callbacks = useCallback()?
- [ ] Nouvelle route = lazy()?
- [ ] Animations = transform/opacity only?
- [ ] Pas de console.log en production?
- [ ] TypeScript sans erreurs?
- [ ] Bundle size acceptable?

---

## Performance Monitoring

### Outils

#### 1. Bundle Analysis

```bash
npm run build:analyze
```

Ouvre `dist/stats.html` avec treemap interactive:
- Voir taille de chaque module
- Identifier duplications
- Trouver code mort

#### 2. Lighthouse

```bash
# Desktop
npx lighthouse http://localhost:4173 --preset=desktop --view

# Mobile
npx lighthouse http://localhost:4173 --preset=perf --view
```

Targets:
- Performance: > 90 (desktop), > 85 (mobile)
- FCP: < 1.5s (desktop), < 2.5s (mobile)
- LCP: < 2.0s (desktop), < 3.0s (mobile)
- TBT: < 150ms
- CLS: < 0.1

#### 3. Chrome DevTools

**Performance Tab:**
1. Record interaction
2. Check FPS (should be 60)
3. Check Main thread (no long tasks > 50ms)
4. Check Layout shifts

**Memory Tab:**
1. Take heap snapshot
2. Navigate app
3. Take another snapshot
4. Check for memory leaks

---

## Common Scenarios

### Scenario 1: Ajouter Nouveau Composant

```typescript
// 1. Create component
import { memo } from 'react'

interface Props {
  data: Data[]
  onAction: (id: string) => void
}

function MyComponent({ data, onAction }: Props) {
  // 2. Memoize calculations
  const total = useMemo(() =>
    data.reduce((sum, item) => sum + item.value, 0),
    [data]
  )

  // 3. Memoize callbacks
  const handleClick = useCallback((id: string) => {
    onAction(id)
  }, [onAction])

  return <div>...</div>
}

// 4. Export memoized
export default memo(MyComponent)
```

### Scenario 2: Ajouter Nouvelle Page

```typescript
// 1. Create page component
// src/pages/NewPage.tsx
export default function NewPage() {
  return <div>New Page</div>
}

// 2. Lazy load in App.tsx
import { lazy } from 'react'

const NewPage = lazy(() => import('./pages/NewPage'))

// 3. Add route
<Route path="new" element={<NewPage />} />
```

### Scenario 3: Optimiser Context

```typescript
// 1. Memoize all functions
const addItem = useCallback((item) => {
  setItems(prev => [...prev, item])
}, [])

// 2. Memoize context value
const value = useMemo(() => ({
  items,
  addItem,
  // ... other values
}), [items, addItem])

// 3. Use context value
return <Context.Provider value={value}>{children}</Context.Provider>
```

---

## Debugging Performance Issues

### Problem: Slow Re-renders

**Solution:**
1. Install React DevTools
2. Enable "Highlight updates"
3. Interact with app
4. Find components that re-render excessively
5. Add `memo()` or check `useMemo`/`useCallback` dependencies

### Problem: Large Bundle

**Solution:**
```bash
npm run build:analyze

# Look for:
# 1. Duplicate packages (fix with proper imports)
# 2. Large unused dependencies (remove)
# 3. Missing lazy loading (add lazy())
```

### Problem: Jank Animations

**Solution:**
1. DevTools → Performance → Rendering
2. Enable "Paint flashing"
3. Animate element
4. If green flashes = repaint (BAD)
5. Switch to `transform`/`opacity`

---

## Performance Patterns

### Pattern: List Rendering

```typescript
// Heavy list - virtualize if > 100 items
import { memo } from 'react'

const ListItem = memo(({ item }: { item: Item }) => {
  return <div>{item.name}</div>
})

function List({ items }: { items: Item[] }) {
  return (
    <div>
      {items.map(item => (
        <ListItem key={item.id} item={item} />
      ))}
    </div>
  )
}
```

### Pattern: Complex State Updates

```typescript
// Use functional updates
setItems(prev => {
  const updated = [...prev]
  updated[index] = newValue
  return updated
})

// NOT
setItems([...items, newItem]) // Creates dependency on items
```

### Pattern: Event Handlers

```typescript
// Stable reference
const handlers = useMemo(() => ({
  onClick: (id: string) => handleClick(id),
  onDelete: (id: string) => handleDelete(id),
}), []) // No deps if handlers don't use props/state

// Pass to children
<Child handlers={handlers} />
```

---

## Resources

### Internal Docs
- `PERFORMANCE-REPORT.md` - Detailed optimization report
- `PERFORMANCE-TESTING.md` - How to test performance
- `OPTIMIZATIONS-SUMMARY.md` - Quick reference
- `CHANGELOG-PERFORMANCE.md` - Change history

### External Resources
- [React Performance](https://react.dev/learn/render-and-commit)
- [Web.dev Performance](https://web.dev/performance/)
- [CSS Triggers](https://csstriggers.com/)
- [Core Web Vitals](https://web.dev/vitals/)

---

## Performance Budget

### Hard Limits (CI should fail if exceeded)
- Initial bundle: 15 KB gzipped
- Per-route chunk: 10 KB gzipped
- Total app: 150 KB gzipped
- Lighthouse Performance: > 90 (desktop), > 85 (mobile)

### Soft Limits (Review required)
- Single component: 5 KB gzipped
- Vendor chunks: 100 KB gzipped
- CSS bundle: 10 KB gzipped

---

## Contact

Pour questions sur performance:
1. Check `PERFORMANCE-REPORT.md`
2. Check `PERFORMANCE-TESTING.md`
3. Run `npm run build:analyze`
4. Ask maintainer

---

**Remember:**
- Premature optimization is evil
- Measured optimization is mandatory
- User experience > Developer experience

**Every millisecond counts.**

---

*Guide maintenu par: Performance Team*
*Last updated: 2026-01-10*
