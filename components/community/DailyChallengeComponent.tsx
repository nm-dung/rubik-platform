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
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          {isVietnamese ? "Đang tải..." : "Loading..."}
        </p>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-emerald-600 dark:text-emerald-400" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {isVietnamese ? "Thử thách hàng ngày" : "Daily Challenge"}
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          {loadError
            ? dict?.community?.challenge_load_error || (isVietnamese ? "Không thể tải thử thách hôm nay." : "The daily challenge could not be loaded.")
            : dict?.community?.loading_challenge || (isVietnamese ? "Đang tải thử thách..." : "Loading challenge...")}
        </p>
        {loadError && (
          <button onClick={() => { setLoading(true); void loadDailyChallenge(); }} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            {isVietnamese ? "Thử lại" : "Retry"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Challenge Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              {dict?.community?.daily_challenge || (isVietnamese ? "Thử thách hàng ngày" : "Daily Challenge")}
            </h2>
            <p className="text-emerald-100 dark:text-emerald-200">
              {new Date(`${challenge.date}T12:00:00`).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          {userStreak && (
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2">
              <Flame className="w-5 h-5 text-orange-300" />
              <div>
                <div className="text-xs text-emerald-100">
                  {isVietnamese ? "Chuỗi hiện tại" : "Current Streak"}
                </div>
                <div className="text-lg font-bold">{userStreak.current_streak} {dict?.community?.days || (isVietnamese ? "ngày" : "days")}</div>
              </div>
            </div>
          )}
        </div>

        {/* Scramble Display */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
          <div className="text-sm text-emerald-100 mb-2">
            {dict?.community?.scramble || (isVietnamese ? "Xáo trộn:" : "Scramble:")}
          </div>
          <div className="text-2xl font-mono font-bold tracking-wider">
            {challenge.scramble}
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-between">
          <div className="text-4xl font-mono font-bold">
            {formatTime(currentTime)}
          </div>
          <div className="flex gap-2">
            {!isRunning ? (
              <button
                onClick={startTimer}
                disabled={!!userSubmission}
                className="px-6 py-3 bg-white text-emerald-600 rounded-lg font-bold hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {dict?.community?.start || (isVietnamese ? "Bắt đầu" : "Start")}
              </button>
            ) : (
              <button
                onClick={stopTimer}
                className="px-6 py-3 bg-white text-emerald-600 rounded-lg font-bold hover:bg-emerald-50 transition-colors"
              >
                {dict?.community?.stop || (isVietnamese ? "Dừng" : "Stop")}
              </button>
            )}
            <button
              onClick={resetTimer}
              className="px-4 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {!user && (
        <div className="flex flex-col gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200 sm:flex-row sm:items-center sm:justify-between">
          <span>{dict?.community?.sign_in_to_submit || (isVietnamese ? "Đăng nhập để gửi kết quả và tham gia bảng xếp hạng." : "Sign in to submit a result and join the leaderboard.")}</span>
          <Link href={`/${locale}/auth/login`} className="font-semibold underline underline-offset-2">
            {dict?.auth?.sign_in || (isVietnamese ? "Đăng nhập" : "Sign in")}
          </Link>
        </div>
      )}

      {/* Submit Form */}
      {showSubmitForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {dict?.community?.submit_time || (isVietnamese ? "Gửi thời gian" : "Submit Time")}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {dict?.community?.time_seconds || (isVietnamese ? "Thời gian (giây)" : "Time (seconds)")}
              </label>
              <input
                type="number"
                min="0.01"
                max="3600"
                step="0.01"
                value={submitTime}
                onChange={(e) => { setSubmitTime(e.target.value); setSubmissionError(false); }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="12.34"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {dict?.community?.solution_optional || (isVietnamese ? "Giải pháp (tùy chọn)" : "Solution (optional)")}
              </label>
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={2}
                placeholder={isVietnamese ? "R U R' U'..." : "R U R' U'..."}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {dict?.community?.video_url || (isVietnamese ? "URL video (tùy chọn)" : "Video URL (optional)")}
              </label>
              <div className="flex gap-2">
                <select
                  value={videoPlatform}
                  onChange={(e) => setVideoPlatform(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://..."
                />
              </div>
            </div>

            {submissionError && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                {submitTime && (!Number.isFinite(Number(submitTime)) || Number(submitTime) <= 0 || Number(submitTime) > 3600)
                  ? dict?.community?.invalid_time || (isVietnamese ? "Nhập thời gian giải hợp lệ, tối đa 3600 giây." : "Enter a valid solve time up to 3600 seconds.")
                  : dict?.community?.submission_failed || (isVietnamese ? "Không thể gửi kết quả. Vui lòng thử lại." : "Your result could not be submitted. Please try again.")}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={submitting || !submitTime || !user}
                className="flex-1 px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (isVietnamese ? "Đang gửi..." : "Submitting...") : (isVietnamese ? "Gửi" : "Submit")}
              </button>
              <button
                onClick={() => setShowSubmitForm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {isVietnamese ? "Hủy" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User's Submission */}
      {userSubmission && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-400 mb-1">
                {isVietnamese ? "Thời gian của bạn" : "Your Time"}
              </h3>
              <div className="text-3xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {formatTime(userSubmission.time_ms)}
              </div>
            </div>
            <Trophy className="w-12 h-12 text-indigo-500" />
          </div>
          {userSubmission.solution && (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{isVietnamese ? "Giải pháp:" : "Solution:"} </span>
              {userSubmission.solution}
            </div>
          )}
          {userSubmission.video_url && (
            <div className="mt-2">
              <a
                href={userSubmission.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                <Video className="w-4 h-4" />
                {isVietnamese ? "Xem video" : "Watch Video"}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            {isVietnamese ? "Bảng xếp hạng hôm nay" : "Today's Leaderboard"}
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {submissions.length} {isVietnamese ? "người tham gia" : "participants"}
          </span>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {isVietnamese ? "Chưa có ai tham gia hôm nay" : "No participants yet today"}
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.slice(0, 10).map((submission, index) => (
              <div
                key={submission.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    {index === 0 && <Trophy className="w-6 h-6 text-yellow-500" />}
                    {index === 1 && <Trophy className="w-6 h-6 text-gray-400" />}
                    {index === 2 && <Trophy className="w-6 h-6 text-amber-600" />}
                    {index > 2 && <span className="text-sm font-bold text-gray-500">#{index + 1}</span>}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {submission.user_profiles?.username || 'Anonymous'}
                    </div>
                    {submission.solution && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {submission.solution.substring(0, 20)}...
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatTime(submission.time_ms)}
                  </div>
                  {submission.video_url && (
                    <Video className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Archive Link */}
      <button
        onClick={() => void toggleArchive()}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <Calendar className="w-5 h-5" />
        {isVietnamese ? "Xem thử thách trước" : "View Previous Challenges"}
        <ChevronRight className={`w-5 h-5 transition-transform ${showArchive ? 'rotate-90' : ''}`} />
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