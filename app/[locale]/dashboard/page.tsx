"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useLessonProgressStore } from "@/hooks/useLessonProgressStore";
import { useCubeStore } from "@/hooks/useCubeStore";
import { useTimerStore } from "@/hooks/useTimerStore";
import { useStreaks } from "@/hooks/useStreaks";
import { useAchievements } from "@/hooks/useAchievements";
import { BookOpen, Clock, Trophy, Target, TrendingUp, Calendar, Flame, Zap, Award } from "lucide-react";
import { getDictionary, type Dictionary } from "@/lib/dictionary";
import { AchievementModal } from "@/components/dashboard/AchievementModal";

export default function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = use(params);
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const locale = resolvedParams.locale as 'en' | 'vi';
  const [dict, setDict] = useState<Dictionary | null>(null);

  const completedLessonIds = useLessonProgressStore((state) => state.completedLessonIds);
  const lessonProgress = useLessonProgressStore((state) => state.lessonProgress);
  const learnedAlgs = useCubeStore((state) => state.learnedAlgs);
  const allSolves = useTimerStore((state) => state.solves);
  const sessions = useTimerStore((state) => state.sessions);
  const activeSessionId = useTimerStore((state) => state.activeSessionId);

  const { streak, updateStreak } = useStreaks();
  const { achievements, checkAchievements, unlockedCount, totalPoints } = useAchievements();

  const [mounted, setMounted] = useState(false);
  const [newAchievement, setNewAchievement] = useState<any>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [showAchievementsPanel, setShowAchievementsPanel] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function loadDict() {
      const d = await getDictionary(locale);
      setDict(d);
    }
    loadDict();
  }, [locale]);

  // Update streak and check achievements on mount
  useEffect(() => {
    if (mounted && user) {
      updateStreak();
      checkAchievements().then((newlyUnlocked) => {
        if (newlyUnlocked && newlyUnlocked.length > 0) {
          setNewAchievement(newlyUnlocked[0]);
          setTimeout(() => setNewAchievement(null), 5000);
        }
      });
    }
  }, [mounted, user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/auth/login`);
    }
  }, [user, loading, router, locale]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  const totalReviews = Object.values(lessonProgress).reduce((sum, p) => sum + p.reviewCount, 0);
  const displaySolves = mounted ? allSolves.filter(s => s.sessionId === activeSessionId) : [];
  
  // Calculate timer stats
  const calculateStats = () => {
    if (displaySolves.length === 0) {
      return { bestSingle: '--', bestAo5: '--', bestAo12: '--', mean: '--', totalSolves: 0 };
    }

    const getNumericTime = (solve: any) => {
      if (solve.penalty === 'DNF') return Infinity;
      return solve.penalty === '+2' ? solve.time + 2000 : solve.time;
    };

    const validTimes = displaySolves.map(getNumericTime).filter(t => t !== Infinity);
    const formatTime = (ms: number) => (ms / 1000).toFixed(2);

    const bestSingle = Math.min(...validTimes);
    const mean = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;

    // Calculate Ao5
    let bestAo5 = Infinity;
    if (displaySolves.length >= 5) {
      for (let i = 0; i <= displaySolves.length - 5; i++) {
        const window = displaySolves.slice(i, i + 5).map(getNumericTime);
        if (window.filter(t => t === Infinity).length > 1) continue;
        const sorted = [...window].sort((a, b) => a - b);
        const middle = sorted.slice(1, -1);
        const avg = middle.reduce((sum, t) => sum + t, 0) / middle.length;
        if (avg < bestAo5) bestAo5 = avg;
      }
    }

    // Calculate Ao12
    let bestAo12 = Infinity;
    if (displaySolves.length >= 12) {
      for (let i = 0; i <= displaySolves.length - 12; i++) {
        const window = displaySolves.slice(i, i + 12).map(getNumericTime);
        if (window.filter(t => t === Infinity).length > 1) continue;
        const sorted = [...window].sort((a, b) => a - b);
        const middle = sorted.slice(1, -1);
        const avg = middle.reduce((sum, t) => sum + t, 0) / middle.length;
        if (avg < bestAo12) bestAo12 = avg;
      }
    }

    return {
      bestSingle: bestSingle === Infinity ? 'DNF' : formatTime(bestSingle),
      bestAo5: bestAo5 === Infinity ? '--' : formatTime(bestAo5),
      bestAo12: bestAo12 === Infinity ? '--' : formatTime(bestAo12),
      mean: formatTime(mean),
      totalSolves: displaySolves.length
    };
  };

  const timerStats = calculateStats();

  const isVietnamese = locale === 'vi';
  const dashboardDict = dict?.dashboard as Dictionary['dashboard'];

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-48 h-48 sm:w-96 sm:h-96 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
      <div className="absolute top-40 right-10 w-48 h-48 sm:w-96 sm:h-96 bg-yellow-400 dark:bg-yellow-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed" />
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-pink-400 dark:bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />

      {/* Floating Achievement Button */}
      <button
        onClick={() => setShowAchievementsPanel(!showAchievementsPanel)}
        className="fixed top-20 right-4 sm:top-24 sm:right-6 z-40 bg-gradient-to-br from-yellow-400 to-orange-500 p-3 sm:p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group"
        title={dashboardDict?.achievements || "Achievements"}
      >
        <div className="relative">
          <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          {unlockedCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center animate-pulse">
              {unlockedCount}
            </div>
          )}
        </div>
      </button>

      {/* Achievement Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          showAchievementsPanel ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 sm:p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              {dashboardDict?.achievements || "Achievements"}
            </h2>
            <button
              onClick={() => setShowAchievementsPanel(false)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <span className="text-xl sm:text-2xl text-slate-500">×</span>
            </button>
          </div>

          <div className="mb-4 sm:mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs sm:text-sm opacity-90">{dashboardDict?.total_points || "Total Points"}</div>
                <div className="text-2xl sm:text-3xl font-black">{totalPoints}</div>
              </div>
              <Zap className="w-8 h-8 sm:w-12 sm:h-12" />
            </div>
          </div>

          <div className="mb-3 sm:mb-4">
            <div className="flex justify-between text-xs sm:text-sm text-slate-600 mb-2">
              <span>{dashboardDict?.unlocked || "Unlocked"}</span>
              <span>{unlockedCount}/{achievements.length}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500" 
                style={{ width: `${achievements.length ? (unlockedCount / achievements.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {achievements.map((achievement) => (
              <button
                key={achievement.id}
                onClick={() => {
                  setSelectedAchievement(achievement);
                  setShowAchievementsPanel(false);
                }}
                className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 text-left transition-all ${
                  achievement.isUnlocked
                    ? 'border-yellow-400 bg-yellow-50 hover:bg-yellow-100 cursor-pointer'
                    : 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="text-2xl sm:text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-bold text-sm sm:text-base text-slate-900">
                      {isVietnamese ? achievement.name_vi : achievement.name_en}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      {isVietnamese ? achievement.description_vi : achievement.description_en}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-orange-600">{achievement.points} pts</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* New Achievement Toast */}
      {newAchievement && (
        <div className="fixed top-4 right-4 sm:right-20 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-3 sm:p-4 rounded-2xl shadow-2xl animate-bounce max-w-xs sm:max-w-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-3xl sm:text-4xl">{newAchievement.icon}</div>
            <div>
              <div className="font-bold text-xs sm:text-sm">Achievement Unlocked!</div>
              <div className="text-xs sm:text-sm">{isVietnamese ? newAchievement.name_vi : newAchievement.name_en}</div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 sm:mb-12 relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 rounded-3xl blur-3xl animate-float" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-900 dark:text-white mb-2 gradient-text">
              {dashboardDict?.welcome || "Welcome"}, {profile?.username || user.email?.split('@')[0]}!
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300">
              {dashboardDict?.subtitle || "Track your learning progress"}
            </p>
          </div>
          <div className="hidden sm:block">
            <Flame className="w-16 h-16 text-orange-500 dark:text-orange-400 animate-pulse animate-glow" />
          </div>
        </div>
      </div>

      {/* Stats Grid - Modern Floating Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-12 relative z-10">
        {/* Lessons Completed */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-white/50 dark:border-gray-700 touch-manipulation active:scale-95 card-hover">
          <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 sm:px-3 py-1 rounded-full">
              {dashboardDict?.lessons || "Lessons"}
            </div>
          </div>
          <div className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-1">{completedLessonIds.length}</div>
          <div className="text-[10px] sm:text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {dashboardDict?.completed || "Completed"}
          </div>
        </div>

        {/* Total Reviews */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-white/50 dark:border-gray-700 touch-manipulation active:scale-95 card-hover">
          <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 sm:px-3 py-1 rounded-full">
              {dashboardDict?.reviews || "Reviews"}
            </div>
          </div>
          <div className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-1">{totalReviews}</div>
          <div className="text-[10px] sm:text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {dashboardDict?.total || "Total"}
          </div>
        </div>

        {/* Algorithms Learned */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-white/50 dark:border-gray-700 touch-manipulation active:scale-95 card-hover">
          <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 sm:px-3 py-1 rounded-full">
              {dashboardDict?.algorithms || "Algorithms"}
            </div>
          </div>
          <div className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-1">{mounted ? learnedAlgs.length : 0}</div>
          <div className="text-[10px] sm:text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {dashboardDict?.learned || "Learned"}
          </div>
        </div>

        {/* Timer Solves */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-white/50 dark:border-gray-700 touch-manipulation active:scale-95 card-hover">
          <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 sm:px-3 py-1 rounded-full">
              {dashboardDict?.solves || "Solves"}
            </div>
          </div>
          <div className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-1">{timerStats.totalSolves}</div>
          <div className="text-[10px] sm:text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {dashboardDict?.current_session || "Current session"}
          </div>
        </div>
      </div>

      {/* Streak Card - Modern Design */}
      <div className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 dark:from-amber-500 dark:via-orange-600 dark:to-red-600 rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 text-white shadow-2xl mb-4 sm:mb-6 md:mb-12 relative overflow-hidden transform hover:scale-[1.02] transition-all duration-300 touch-manipulation active:scale-95">
        <div className="absolute -right-4 -top-4 sm:-right-8 sm:-top-8 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-white/10 dark:bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -left-4 -bottom-4 sm:-left-8 sm:-bottom-8 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-white/10 dark:bg-white/5 rounded-full blur-2xl" />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="relative">
              <Flame className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 animate-pulse" />
              {streak?.current_streak && streak.current_streak >= 7 && (
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-yellow-300 text-yellow-900 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full animate-bounce">
                  🔥
                </div>
              )}
            </div>
            <div>
              <div className="text-xs sm:text-sm lg:text-base font-medium opacity-90 mb-1">
                {dashboardDict?.current_streak || "Current Streak"}
              </div>
              <div className="text-3xl sm:text-4xl lg:text-6xl font-black">
                {streak?.current_streak || 0}
              </div>
              <div className="text-xs sm:text-sm opacity-75 mt-1">
                {dashboardDict?.days || "days"}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs sm:text-sm lg:text-base font-medium opacity-90 mb-1">
              {dashboardDict?.longest_streak || "Longest Streak"}
            </div>
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              {streak?.longest_streak || 0}
            </div>
            <div className="text-xs sm:text-sm opacity-75 mt-1">
              {dashboardDict?.days || "days"}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Stats - Modern Glass Cards */}
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-12 relative z-10">
        {/* Timer Stats */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-white/50 dark:border-gray-700 card-hover">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg sm:rounded-xl flex items-center justify-center">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            {dashboardDict?.timer_stats || "Timer Stats"}
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl sm:rounded-2xl">
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                {dashboardDict?.best_single || "Best Single"}
              </span>
              <span className="text-lg sm:text-2xl font-mono font-black text-indigo-600 dark:text-indigo-400">{timerStats.bestSingle}s</span>
            </div>
            <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl sm:rounded-2xl">
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                {dashboardDict?.ao5 || "Ao5"}
              </span>
              <span className="text-lg sm:text-2xl font-mono font-black text-purple-600 dark:text-purple-400">{timerStats.bestAo5}s</span>
            </div>
            <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-900/30 dark:to-orange-900/30 rounded-xl sm:rounded-2xl">
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                {dashboardDict?.ao12 || "Ao12"}
              </span>
              <span className="text-lg sm:text-2xl font-mono font-black text-pink-600 dark:text-pink-400">{timerStats.bestAo12}s</span>
            </div>
            <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/30 dark:to-yellow-900/30 rounded-xl sm:rounded-2xl">
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                {dashboardDict?.mean || "Mean"}
              </span>
              <span className="text-lg sm:text-2xl font-mono font-black text-orange-600 dark:text-orange-400">{timerStats.mean}s</span>
            </div>
          </div>
        </div>

        {/* Learning Progress */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-white/50 dark:border-gray-700 card-hover">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg sm:rounded-xl flex items-center justify-center">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
            </div>
            {dashboardDict?.learning_progress || "Learning Progress"}
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 rounded-xl sm:rounded-2xl">
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                {dashboardDict?.lessons_completed || "Lessons Completed"}
              </span>
              <span className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedLessonIds.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30 rounded-xl sm:rounded-2xl">
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                {dashboardDict?.total_reviews || "Total Reviews"}
              </span>
              <span className="text-lg sm:text-2xl font-black text-green-600 dark:text-green-400">{totalReviews}</span>
            </div>
            <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-xl sm:rounded-2xl">
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                {dashboardDict?.algorithms_learned || "Algorithms Learned"}
              </span>
              <span className="text-lg sm:text-2xl font-black text-teal-600 dark:text-teal-400">{mounted ? learnedAlgs.length : 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 sm:p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-xl sm:rounded-2xl">
              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                {dashboardDict?.timer_sessions || "Timer Sessions"}
              </span>
              <span className="text-lg sm:text-2xl font-black text-cyan-600 dark:text-cyan-400">{sessions.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Modern Floating Cards */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl border border-white/50 dark:border-gray-700 relative z-10 card-hover">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          {dashboardDict?.quick_actions || "Quick Actions"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <a
            href={`/${locale}/learn`}
            className="group flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl sm:rounded-2xl hover:from-indigo-100 dark:hover:from-indigo-900/50 hover:to-indigo-200 dark:hover:to-indigo-800/50 transition-all duration-300 hover:scale-105 text-center border-2 border-transparent hover:border-indigo-300 dark:hover:border-indigo-600"
          >
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {dashboardDict?.learn || "Learn"}
            </span>
          </a>
          <a
            href={`/${locale}/algorithms`}
            className="group flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl sm:rounded-2xl hover:from-emerald-100 dark:hover:from-emerald-900/50 hover:to-emerald-200 dark:hover:to-emerald-800/50 transition-all duration-300 hover:scale-105 text-center border-2 border-transparent hover:border-emerald-300 dark:hover:border-emerald-600"
          >
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {dashboardDict?.algorithms || "Algorithms"}
            </span>
          </a>
          <a
            href={`/${locale}/trainer`}
            className="group flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl sm:rounded-2xl hover:from-purple-100 dark:hover:from-purple-900/50 hover:to-purple-200 dark:hover:to-purple-800/50 transition-all duration-300 hover:scale-105 text-center border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-600"
          >
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {dashboardDict?.trainer || "Trainer"}
            </span>
          </a>
          <a
            href={`/${locale}/timer`}
            className="group flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl sm:rounded-2xl hover:from-orange-100 dark:hover:from-orange-900/50 hover:to-orange-200 dark:hover:to-orange-800/50 transition-all duration-300 hover:scale-105 text-center border-2 border-transparent hover:border-orange-300 dark:hover:border-orange-600"
          >
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {dashboardDict?.timer || "Timer"}
            </span>
          </a>
        </div>
      </div>

      {/* Achievement Modal */}
      {selectedAchievement && (
        <AchievementModal
          achievement={selectedAchievement}
          locale={locale}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </main>
  );
}
