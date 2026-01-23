# 🚀 TanStack Query - Quick Start Guide

## 📦 Installation Complete

The following packages have been installed:
- `@tanstack/react-query` - Server state management
- `@tanstack/react-virtual` - List virtualization
- `@tanstack/react-query-devtools` - Development tools
- `zustand` - UI state management

## ✅ What Was Implemented

### 1. Core Infrastructure
- ✅ QueryClient configuration ([lib/query-client.ts](../lib/query-client.ts))
- ✅ QueryProvider wrapper ([lib/providers/query-provider.tsx](../lib/providers/query-provider.tsx))
- ✅ Integrated into root layout ([app/layout.tsx](../app/layout.tsx))

### 2. Type System
- ✅ Question types ([lib/types/questions.ts](../lib/types/questions.ts))
- ✅ Filter types
- ✅ API request/response types
- ✅ Cursor encoding/decoding utilities

### 3. Backend (BFF Layer)
- ✅ Questions API route ([app/api/questions/route.ts](../app/api/questions/route.ts))
- ✅ Single question route ([app/api/questions/[id]/route.ts](../app/api/questions/[id]/route.ts))
- ✅ Cursor-based pagination
- ✅ Server-side filtering
- ✅ Response caching

### 4. Data Fetching Hooks
- ✅ `useInfiniteQuestions` - Infinite scroll query ([hooks/use-questions.ts](../hooks/use-questions.ts))
- ✅ `useQuestion` - Single question query
- ✅ `usePrefetchNextPage` - Prefetch optimization
- ✅ Query key factory for cache management

### 5. UI State Management
- ✅ Zustand store for UI state ([stores/question-ui-store.ts](../stores/question-ui-store.ts))
- ✅ Selected question tracking
- ✅ View mode persistence
- ✅ Quiz/practice mode state

### 6. Components
- ✅ VirtualizedQuestionList ([components/virtualized-question-list.tsx](../components/virtualized-question-list.tsx))
- ✅ QuestionFilters with URL sync ([features/questions/components/question-filters.tsx](../features/questions/components/question-filters.tsx))
- ✅ QuestionsPageClient ([features/questions/components/questions-page-client.tsx](../features/questions/components/questions-page-client.tsx))
- ✅ Questions page entry ([features/questions/page.tsx](../features/questions/page.tsx))

### 7. Database Optimization
- ✅ Migration script with all required indexes ([scripts/020_optimize_questions_pagination.sql](../scripts/020_optimize_questions_pagination.sql))

### 8. Documentation
- ✅ Complete architecture guide ([TANSTACK_QUERY_ARCHITECTURE.md](./TANSTACK_QUERY_ARCHITECTURE.md))
- ✅ Integration examples ([examples/tanstack-query-integration.tsx](./examples/tanstack-query-integration.tsx))

---

## 🎯 Next Steps

### Step 1: Run Database Migration

Apply the indexes for optimal performance:

```bash
# Option A: Via Supabase Dashboard
# 1. Go to SQL Editor
# 2. Copy content from scripts/020_optimize_questions_pagination.sql
# 3. Run the script

# Option B: Via psql
psql -h your-db-host -U postgres -d postgres -f scripts/020_optimize_questions_pagination.sql
```

### Step 2: Test the API

```bash
# Start the dev server
npm run dev

# Test in another terminal
curl http://localhost:3000/api/questions?limit=5

# Test with filters
curl "http://localhost:3000/api/questions?difficulty=hard&limit=10"
```

### Step 3: Access the Questions Page

Navigate to the questions page in your app:
```
http://localhost:3000/features/questions
```

Or integrate the components into your existing routes.

### Step 4: Enable DevTools (Development Only)

The React Query DevTools are automatically enabled in development mode. Look for the floating icon in the bottom-right corner of your app.

---

## 🔧 Integration into Existing Pages

### Option 1: Replace Existing Questions Page

If you have an existing questions page at `/app/questions/page.tsx`:

```tsx
// app/questions/page.tsx
export { default } from "@/features/questions/page";
```

### Option 2: Use Components Separately

```tsx
"use client";

import { useInfiniteQuestions } from "@/hooks/use-questions";
import { VirtualizedQuestionList } from "@/components/virtualized-question-list";

export default function YourPage() {
  const { allQuestions, hasNextPage, fetchNextPage, isFetchingNextPage, isLoading } = 
    useInfiniteQuestions({ status: "approved" }, 20);

  return (
    <VirtualizedQuestionList
      questions={allQuestions}
      hasMore={hasNextPage || false}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      isLoading={isLoading}
    />
  );
}
```

