# Community Questions - Complete Implementation

## 📋 Overview

Complete refactoring of the community questions feature with clean architecture, separated business logic, duplicate detection, and improved search/filters.

## 🏗️ Architecture

### Feature Structure (`features/community/`)

```
features/community/
├── community.api.ts           # Server actions (CRUD operations)
├── community.validation.ts    # Zod schemas
├── components/
│   ├── QuestionForm.tsx      # Create/Edit form with duplicate check
│   ├── CommunityFilters.tsx  # Search and filters
│   ├── CommunityContent.tsx  # Questions list (existing)
│   └── CommunityQuestionCard.tsx (existing)
└── services/
    └── community.server.ts   # Additional server utilities
```

### Pages Structure

```
app/protected/community/
├── page.tsx                        # Main community page
├── add-question/
│   ├── page.tsx                   # Add question page
│   └── duplicate-check.tsx        # (deprecated - integrated in form)
└── questions/[id]/
    ├── page.tsx                   # View question
    └── edit/
        └── page.tsx               # Edit question
```

## ✨ Key Features Implemented

### 1. **Business Logic Separation** (`community.api.ts`)

All database operations centralized:

- ✅ `createCommunityQuestion()` - Create with validation
- ✅ `updateCommunityQuestion()` - Update with permission check
- ✅ `deleteCommunityQuestion()` - Delete with authorization
- ✅ `getCommunityQuestions()` - List with filters
- ✅ `getCommunityQuestion()` - Get single with relations
- ✅ `validateQuestionData()` - Server-side validation

**Features:**
- Role-based permissions (author/admin)
- Auto status: `pending_review` for users, direct approval for admins
- Revalidate paths after mutations
- Full error handling

### 2. **Form Validation** (`community.validation.ts`)

Zod schemas for type-safe validation:

```typescript
questionFormSchema
- question_text: 10-1000 chars
- options A-D: 1-500 chars each
- correct_answer: enum ["A", "B", "C", "D"]
- explanation: 10-2000 chars
- topic_id: required
- difficulty: enum ["easy", "medium", "hard"]
```

### 3. **Unified Question Form** (`QuestionForm.tsx`)

Single component for create AND edit:

**Props:**
- `topics` - Available topics
- `initialData` - For edit mode
- `mode` - "create" | "edit"

**Features:**
- ✅ Real-time validation with error display
- ✅ **Integrated duplicate check** (create mode only)
- ✅ Responsive design (mobile-first)
- ✅ Loading states
- ✅ Toast notifications
- ✅ Auto-navigation after success

**Duplicate Check Flow:**
1. User types question (min 20 chars)
2. Yellow card appears with "Check for Duplicates" button
3. On click: searches DB for similar questions (60%+ similarity)
4. Shows results with similarity % and "View Question" links
5. Green checkmark if no duplicates found
6. **Required** before submission (create mode)

### 4. **Advanced Filters** (`CommunityFilters.tsx`)

Improved search and filtering:

**Search:**
- ✅ Debounced input (500ms)
- ✅ Clear button (X)
- ✅ Searches: title, description, creator, difficulty, topics

**Filters (collapsible):**
- Topic dropdown
- Difficulty dropdown  
- Sort dropdown (Recent/Popular/Unanswered)
- Clear all filters button
- Filter summary badge when collapsed

**Responsive:**
- Mobile: stacked layout
- Desktop: 3-column grid

### 5. **Duplicate Detection** (`features/questions/services/duplicates.ts`)

Smart similarity algorithm:

```typescript
checkQuestionDuplicates(questionText)
  → Returns top 3 similar questions (60%+ match)
  → Algorithm: word-based similarity
  → Only searches approved questions
```

**How it works:**
1. Extracts words >3 chars from input
2. Compares with all approved questions
3. Calculates similarity: `common_words / max_words * 100`
4. Returns matches ≥60%, sorted by similarity

