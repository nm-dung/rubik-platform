"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Award, TrendingUp, Clock, Target, Filter } from "lucide-react";

interface LeaderboardEntry {
  user_id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  total_solves?: number;
  practice_count?: number;
  avg_time_ms?: number;
  best_avg_time_ms?: number;
  best_time_ms?: number;
  best_single_time_ms?: number;
  algorithms_learned?: number;
}

interface LeaderboardResponse {
  data: LeaderboardEntry[];
  type: string;
}

interface LeaderboardsComponentProps {
  locale: 'en' | 'vi';
  dict: any;
}

export default function LeaderboardsComponent({ locale, dict }: LeaderboardsComponentProps) {
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [currentType, setCurrentType] = useState<'overall' | 'algorithm' | 'category'>('overall');
  const [selectedCategory, setSelectedCategory] = useState<'PLL' | 'OLL' | 'F2L'>('PLL');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>('');
  const [algorithms, setAlgorithms] = useState<any[]>([]);

  const isVietnamese = locale === 'vi';

  useEffect(() => {
    loadAlgorithms();
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [currentType, selectedCategory, selectedAlgorithm]);

  const loadAlgorithms = async () => {
    try {
      const response = await fetch('/api/algorithms');
      const data = await response.json();
      setAlgorithms(data || []);
    } catch (error) {
      console.error('Error loading algorithms:', error);
    }
  };

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      let url = `/api/leaderboards?type=${currentType}`;
      
      if (currentType === 'category') {
        url += `&category=${selectedCategory}`;
      } else if (currentType === 'algorithm' && selectedAlgorithm) {
        url += `&algorithmId=${selectedAlgorithm}`;
      }

      const response = await fetch(url);
      const data: LeaderboardResponse = await response.json();
      setLeaderboardData(data.data || []);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms?: number) => {
    if (!ms || ms === Infinity) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-slate-500">{rank}</span>;
  };

  return (
    <div>
      {/* Type Selector */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setCurrentType('overall')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentType === 'overall'
              ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
              : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-gray-600'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          {dict?.leaderboards?.overall || (isVietnamese ? "Tổng quan" : "Overall")}
        </button>
        <button
          onClick={() => setCurrentType('category')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentType === 'category'
              ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
              : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-gray-600'
          }`}
        >
          <Filter className="w-4 h-4 inline mr-2" />
          {dict?.leaderboards?.by_category || (isVietnamese ? "Theo danh mục" : "By Category")}
        </button>
        <button
          onClick={() => setCurrentType('algorithm')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentType === 'algorithm'
              ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
              : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-gray-600'
          }`}
        >
          <Target className="w-4 h-4 inline mr-2" />
          {dict?.leaderboards?.by_algorithm || (isVietnamese ? "Theo thuật toán" : "By Algorithm")}
        </button>
      </div>

      {/* Category Selector */}
      {currentType === 'category' && (
        <div className="mb-6 flex flex-wrap gap-2">
          {['PLL', 'OLL', 'F2L'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                  : 'bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Algorithm Selector */}
      {currentType === 'algorithm' && (
        <div className="mb-6">
          <select
            value={selectedAlgorithm}
            onChange={(e) => setSelectedAlgorithm(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-slate-900 dark:text-white"
          >
            <option value="">{dict?.leaderboards?.select_algorithm || (isVietnamese ? "Chọn thuật toán..." : "Select algorithm...")}</option>
            {algorithms.map((alg) => (
              <option key={alg.id} value={alg.id}>
                {isVietnamese ? alg.name_vi : alg.name_en}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-600 dark:text-slate-400">
            {dict?.leaderboards?.loading || (isVietnamese ? "Đang tải..." : "Loading...")}
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="p-8 text-center text-slate-600 dark:text-slate-400">
            {dict?.leaderboards?.no_data || (isVietnamese ? "Chưa có dữ liệu" : "No data available")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {dict?.leaderboards?.rank || (isVietnamese ? "Hạng" : "Rank")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {dict?.leaderboards?.user || (isVietnamese ? "Người dùng" : "User")}
                  </th>
                  {currentType === 'overall' && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {dict?.leaderboards?.total_solves || (isVietnamese ? "Tổng giải" : "Total Solves")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {dict?.leaderboards?.best_avg || (isVietnamese ? "Trung bình tốt nhất" : "Best Avg")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {dict?.leaderboards?.best_single || (isVietnamese ? "Đơn tốt nhất" : "Best Single")}
                      </th>
                    </>
                  )}
                  {currentType === 'category' && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {dict?.leaderboards?.total_solves || (isVietnamese ? "Tổng giải" : "Total Solves")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {dict?.leaderboards?.algorithms_learned || (isVietnamese ? "Thuật toán đã học" : "Algorithms Learned")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {dict?.leaderboards?.best_single || (isVietnamese ? "Đơn tốt nhất" : "Best Single")}
                      </th>
                    </>
                  )}
                  {currentType === 'algorithm' && (
                    <>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {dict?.leaderboards?.practice_count || (isVietnamese ? "Số lần thực hành" : "Practice Count")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {dict?.leaderboards?.average || (isVietnamese ? "Trung bình" : "Average")}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {dict?.leaderboards?.best_single || (isVietnamese ? "Đơn tốt nhất" : "Best Single")}
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                {leaderboardData.map((entry, index) => (
                  <tr key={entry.user_id} className="hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRankIcon(index + 1)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {entry.avatar_url ? (
                          <img
                            src={entry.avatar_url}
                            alt={entry.username}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mr-3">
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                              {entry.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {entry.username}
                          </div>
                          {entry.full_name && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {entry.full_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    {currentType === 'overall' && (
                      <>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          {entry.total_solves || 0}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {formatTime(entry.best_avg_time_ms)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {formatTime(entry.best_single_time_ms)}
                        </td>
                      </>
                    )}
                    {currentType === 'category' && (
                      <>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          {entry.total_solves || 0}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          {entry.algorithms_learned || 0}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {formatTime(entry.best_single_time_ms)}
                        </td>
                      </>
                    )}
                    {currentType === 'algorithm' && (
                      <>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          {entry.practice_count || 0}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {formatTime(entry.avg_time_ms)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">
                          <Clock className="w-4 h-4 inline mr-1" />
                          {formatTime(entry.best_time_ms)}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}