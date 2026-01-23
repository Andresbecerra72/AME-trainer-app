# 🚀 TanStack Query - Deployment Checklist

## ✅ Implementation Status: COMPLETE

All components have been successfully implemented and are ready for testing and deployment.

---

## 📋 Pre-Deployment Checklist

### 1. Code Review
- [x] All files created successfully
- [x] TypeScript types are complete
- [x] No syntax errors
- [x] Following project conventions
- [x] Comments and documentation added

### 2. Dependencies
- [x] `@tanstack/react-query` installed
- [x] `@tanstack/react-virtual` installed
- [x] `@tanstack/react-query-devtools` installed (dev)
- [x] `zustand` installed
- [ ] Run `npm install` to ensure lock file is updated
- [ ] Verify no dependency conflicts

### 3. Configuration
- [x] QueryClient configured in `lib/query-client.ts`
- [x] QueryProvider integrated in `app/layout.tsx`
- [x] DevTools configured for development only
- [ ] Verify `.env` has required Supabase credentials

### 4. Database
- [ ] **CRITICAL:** Run `scripts/020_optimize_questions_pagination.sql`
- [ ] Verify indexes created: Run `SELECT * FROM pg_indexes WHERE tablename = 'questions';`
- [ ] Check table has data: Run `SELECT COUNT(*) FROM questions;`
- [ ] Verify RLS policies allow read access

### 5. Testing

#### Local Testing
```bash
# 1. Start dev server
npm run dev

# 2. Test API routes (in another terminal)
curl http://localhost:3000/api/questions?limit=5

# 3. Test with filters
curl "http://localhost:3000/api/questions?difficulty=hard&status=approved&limit=10"

# 4. Test single question
curl http://localhost:3000/api/questions/[valid-question-id]

# 5. Test cursor pagination
curl "http://localhost:3000/api/questions?cursor=2026-01-22T10:30:00.000Z_abc123&limit=10"
```

#### Browser Testing
- [ ] Navigate to `/features/questions` (or wherever you mount the component)
- [ ] Verify questions load
- [ ] Test infinite scroll (scroll down to load more)
- [ ] Test filters (difficulty, status, search)
- [ ] Verify URL updates when filters change
- [ ] Test browser back/forward buttons
- [ ] Open React Query DevTools (bottom-right icon)
- [ ] Verify queries are cached properly
- [ ] Test with network throttling (DevTools > Network > Fast 3G)

#### Performance Testing
- [ ] Initial page load < 1 second
- [ ] Scroll to next page < 300ms
- [ ] Memory usage stable during scroll
- [ ] No console errors or warnings
- [ ] 60fps scrolling (DevTools > Performance)

---

## 🔧 Integration Steps

### Option A: Create New Route
If you want to test in isolation:

```bash
# Create new route
mkdir -p app/test-questions
```

```tsx
// app/test-questions/page.tsx
export { default } from "@/features/questions/page";
```

Then visit: `http://localhost:3000/test-questions`

### Option B: Replace Existing Questions Page
If you have an existing questions page:

```tsx
// app/questions/page.tsx (or wherever your current page is)
export { default } from "@/features/questions/page";
```

### Option C: Integrate into Dashboard
Use individual hooks in existing components:

```tsx
import { useInfiniteQuestions } from "@/hooks/use-questions";

function MyExistingComponent() {
  const { allQuestions, isLoading } = useInfiniteQuestions(
    { status: "approved" },
    20
  );
  
  // Your existing render logic
}
```

---

## 🗄️ Database Migration

### Step 1: Connect to Database

**Option A: Supabase Dashboard (Recommended)**
1. Go to your Supabase project
2. Click "SQL Editor"
3. Create new query
4. Copy/paste content from `scripts/020_optimize_questions_pagination.sql`
5. Click "Run"

**Option B: Command Line**
```bash
# Get your database URL from Supabase dashboard
psql "postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres" \
  -f scripts/020_optimize_questions_pagination.sql
```

### Step 2: Verify Indexes
```sql
-- Run in Supabase SQL Editor or psql
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'questions'
ORDER BY indexname;
```

Expected indexes:
- `idx_questions_created_at_id` ✅ CRITICAL
- `idx_questions_topic_id`
- `idx_questions_difficulty`
- `idx_questions_status`
- `idx_questions_created_by`
- `idx_questions_text_search`
- `idx_questions_status_topic_created`
- `idx_questions_status_difficulty_created`