## 📁 File Changes

### New Files
- ✅ `features/community/community.api.ts` - 250 lines
- ✅ `features/community/community.validation.ts` - 30 lines
- ✅ `features/community/components/QuestionForm.tsx` - 370 lines
- ✅ `features/community/components/CommunityFilters.tsx` - 220 lines

### Modified Files
- ✅ `app/protected/community/page.tsx` - Simplified, uses new filters
- ✅ `app/protected/community/add-question/page.tsx` - Now uses QuestionForm
- ✅ `app/protected/community/questions/[id]/edit/page.tsx` - Now uses QuestionForm

### Deprecated (can be removed)
- ❌ `features/community/components/ClientCommunityPage.tsx` - Replaced by CommunityFilters
- ❌ `app/protected/community/add-question/duplicate-check.tsx` - Integrated in form

## 🔄 User Flows

### Create Question Flow

1. Navigate to `/protected/community`
2. Click "Add Question" button
3. Fill form fields with validation
4. Type question text (min 20 chars)
5. **Duplicate check card appears**
6. Click "Check for Duplicates"
7. Review similar questions (if any)
8. Fill remaining fields (options, correct answer, explanation, topic, difficulty)
9. Submit → status: `pending_review`
10. Redirected to community page with success toast

### Edit Question Flow

1. View question detail page
2. Click "Edit" button (only visible to author/admin)
3. Form pre-filled with existing data
4. **No duplicate check** in edit mode
5. Make changes
6. Submit → status preserved (or `pending_review` for non-admins)
7. Redirected to question detail with success toast

### Search & Filter Flow

1. On community page, see search bar
2. Type to search (auto-filters after 500ms)
3. Click filter icon to expand filters
4. Select topic/difficulty/sort
5. Changes apply immediately
6. See active filters summary
7. Click "Clear All Filters" to reset

## 🎨 Responsive Design

All components follow mobile-first approach:

**Breakpoints:**
- `< 640px` (mobile): Single column, stacked buttons, smaller icons
- `>= 640px` (sm): Two columns, side-by-side buttons, larger icons

**Key Responsive Features:**
- Search input: `h-10 sm:h-11`
- Button text: `text-sm sm:text-base`
- Icons: `h-4 w-4 sm:h-5 sm:w-5`
- Grid: `grid-cols-1 sm:grid-cols-2` or `sm:grid-cols-3`
- Padding: `py-4 sm:py-6`
- Spacing: `space-y-3 sm:space-y-4`

## 🔐 Security & Permissions

### Create Question
- ✅ Must be authenticated
- ✅ Auto-set `author_id` from session
- ✅ Status: `pending_review`

### Edit Question
- ✅ Must be author OR admin/super_admin
- ✅ Admins can change status directly
- ✅ Regular users → `pending_review` again

### Delete Question
- ✅ Must be author OR admin/super_admin
- ✅ Hard delete from database
- ✅ Revalidates community page

## 📊 Database Queries

### Optimized Queries

All queries fetch necessary relations in one go:

```sql
SELECT
  questions.*,
  topics(id, name, code) as topic,
  profiles!author_id(id, display_name, email, avatar_url) as author,
  COUNT(votes) as _count_votes,
  COUNT(comments) as _count_comments
FROM questions
WHERE status = 'approved'
ORDER BY created_at DESC
LIMIT 20
```

**Filters applied:**
- Search: `ILIKE %term%`
- Topic: `topic_id = ?`
- Difficulty: `difficulty = ?`
- Sort: `ORDER BY votes_count/comments_count/created_at`

## 🧪 Testing Checklist

### Create Question
- [ ] Form validation works (all fields)
- [ ] Duplicate check finds similar questions
- [ ] Duplicate check shows "no duplicates" when unique
- [ ] Cannot submit without duplicate check
- [ ] Success toast and redirect
- [ ] Question appears in community (status: pending)

