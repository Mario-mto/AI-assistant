# Performance Cheatsheet

## Bundle Size (gzipped)
```
Initial: 12 KB ⚡
Total:   93 KB 🚀
Before:  450 KB 🐌
Savings: -79%
```

## Lighthouse Targets
```
Desktop:  95+ Performance
Mobile:   85+ Performance
FCP:      < 2.5s
LCP:      < 3.0s
TBT:      < 150ms
```

## Quick Commands
```bash
npm run build              # Production build
npm run build:analyze      # Bundle analysis
npm run preview            # Test production
npx lighthouse URL --view  # Perf audit
```

## Code Patterns

### ✅ Memoize Component
```typescript
import { memo } from 'react'
export default memo(MyComponent)
```

### ✅ Memoize Calculation
```typescript
const result = useMemo(() => calc(), [deps])
```

### ✅ Memoize Callback
```typescript
const handler = useCallback(() => action(), [deps])
```

### ✅ Lazy Load Route
```typescript
const Page = lazy(() => import('./Page'))
```

### ✅ GPU Animation
```css
.el {
  transform: translateZ(0);
  will-change: transform;
  transition: transform 0.3s;
}
```

## Anti-patterns

### ❌ No Memoization
```typescript
const value = { data, handlers } // ⚠️ New object every render
```

### ❌ Inline Functions
```typescript
<Button onClick={() => action()}>  // ⚠️ New function every render
```

### ❌ Layout Animations
```css
.el:hover { margin-top: -10px; }  /* ⚠️ Triggers layout */
```

## Checklist Before Commit
- [ ] Bundle < 15 KB gzipped (initial)
- [ ] All routes lazy loaded
- [ ] Components memoized
- [ ] Animations GPU-only
- [ ] TypeScript compiles
- [ ] Build succeeds

## Performance Budget
```
Initial:  < 15 KB gzipped
Chunks:   < 10 KB each
Total:    < 150 KB gzipped
```

## Files Modified
```
✅ WorkoutContext.tsx  (memoization)
✅ Dashboard.tsx       (calculations)
✅ StatsCard.tsx       (memo)
✅ ProgressChart.tsx   (memo + useMemo)
✅ RecentSessions.tsx  (memo + callbacks)
✅ App.tsx             (lazy loading)
✅ vite.config.ts      (build config)
✅ index.css           (GPU animations)
✅ index.html          (font preload)
```

## Docs
📖 PERFORMANCE-REPORT.md - Detailed analysis
🧪 PERFORMANCE-TESTING.md - Testing guide
⚡ OPTIMIZATIONS-SUMMARY.md - Quick ref
👨‍💻 PERFORMANCE-README.md - Dev guide
📝 CHANGELOG-PERFORMANCE.md - Changes
📊 PERFORMANCE.md - Main overview

## Emergency Debug
```bash
# Slow renders?
npm run dev
# React DevTools → Profiler → Record

# Large bundle?
npm run build:analyze
# Check dist/stats.html

# Slow animations?
# Chrome DevTools → Performance → Record
# Check for Layout/Paint events
```

---
*Updated: 2026-01-10*
