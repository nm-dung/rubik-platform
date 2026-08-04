# Database Setup

This folder contains all SQL files for setting up the Rubik's Learning Platform database.

## SQL Files

### Core Setup
- **SUPABASE_SETUP.sql** - Initial Supabase setup and configuration
- **USER_PROFILES_SETUP.sql** - User profiles table and RLS policies
- **DELETE_USER_FUNCTION.sql** - Function to handle user deletion

### Learning System
- **LESSONS_SETUP.sql** - Lessons table and lesson content
- **LESSON_PROGRESS_SETUP.sql** - Track user lesson progress
- **LESSON_REVIEW_HISTORY_SETUP.sql** - Track user review history
- **LEARNING_PATHS_SETUP.sql** - Learning paths for structured learning

### Algorithm System
- **ALGORITHMS_SETUP.sql** - Algorithms table and algorithm data
- **ALGORITHM_TRAINER_SETUP.sql** - Algorithm practice and trainer functionality

### Gamification
- **streaks_achievements.sql** - User streaks, achievements, and gamification features

### Community
- **CONTRIBUTIONS_SETUP.sql** - User contributions and community features

## Setup Instructions

1. Run SQL files in order:
   - SUPABASE_SETUP.sql
   - USER_PROFILES_SETUP.sql
   - DELETE_USER_FUNCTION.sql
   - LESSONS_SETUP.sql
   - LESSON_PROGRESS_SETUP.sql
   - LESSON_REVIEW_HISTORY_SETUP.sql
   - LEARNING_PATHS_SETUP.sql
   - ALGORITHMS_SETUP.sql
   - ALGORITHM_TRAINER_SETUP.sql
   - CONTRIBUTIONS_SETUP.sql
   - streaks_achievements.sql

2. All files include RLS (Row Level Security) policies to ensure users can only access their own data.

3. Functions are created with `CREATE OR REPLACE` to allow for updates without errors.
