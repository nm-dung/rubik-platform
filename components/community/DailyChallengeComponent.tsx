"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Trophy, Calendar, Video, Flame, ChevronRight, RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { DailyChallenge, ChallengeSubmission, ChallengeStreak } from "@/lib/types";
import { supabase } from "@/lib/supabase";

type ArchivedChallenge = DailyChallenge & {
  challenge_submissions?: { count: number }[];
};

interface DailyChallengeComponentProps {
  locale: 'en' | 'vi';
  dict: any;
}

export default function DailyChallengeComponent({ locale, dict }: DailyChallengeComponentProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>([]);
  const [userStreak, setUserStreak] = useState<ChallengeStreak | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitTime, setSubmitTime] = useState('');
  const [solution, setSolution] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPlatform, setVideoPlatform] = useState('youtube');
  const [submitting, setSubmitting] = useState(false);
  const [userSubmission, setUserSubmission] = useState<ChallengeSubmission | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [submissionError, setSubmissionError] = useState(false);
  const [archive, setArchive] = useState<ArchivedChallenge[]>([]);
  const [archiveLoaded, setArchiveLoaded] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [expandedArchiveId, setExpandedArchiveId] = useState<string | null>(null);
  const [archiveSubmissions, setArchiveSubmissions] = useState<ChallengeSubmission[]>([]);

  const isVietnamese = locale === 'vi';

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && startTime !== null) {
      interval = setInterval(() => {
        setCurrentTime(Date.now() - startTime);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const loadDailyChallenge = useCallback(async () => {
    try {
      const response = await fetch('/api/daily-challenge');
      if (!response.ok) throw new Error('Challenge request failed');
      const data = await response.json();
      setChallenge(data.challenge);

      if (data.challenge) {
        const challengeId = encodeURIComponent(data.challenge.id);
        const requests = [
          fetch(`/api/daily-challenge/submissions?challengeId=${challengeId}&limit=100`),
          user?.id
            ? fetch(`/api/daily-challenge/submissions?challengeId=${challengeId}&userId=${encodeURIComponent(user.id)}&limit=1`)
            : Promise.resolve(null),
        ] as const;
        const [submissionsResponse, userSubmissionResponse] = await Promise.all(requests);
        if (!submissionsResponse.ok || (userSubmissionResponse && !userSubmissionResponse.ok)) {
          throw new Error('Submission request failed');
        }
        const submissionsData = await submissionsResponse.json();
        const userSubmissionData = userSubmissionResponse ? await userSubmissionResponse.json() : null;
        setSubmissions(submissionsData.submissions || []);
        setUserSubmission(userSubmissionData?.submissions?.[0] || null);
      } else {
        setSubmissions([]);
        setUserSubmission(null);
      }
      setLoadError(false);
    } catch (error) {
      console.error('Error loading daily challenge:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const loadUserStreak = useCallback(async () => {
    if (!user || !supabase) {
      setUserStreak(null);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const response = await fetch('/api/daily-challenge/streaks', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) throw new Error('Streak request failed');
      const data = await response.json();
      setUserStreak(data.streak);
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadDailyChallenge();
    void loadUserStreak();
  }, [loadDailyChallenge, loadUserStreak]);

  const startTimer = () => {
    setIsRunning(true);
    setStartTime(Date.now());
    setCurrentTime(0);
  };

  const stopTimer = () => {
    setIsRunning(false);
    const finalTime = startTime !== null ? Date.now() - startTime : currentTime;
    setSubmitTime((finalTime / 1000).toFixed(2));
    setShowSubmitForm(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setStartTime(null);
    setCurrentTime(0);
    setShowSubmitForm(false);
    setSubmitTime('');
    setSubmissionError(false);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!user || !challenge || !supabase) return;

    const seconds = Number(submitTime);
    const timeMs = Math.round(seconds * 1000);
    if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 3600) {
      setSubmissionError(true);
      return;
    }

    setSubmitting(true);
    setSubmissionError(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Authentication required');

      const response = await fetch('/api/daily-challenge/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          challengeId: challenge.id,
          timeMs,
          solution: solution || null,
          videoUrl: videoUrl || null,
          videoPlatform: videoPlatform || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        setUserSubmission(data.submission);
        setShowSubmitForm(false);
        setSubmitTime('');
        setSolution('');
        setVideoUrl('');
        await Promise.all([loadDailyChallenge(), loadUserStreak()]);
      } else {
        setSubmissionError(true);
      }
    } catch (error) {
      console.error('Error submitting time:', error);
      setSubmissionError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleArchive = async () => {
    if (showArchive) {
      setShowArchive(false);
      return;
    }

    setShowArchive(true);
    if (archiveLoaded || !challenge) return;
    setArchiveLoading(true);
    try {
      const response = await fetch(`/api/daily-challenge/archive?before=${encodeURIComponent(challenge.date)}&limit=14`);
      if (!response.ok) throw new Error('Archive request failed');
      const data = await response.json();
      setArchive(data.challenges || []);
      setArchiveLoaded(true);
    } catch (error) {
      console.error('Error loading challenge archive:', error);
    } finally {
      setArchiveLoading(false);
    }
  };

  const toggleArchivedResults = async (archivedChallenge: ArchivedChallenge) => {
    if (expandedArchiveId === archivedChallenge.id) {
      setExpandedArchiveId(null);
      return;
    }

    setExpandedArchiveId(archivedChallenge.id);
    setArchiveSubmissions([]);
    try {
      const response = await fetch(`/api/daily-challenge/submissions?challengeId=${encodeURIComponent(archivedChallenge.id)}&limit=100`);
      if (!response.ok) throw new Error('Archived results request failed');
      const data = await response.json();
      setArchiveSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Error loading archived results:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 border-4 border-emerald-200 dark:border-emerald-800 rounded-full"></div>
          <div className="absolute w-20 h-20 border-4 border-emerald-500 dark:border-emerald-400 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <div className="relative mt-16">
          <p className="text-slate-600 dark:text-slate-400 animate-pulse">
            {isVietnamese ? "Đang tải..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="text-center py-12 relative">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
          <Calendar className="w-20 h-20 mx-auto mb-4 text-emerald-600 dark:text-emerald-400 relative" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {isVietnamese ? "Thử thách hàng ngày" : "Daily Challenge"}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          {loadError
            ? dict?.community?.challenge_load_error || (isVietnamese ? "Không thể tải thử thách hôm nay." : "The daily challenge could not be loaded.")
            : dict?.community?.loading_challenge || (isVietnamese ? "Đang tải thử thách..." : "Loading challenge...")}
        </p>
        {loadError && (
          <button onClick={() => { setLoading(true); void loadDailyChallenge(); }} className="mt-6 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg">
            {isVietnamese ? "Thử lại" : "Retry"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Challenge Header with Enhanced Design */}
      <div className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-600 dark:via-teal-600 dark:to-cyan-700 rounded-3xl p-6 sm:p-8 text-white overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-blob" style={{ animationDelay: '0s' }}></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100 dark:text-emerald-200">
                {dict?.community?.daily_challenge || (isVietnamese ? "Thử thách hàng ngày" : "Daily Challenge")}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-2">
              {dict?.community?.daily_challenge || (isVietnamese ? "Thử thách hàng ngày" : "Daily Challenge")}
            </h2>
            <p className="text-emerald-100 dark:text-emerald-200 text-sm sm:text-base">
              {new Date(`${challenge.date}T12:00:00`).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          {userStreak && (
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 shadow-lg border border-white/30 hover:bg-white/30 transition-all transform hover:scale-105">
              <div className="relative">
                <Flame className="w-6 h-6 text-orange-300 animate-pulse" />
                <div className="absolute inset-0 bg-orange-500 rounded-full blur-md opacity-50"></div>
              </div>
              <div>
                <div className="text-xs text-emerald-100 dark:text-emerald-200 font-medium">
                  {isVietnamese ? "Chuỗi hiện tại" : "Current Streak"}
                </div>
                <div className="text-xl font-black">{userStreak.current_streak} {dict?.community?.days || (isVietnamese ? "ngày" : "days")}</div>
              </div>
            </div>
          )}
        </div>

        {/* Scramble Display with Enhanced Design */}
        <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-5 sm:p-6 mb-6 border border-white/20 hover:bg-white/15 transition-all group">
          <div className="flex items-center gap-2 text-sm text-emerald-100 dark:text-emerald-200 mb-3 font-medium">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            {dict?.community?.scramble || (isVietnamese ? "Xáo trộn:" : "Scramble:")}
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-black tracking-wider group-hover:scale-105 transition-transform duration-300">
            {challenge.scramble}
          </div>
        </div>

        {/* Timer with Enhanced Design */}
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative">
            <div className="text-5xl sm:text-6xl font-mono font-black tracking-tight drop-shadow-lg">
              {formatTime(currentTime)}
            </div>
            {isRunning && (
              <div className="absolute -inset-2 bg-white/20 rounded-lg blur-xl animate-pulse"></div>
            )}
          </div>
          <div className="flex gap-3">
            {!isRunning ? (
              <button
                onClick={startTimer}
                disabled={!!userSubmission}
                className="px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold hover:bg-emerald-50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl"
              >
                {dict?.community?.start || (isVietnamese ? "Bắt đầu" : "Start")}
              </button>
            ) : (
              <button
                onClick={stopTimer}
                className="px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold hover:bg-emerald-50 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl animate-pulse"
              >
                {dict?.community?.stop || (isVietnamese ? "Dừng" : "Stop")}
              </button>
            )}
            <button
              onClick={resetTimer}
              className="px-5 py-4 bg-white/20 text-white rounded-2xl hover:bg-white/30 transition-all transform hover:scale-105 border border-white/30 backdrop-blur-sm"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {!user && (
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 text-sm text-emerald-900 dark:border-emerald-800 dark:from-emerald-950/30 dark:to-teal-950/30 dark:text-emerald-200 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 dark:bg-emerald-600 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium">{dict?.community?.sign_in_to_submit || (isVietnamese ? "Đăng nhập để gửi kết quả và tham gia bảng xếp hạng." : "Sign in to submit a result and join the leaderboard.")}</span>
          </div>
          <Link href={`/${locale}/auth/login`} className="inline-flex items-center gap-2 font-bold bg-emerald-600 dark:bg-emerald-500 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all transform hover:scale-105 shadow-lg">
            {dict?.auth?.sign_in || (isVietnamese ? "Đăng nhập" : "Sign in")}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Submit Form with Enhanced Design */}
      {showSubmitForm && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border-2 border-gray-200 dark:border-gray-700 shadow-xl animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {dict?.community?.submit_time || (isVietnamese ? "Gửi thời gian" : "Submit Time")}
            </h3>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                {dict?.community?.time_seconds || (isVietnamese ? "Thời gian (giây)" : "Time (seconds)")}
              </label>
              <input
                type="number"
                min="0.01"
                max="3600"
                step="0.01"
                value={submitTime}
                onChange={(e) => { setSubmitTime(e.target.value); setSubmissionError(false); }}
                className="w-full px-5 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg font-mono transition-all"
                placeholder="12.34"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                {dict?.community?.solution_optional || (isVietnamese ? "Giải pháp (tùy chọn)" : "Solution (optional)")}
              </label>
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                className="w-full px-5 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono transition-all resize-none"
                rows={3}
                placeholder={isVietnamese ? "R U R' U'..." : "R U R' U'..."}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                {dict?.community?.video_url || (isVietnamese ? "URL video (tùy chọn)" : "Video URL (optional)")}
              </label>
              <div className="flex gap-3">
                <select
                  value={videoPlatform}
                  onChange={(e) => setVideoPlatform(e.target.value)}
                  className="px-5 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium transition-all"
                >
                  <option value="youtube">{dict?.community?.youtube || "YouTube"}</option>
                  <option value="tiktok">{dict?.community?.tiktok || "TikTok"}</option>
                  <option value="instagram">{dict?.community?.instagram || "Instagram"}</option>
                  <option value="other">{dict?.community?.other || "Other"}</option>
                </select>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="flex-1 px-5 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                  placeholder="https://..."
                />
              </div>
            </div>

            {submissionError && (
              <div role="alert" className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-600 dark:text-red-400">
                {submitTime && (!Number.isFinite(Number(submitTime)) || Number(submitTime) <= 0 || Number(submitTime) > 3600)
                  ? dict?.community?.invalid_time || (isVietnamese ? "Nhập thời gian giải hợp lệ, tối đa 3600 giây." : "Enter a valid solve time up to 3600 seconds.")
                  : dict?.community?.submission_failed || (isVietnamese ? "Không thể gửi kết quả. Vui lòng thử lại." : "Your result could not be submitted. Please try again.")}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmit}
                disabled={submitting || !submitTime || !user}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {submitting ? (isVietnamese ? "Đang gửi..." : "Submitting...") : (isVietnamese ? "Gửi" : "Submit")}
              </button>
              <button
                onClick={() => setShowSubmitForm(false)}
                className="px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all transform hover:scale-105"
              >
                {isVietnamese ? "Hủy" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User's Submission with Enhanced Design */}
      {userSubmission && (
        <div className="relative bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-3xl p-6 sm:p-8 border-2 border-indigo-200 dark:border-indigo-800 shadow-xl animate-fade-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 dark:bg-indigo-600 rounded-full blur-3xl opacity-10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-400">
                  {isVietnamese ? "Thời gian của bạn" : "Your Time"}
                </h3>
              </div>
              <div className="text-4xl sm:text-5xl font-mono font-black text-indigo-600 dark:text-indigo-400">
                {formatTime(userSubmission.time_ms)}
              </div>
            </div>
            <div className="relative">
              <Trophy className="w-16 h-16 text-indigo-500 animate-bounce" />
              <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-30"></div>
            </div>
          </div>
          {userSubmission.solution && (
            <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-indigo-100 dark:border-indigo-700">
              <span className="font-bold text-gray-900 dark:text-white">{isVietnamese ? "Giải pháp:" : "Solution:"} </span>
              <span className="font-mono text-gray-700 dark:text-gray-300">{userSubmission.solution}</span>
            </div>
          )}
          {userSubmission.video_url && (
            <div className="mt-4">
              <a
                href={userSubmission.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all transform hover:scale-105 shadow-lg"
              >
                <Video className="w-5 h-5" />
                {isVietnamese ? "Xem video" : "Watch Video"}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard with Enhanced Design */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 border-2 border-gray-200 dark:border-gray-700 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Trophy className="w-7 h-7 text-yellow-500" />
              <div className="absolute inset-0 bg-yellow-500 rounded-full blur-md opacity-30"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {isVietnamese ? "Bảng xếp hạng hôm nay" : "Today's Leaderboard"}
            </h3>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl px-4 py-2 border border-yellow-200 dark:border-yellow-800">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">
              {submissions.length} {isVietnamese ? "người tham gia" : "participants"}
            </span>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="relative inline-block mb-4">
              <Trophy className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-lg">{isVietnamese ? "Chưa có ai tham gia hôm nay" : "No participants yet today"}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.slice(0, 10).map((submission, index) => (
              <div
                key={submission.id}
                className={`flex items-center justify-between p-4 rounded-xl transition-all transform hover:scale-102 hover:shadow-lg ${
                  index === 0 
                    ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-300 dark:border-yellow-700' 
                    : index === 1 
                    ? 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 border-2 border-gray-300 dark:border-gray-600'
                    : index === 2
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-700'
                    : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center">
                    {index === 0 && (
                      <div className="relative">
                        <Trophy className="w-8 h-8 text-yellow-500 animate-bounce" />
                        <div className="absolute inset-0 bg-yellow-500 rounded-full blur-md opacity-30"></div>
                      </div>
                    )}
                    {index === 1 && (
                      <div className="relative">
                        <Trophy className="w-8 h-8 text-gray-400" />
                        <div className="absolute inset-0 bg-gray-400 rounded-full blur-md opacity-20"></div>
                      </div>
                    )}
                    {index === 2 && (
                      <div className="relative">
                        <Trophy className="w-8 h-8 text-amber-600" />
                        <div className="absolute inset-0 bg-amber-600 rounded-full blur-md opacity-20"></div>
                      </div>
                    )}
                    {index > 2 && <span className="text-sm font-black text-gray-500">#{index + 1}</span>}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white text-base">
                      {submission.user_profiles?.username || 'Anonymous'}
                    </div>
                    {submission.solution && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                        {submission.solution.substring(0, 20)}...
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400">
                    {formatTime(submission.time_ms)}
                  </div>
                  {submission.video_url && (
                    <div className="relative">
                      <Video className="w-5 h-5 text-gray-400" />
                      <div className="absolute inset-0 bg-gray-400 rounded-full blur-md opacity-20"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Archive Link with Enhanced Design */}
      <button
        onClick={() => void toggleArchive()}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all transform hover:scale-105 shadow-lg border border-gray-300 dark:border-gray-600"
      >
        <Calendar className="w-6 h-6" />
        <span className="font-bold">{isVietnamese ? "Xem thử thách trước" : "View Previous Challenges"}</span>
        <ChevronRight className={`w-6 h-6 transition-transform ${showArchive ? 'rotate-90' : ''}`} />
      </button>

      {/* Archive (when expanded) */}
      {showArchive && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {dict?.community?.archive || (isVietnamese ? "Kho lưu trữ" : "Archive")}
          </h3>
          {archiveLoading ? (
            <div className="py-6 text-center text-gray-500 dark:text-gray-400">
              {dict?.community?.archive_loading || (isVietnamese ? "Đang tải thử thách trước đây..." : "Loading previous challenges...")}
            </div>
          ) : archive.length === 0 ? (
            <div className="py-6 text-center text-gray-500 dark:text-gray-400">
              {dict?.community?.archive_empty || (isVietnamese ? "Chưa có thử thách trước đây." : "No previous challenges yet.")}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {archive.map((archivedChallenge) => {
                const resultCount = archivedChallenge.challenge_submissions?.[0]?.count ?? 0;
                const isExpanded = expandedArchiveId === archivedChallenge.id;
                return (
                  <div key={archivedChallenge.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {new Date(`${archivedChallenge.date}T12:00:00`).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'medium' })}
                        </div>
                        <div className="mt-1 font-mono text-sm leading-relaxed text-gray-600 dark:text-gray-300 break-words">
                          {archivedChallenge.scramble}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{resultCount} {dict?.community?.participants || (isVietnamese ? "người tham gia" : "participants")}</div>
                      </div>
                      <button
                        onClick={() => void toggleArchivedResults(archivedChallenge)}
                        className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 sm:self-center"
                      >
                        {isExpanded
                          ? dict?.community?.hide_results || (isVietnamese ? "Ẩn kết quả" : "Hide results")
                          : dict?.community?.view_results || (isVietnamese ? "Xem kết quả" : "View results")}
                        <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="mt-3 space-y-2">
                        {archiveSubmissions.length === 0 ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {dict?.community?.no_results || (isVietnamese ? "Chưa có kết quả nào cho thử thách này." : "No results were submitted for this challenge.")}
                          </p>
                        ) : archiveSubmissions.map((submission, index) => (
                          <div key={submission.id} className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="w-8 shrink-0 text-xs font-bold text-gray-500">#{index + 1}</span>
                              <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                {submission.user_profiles?.username || 'Anonymous'}
                              </span>
                              {user?.id === submission.user_id && <span className="text-xs text-emerald-700 dark:text-emerald-300">({dict?.community?.you || (isVietnamese ? "Bạn" : "You")})</span>}
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{formatTime(submission.time_ms)}</span>
                              {submission.video_url && <a href={submission.video_url} target="_blank" rel="noopener noreferrer" aria-label={dict?.community?.watch_video || (isVietnamese ? "Xem video" : "Watch video")}><Video className="h-4 w-4 text-gray-500" /></a>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

DailyChallengeComponent.displayName = 'DailyChallengeComponent';