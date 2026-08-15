"use client";

import { X } from "lucide-react";

interface Achievement {
  id: string;
  name_en: string;
  name_vi: string;
  description_en: string;
  description_vi: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  points: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

interface AchievementModalProps {
  achievement: Achievement;
  locale: 'en' | 'vi';
  onClose: () => void;
}

export function AchievementModal({ achievement, locale, onClose }: AchievementModalProps) {
  const isVietnamese = locale === 'vi';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform hover:scale-105 transition-all duration-300">
        <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 dark:from-yellow-500 dark:via-orange-600 dark:to-red-600 p-8 text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/20 dark:bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/20 dark:bg-white/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="text-7xl mb-3 animate-bounce">{achievement.icon}</div>
            <h3 className="text-3xl font-black text-white mb-2">
              {isVietnamese ? achievement.name_vi : achievement.name_en}
            </h3>
            <div className="inline-flex items-center gap-2 bg-white/20 dark:bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-white font-bold text-lg">+{achievement.points}</span>
              <span className="text-white/90 text-sm">{isVietnamese ? "điểm" : "points"}</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-300 text-center mb-6 text-lg">
            {isVietnamese ? achievement.description_vi : achievement.description_en}
          </p>
          
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-5 mb-6 border border-slate-200 dark:border-gray-600">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              {isVietnamese ? "Yêu cầu:" : "Requirement:"}
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-lg">
              {achievement.requirement_type === 'lessons_completed' && 
                `${isVietnamese ? 'Hoàn thành' : 'Complete'} ${achievement.requirement_value} ${isVietnamese ? 'bài học' : 'lessons'}`
              }
              {achievement.requirement_type === 'algorithms_practiced' && 
                `${isVietnamese ? 'Luyện' : 'Practice'} ${achievement.requirement_value} ${isVietnamese ? 'thuật toán' : 'algorithms'}`
              }
              {achievement.requirement_type === 'streak_days' && 
                `${isVietnamese ? 'Duy trì chuỗi' : 'Maintain streak'} ${achievement.requirement_value} ${isVietnamese ? 'ngày' : 'days'}`
              }
              {achievement.requirement_type === 'avg_time' && 
                `${isVietnamese ? 'Thời gian trung bình dưới' : 'Average time under'} ${(achievement.requirement_value / 1000).toFixed(1)}s`
              }
              {achievement.requirement_type === 'total_solves' && 
                `${isVietnamese ? 'Hoàn thành' : 'Complete'} ${achievement.requirement_value} ${isVietnamese ? 'lần giải' : 'solves'}`
              }
            </div>
          </div>

          {achievement.unlockedAt && (
            <div className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 py-2 rounded-xl">
              {isVietnamese ? '🎉 Đã mở khóa:' : '🎉 Unlocked:'} {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          )}
          
          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            {isVietnamese ? "Tiếp tục" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