### Option 3: Add to Existing Dashboard

```tsx
import { useInfiniteQuestions } from "@/hooks/use-questions";

export function DashboardQuestions() {
  const { allQuestions, isLoading } = useInfiniteQuestions(
    { status: "approved" },
    10 // Load 10 for dashboard
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Recent Questions</h2>
      {allQuestions.slice(0, 5).map(q => (
        <div key={q.id}>{q.text}</div>
      ))}
    </div>
  );
}
```

---

## 📊 Performance Checklist

After integration, verify performance improvements:

### Before First Load
- [ ] Run migration script
- [ ] Verify indexes created: `SELECT * FROM pg_indexes WHERE tablename = 'questions';`
- [ ] Clear browser cache

### Test Metrics
- [ ] Initial page load < 1s
- [ ] Scroll to next page < 300ms
- [ ] DevTools shows query caching working
- [ ] Memory usage stable during infinite scroll
- [ ] No console errors or warnings

### Developer Experience
- [ ] TanStack Query DevTools visible in dev mode
- [ ] Zustand DevTools connected (via Redux DevTools extension)
- [ ] Hot reload works correctly
- [ ] TypeScript types working

---

## 🐛 Common Issues & Solutions

### Issue: "Module not found: @tanstack/react-query"

**Solution:** Dependencies installed successfully. Restart dev server:
```bash
npm run dev
```

### Issue: API returns empty data

**Solution:** Check Supabase connection and RLS policies:
```sql
-- Verify questions table exists
SELECT COUNT(*) FROM questions;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'questions';
```

### Issue: Virtualized list not rendering

**Solution:** Ensure parent has explicit height:
```css
.parent-container {
  height: 100vh; /* or fixed height like 600px */
  overflow: hidden;
}
```

### Issue: Filters not working

**Solution:** Verify searchParams are updating:
```tsx
const searchParams = useSearchParams();
console.log(Object.fromEntries(searchParams.entries()));
```

---

## 📈 Monitoring & Optimization

### Watch These Metrics

1. **Query Cache Size**
   - Open React Query DevTools
   - Check "Query Cache" tab
   - Should see queries with proper keys

2. **Network Requests**
   - Open browser DevTools > Network
   - Filter by "questions"
   - Verify deduplication (same query = single request)

3. **Render Performance**
   - Open React DevTools > Profiler
   - Record a scroll session
   - Verify only visible items re-render

---

## 🎓 Learning Resources

### Recommended Reading Order
1. [TanStack Query - Quick Start](https://tanstack.com/query/latest/docs/framework/react/quick-start)
2. [Infinite Queries Guide](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries)
3. [Our Architecture Doc](./TANSTACK_QUERY_ARCHITECTURE.md)
4. [Integration Examples](./examples/tanstack-query-integration.tsx)

### Video Tutorials
- [TanStack Query in 100 Seconds](https://www.youtube.com/watch?v=novnyCaa7To)
- [React Query Full Course](https://www.youtube.com/watch?v=8K1N3fE-cDs)

---

## ✨ Features to Build Next

Now that the foundation is in place, you can easily add:

- [ ] Optimistic updates for create/edit/delete
- [ ] Real-time updates with Supabase subscriptions
- [ ] Advanced filtering (date ranges, multiple topics)
- [ ] Saved filter presets
- [ ] Export questions to PDF/CSV
- [ ] Batch operations (bulk approve, delete)
- [ ] Question recommendations
- [ ] Analytics dashboard

---

## 🙋 Need Help?

1. Check [TANSTACK_QUERY_ARCHITECTURE.md](./TANSTACK_QUERY_ARCHITECTURE.md) for detailed explanations
2. Review [integration examples](./examples/tanstack-query-integration.tsx)
3. Inspect React Query DevTools in dev mode
4. Check browser console for errors

---

## 📝 Summary

You now have:
- ✅ High-performance data fetching with TanStack Query
- ✅ Cursor-based pagination for consistent performance
- ✅ List virtualization for rendering thousands of items
- ✅ URL-driven filters for shareable links
- ✅ Clean separation of server state (TanStack Query) and UI state (Zustand)
- ✅ Secure BFF layer with Next.js API routes
- ✅ Production-ready, scalable architecture

**Start building! 🚀**