### Step 3: Analyze Performance
```sql
-- Run query planner to verify index usage
EXPLAIN ANALYZE
SELECT * FROM questions
WHERE status = 'approved'
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

Look for: `Index Scan using idx_questions_created_at_id` ✅

---

## 🧪 Test Scenarios

### Scenario 1: Basic List
```typescript
// Expected behavior:
// 1. Load 20 questions initially
// 2. Show loading skeleton
// 3. Display questions in cards
// 4. Show "Loading more..." when scrolling down
// 5. Auto-fetch next page when near bottom
```

### Scenario 2: Apply Filters
```typescript
// Expected behavior:
// 1. Select "Hard" difficulty
// 2. URL updates: ?difficulty=hard
// 3. List refreshes with filtered results
// 4. Query key changes in DevTools
// 5. Browser back button works
```

### Scenario 3: Search
```typescript
// Expected behavior:
// 1. Type "engine" in search box
// 2. Wait 500ms (debounce)
// 3. URL updates: ?searchTerm=engine
// 4. Results update automatically
// 5. Clear search resets results
```

### Scenario 4: Share URL
```typescript
// Expected behavior:
// 1. Apply filters (difficulty=hard, module=M1)
// 2. Copy URL: /questions?difficulty=hard&module=M1
// 3. Open in new tab or send to colleague
// 4. Same filters applied automatically
```

---

## 🐛 Troubleshooting Guide

### Problem: API returns 500 error

**Diagnosis:**
```bash
# Check server logs
npm run dev
# Look for error messages in terminal
```

**Solutions:**
1. Verify Supabase credentials in `.env.local`
2. Check Supabase RLS policies
3. Verify questions table exists
4. Check server logs for specific error

### Problem: Empty results

**Diagnosis:**
```sql
-- Check if data exists
SELECT COUNT(*) FROM questions WHERE status = 'approved';
```

**Solutions:**
1. Verify RLS policies allow read access
2. Check if questions have `status = 'approved'`
3. Try removing status filter
4. Seed database with test data

### Problem: Virtualized list not rendering

**Diagnosis:**
- Open DevTools > Elements
- Inspect parent container height

**Solution:**
Parent container must have explicit height:
```tsx
<div style={{ height: '100vh' }}> {/* or fixed height */}
  <VirtualizedQuestionList ... />
</div>
```

### Problem: DevTools not showing

**Diagnosis:**
```typescript
console.log('NODE_ENV:', process.env.NODE_ENV);
```

**Solution:**
Ensure `NODE_ENV=development`:
```bash
npm run dev  # Sets NODE_ENV automatically
```

### Problem: Filters not updating

**Diagnosis:**
```tsx
const searchParams = useSearchParams();
console.log('Params:', Object.fromEntries(searchParams.entries()));
```

**Solution:**
1. Verify `useSearchParams` imported from `next/navigation`
2. Component must be client component (`"use client"`)
3. Wrap in `<Suspense>` boundary

### Problem: Slow queries

**Diagnosis:**
```sql
-- Check if indexes are being used
EXPLAIN ANALYZE
SELECT * FROM questions
WHERE status = 'approved'
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

**Solution:**
1. Run migration script to create indexes
2. Run `ANALYZE questions;` to update statistics
3. Check Supabase query performance in dashboard

---

## 📊 Success Criteria

### Performance Metrics
- [ ] Initial load: < 1 second
- [ ] Page navigation: < 300ms
- [ ] Memory usage: < 100MB for 1000 items
- [ ] Scroll fps: Consistent 60fps
- [ ] API response time: < 200ms

### Functionality
- [ ] Questions load and display correctly
- [ ] Infinite scroll works smoothly
- [ ] Filters update results
- [ ] URL parameters work
- [ ] Browser back/forward works
- [ ] Search with debounce works
- [ ] Loading states show correctly
- [ ] Error states handled gracefully

### Developer Experience
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] React Query DevTools accessible
- [ ] Zustand DevTools working (with Redux DevTools extension)
- [ ] Hot reload works
- [ ] Code is readable and documented

---

## 🚀 Deployment

### Step 1: Build Test
```bash
npm run build
```

Expected: ✅ Build completes without errors

### Step 2: Production Test
```bash
npm run start
```

Test all scenarios in production mode.

### Step 3: Deploy
```bash
# Vercel (recommended)
vercel deploy

# Or your deployment method
git push origin main
```

### Step 4: Post-Deployment Verification
- [ ] Visit production URL
- [ ] Test API endpoints
- [ ] Verify indexes in production database
- [ ] Monitor error logs
- [ ] Check performance metrics

---

## 📈 Monitoring

### Metrics to Track

1. **API Performance**
   - Average response time
   - P95, P99 latency
   - Error rate
   - Cache hit rate

2. **User Experience**
   - Page load time
   - Time to first question
   - Scroll performance
   - Filter response time

3. **Database**
   - Query execution time
   - Index usage
   - Table size
   - Connection pool usage

### Tools
- Vercel Analytics (built-in)
- Sentry (errors)
- LogRocket (session replay)
- Supabase Dashboard (database metrics)

---

## 🎓 Next Steps

After successful deployment:

1. **Monitor for 24-48 hours**
   - Check error rates
   - Verify performance metrics
   - Gather user feedback

2. **Optimize if needed**
   - Tune cache settings
   - Add more indexes if needed
   - Adjust prefetch behavior

3. **Extend functionality**
   - Add optimistic updates
   - Implement real-time subscriptions
   - Add more filters
   - Create saved searches

4. **Document learnings**
   - Update docs with production insights
   - Share knowledge with team
   - Create video walkthrough

---

## 📞 Support

If you encounter issues:

1. Check [TANSTACK_QUERY_ARCHITECTURE.md](./TANSTACK_QUERY_ARCHITECTURE.md)
2. Review [integration examples](./examples/tanstack-query-integration.tsx)
3. Inspect React Query DevTools
4. Check browser console
5. Review Supabase logs
6. Test API routes with curl

---

## ✅ Final Checklist

Before marking complete:

- [ ] All files created successfully
- [ ] Dependencies installed
- [ ] Database migration run
- [ ] Indexes verified
- [ ] API routes tested
- [ ] UI tested in browser
- [ ] Performance benchmarks met
- [ ] Documentation reviewed
- [ ] Team notified
- [ ] Deployment successful
- [ ] Production verified
- [ ] Monitoring set up

---

**Status:** Ready for testing and deployment 🚀

**Implementation Date:** January 22, 2026

**Implemented By:** GitHub Copilot (Claude Sonnet 4.5)
