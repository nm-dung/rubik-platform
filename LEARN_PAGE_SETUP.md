# Learn Page Implementation - Setup Guide

## What We Built

A complete **Learn page system** with:
- ✅ Three learning paths: Beginner → Intermediate → Advanced
- ✅ Organized lesson structure with difficulty levels
- ✅ Database schema for lessons
- ✅ API endpoint to fetch lessons
- ✅ Beautiful lesson cards with icons and metadata
- ✅ Multi-language support (English & Vietnamese)
- ✅ Foundation for lesson progress tracking

---

## 📋 Quick Start

### Step 1: Set Up the Lessons Table in Supabase

1. Go to your **Supabase Dashboard** → SQL Editor
2. Copy the entire content from `LESSONS_SETUP.sql` file
3. Paste it into the SQL Editor
4. Click **Run**

This creates:
- `lessons` table
- Indexes for performance
- 15 sample lessons across all difficulty levels

### Step 2: Verify the Setup

1. Go to **Supabase Dashboard** → Table Editor
2. Click on `lessons` table
3. You should see 15 lessons listed

### Step 3: Test Locally

Run your dev server:
```bash
npm run dev
```

Visit: `http://localhost:3000/en/learn`

You should see lessons organized by difficulty!

---

## 🏗️ Architecture

### Files Created

```
rubik-platform/
├── lib/
│   └── types.ts (UPDATED - added Lesson types)
├── hooks/
│   └── useLessons.ts (NEW - fetch hook)
├── app/
│   ├── api/lessons/
│   │   └── route.ts (NEW - API endpoint)
│   └── [locale]/learn/
│       └── page.tsx (REBUILT - lesson display)
├── components/lessons/
│   └── LessonCard.tsx (NEW - card component)
├── content/dictionaries/
│   ├── en.json (UPDATED)
│   └── vi.json (UPDATED)
└── LESSONS_SETUP.sql (NEW - database setup)
```

### Data Flow

```
Supabase (lessons table)
    ↓
/api/lessons (backend endpoint)
    ↓
useLessons hook (client-side fetching)
    ↓
Learn Page Component
    ↓
LessonCard Components (displayed in 3x3 grid)
```

---

## 🔧 How It Works

### 1. **Lesson Data Structure**

Each lesson in Supabase has:
- `id` - Unique identifier
- `title_en` / `title_vi` - Multilingual titles
- `description_en` / `description_vi` - Multilingual descriptions
- `content_en` / `content_vi` - Full lesson content (future)
- `difficulty` - 'beginner' | 'intermediate' | 'advanced'
- `order` - Sort order within difficulty
- `duration_minutes` - Estimated lesson time
- `related_algorithm_ids` - Links to algorithms (array)

### 2. **Fetching Lessons**

The `/api/lessons` endpoint:
- Supports filtering by difficulty: `/api/lessons?difficulty=beginner`
- Returns sorted lessons
- Has error handling

### 3. **Frontend Display**

The Learn page:
- Fetches all lessons on load
- Groups them by difficulty
- Displays 3 columns of cards per difficulty level
- Shows loading/error states
- Supports both English and Vietnamese

---

## 🎨 Lesson Card Features

Each card displays:
- Icon (based on difficulty level)
- Title & description
- Difficulty badge (color-coded)
- Estimated duration
- Related algorithms count
- Hover animation

---

## ➕ Adding New Lessons

### Option 1: Direct SQL (Recommended for bulk)

```sql
INSERT INTO lessons (id, title_en, title_vi, description_en, description_vi, difficulty, "order", duration_minutes)
VALUES (
  'lesson-b-007',
  'My New Lesson',
  'Bài học mới của tôi',
  'Description in English',
  'Mô tả bằng tiếng Việt',
  'beginner',
  7,
  25
);
```

### Option 2: Through Supabase Dashboard

1. Go to Table Editor → Lessons
2. Click "Insert row"
3. Fill in the fields
4. Save

### Option 3: Future Admin Interface (coming later)

We'll eventually build a coach/admin UI for this.

---

## 🔗 Connecting Lessons to Algorithms

To link lessons to algorithms:

```sql
UPDATE lessons
SET related_algorithm_ids = ARRAY['sune', 't-perm', 'jb-perm']
WHERE id = 'lesson-i-004';  -- OLL lesson
```

---

## 📊 Future Enhancements

### Planned (not yet built):
1. **Lesson Detail Page** - Click on lesson to see full content
2. **Lesson Progress Tracking** - Track which lessons user completed
3. **Lesson Completion** - Mark lessons as complete
4. **Lesson Streaks** - Gamification (e.g., "7-day learning streak")
5. **Quiz/Assessment** - Test understanding after lesson
6. **Video Integration** - Embed YouTube videos in lessons
7. **Interactive Animations** - Show cube states within lesson
8. **Discussion Forum** - Q&A per lesson

---

## 🚀 Performance Notes

- ✅ Lessons are fetched server-side API (scalable)
- ✅ Indexed by difficulty for fast queries
- ✅ Sorted by order for consistent display
- ✅ Related algorithms stored as array (easy to expand)
- ✅ Multi-language support built-in

---

## 🐛 Troubleshooting

### "Lessons not showing?"

1. Did you run the SQL setup? → Check Supabase table
2. Does your `.env.local` have Supabase keys? → Check config
3. Check browser console for errors

### "Getting 500 error from /api/lessons?"

1. Check Supabase credentials
2. Check if `lessons` table exists
3. Check API route syntax

---

## 📝 Notes for Future Implementation

When you're ready to add more features:

1. **Lesson Pages**: Create `/[locale]/learn/[lesson-id]` page
2. **Progress Tracking**: Create `lesson_progress` table
3. **Quizzes**: Create `lesson_quizzes` table
4. **Content Editor**: Build admin dashboard to edit lessons
5. **Analytics**: Track lesson completion rates

---

## ✅ Checklist

- [x] Lesson types defined in `lib/types.ts`
- [x] Supabase schema created (LESSONS_SETUP.sql)
- [x] API endpoint `/api/lessons` working
- [x] useLessons hook created
- [x] LessonCard component built
- [x] Learn page rebuilt with lessons
- [x] Multi-language support added
- [x] 15 sample lessons ready to seed

**You're ready to populate lessons and start the learning journey!**