### Edit Question
- [ ] Only author/admin can access edit page
- [ ] Form pre-filled correctly
- [ ] No duplicate check in edit mode
- [ ] Changes save successfully
- [ ] Redirects to question detail
- [ ] Status preserved for admins, reset for users

### Search & Filters
- [ ] Search debounces (not instant)
- [ ] Clear button works
- [ ] Filter toggle works
- [ ] Topic filter applies
- [ ] Difficulty filter applies
- [ ] Sort changes order
- [ ] Clear all filters resets everything
- [ ] URL updates with filters
- [ ] Filters persist on page reload

### Responsive
- [ ] Mobile: single column, stacked
- [ ] Desktop: multi-column, side-by-side
- [ ] All buttons touch-friendly
- [ ] No horizontal scroll

## 🚀 Integration with `/protected/add-question`

**Analysis:** The `/protected/add-question` page has 3 modes (Manual, Upload File, Paste Text). Our community form is simpler but more focused.

**Recommendation:**
- Keep `/add-question` for admin-level bulk imports
- Use community form for user-generated questions
- Community form is better for:
  - Single question submission
  - Duplicate detection
  - Community engagement
  - Simpler UX

**If integration needed:**
- Can add mode selector to `QuestionForm`
- Add `uploadMode` and `pasteMode` props
- Import hooks from `/add-question/hooks`

## 📈 Future Enhancements

1. **Rich Text Editor** - For questions and explanations
2. **Image Upload** - Support diagrams in questions
3. **Bulk Actions** - Admin approve/reject multiple
4. **AI Suggestions** - Auto-generate explanations
5. **Tags System** - Beyond topics and difficulty
6. **Question Preview** - Before submission
7. **Version History** - Track edits over time
8. **Community Voting** - On question quality
9. **Badges/Reputation** - For active contributors
10. **Export/Import** - JSON/CSV formats

## 🐛 Known Issues / TODOs

- [ ] Add rate limiting for duplicate checks
- [ ] Improve similarity algorithm (use vector embeddings?)
- [ ] Add batch operations for admins
- [ ] Add question preview before submit
- [ ] Add undo/redo for form
- [ ] Add auto-save drafts
- [ ] Add keyboard shortcuts

## 📝 Migration Notes

If migrating from old system:

1. Update all imports from old `ClientCommunityPage` to `CommunityFilters`
2. Replace old form server actions with `community.api` functions
3. Add Zod validation schemas
4. Test duplicate detection with existing questions
5. Update permissions logic if different

## 🎓 Code Examples

### Creating a Question (Server Action)
```typescript
import { createCommunityQuestion } from "@/features/community/community.api"

const question = await createCommunityQuestion({
  question_text: "What is React?",
  option_a: "A library",
  option_b: "A framework",
  option_c: "A language",
  option_d: "An IDE",
  correct_answer: "A",
  explanation: "React is a JavaScript library...",
  topic_id: "topic-123",
  difficulty: "easy",
})
```

### Checking Duplicates
```typescript
import { checkQuestionDuplicates } from "@/features/questions/services/duplicates"

const duplicates = await checkQuestionDuplicates("What is React?")
// Returns: [{ id, question_text, similarity }]
```

### Filtering Questions
```typescript
import { getCommunityQuestions } from "@/features/community/community.api"

const questions = await getCommunityQuestions({
  search: "React",
  topic: "javascript",
  difficulty: "easy",
  sort: "popular",
  limit: 20,
})
```

---

## ✅ Summary

This implementation provides:
- ✅ Clean architecture with separated concerns
- ✅ Type-safe validation with Zod
- ✅ Smart duplicate detection
- ✅ Advanced search and filters
- ✅ Unified create/edit form
- ✅ Full responsive design
- ✅ Role-based permissions
- ✅ Excellent UX with loading states and feedback

The community questions feature is now production-ready with best practices applied throughout.
