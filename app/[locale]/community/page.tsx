"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Users, MessageSquare, Trophy, Share2, Calendar, TrendingUp } from "lucide-react";

export default function CommunityPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4 animate-pulse">
            Community Hub
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 px-2">
            Connect with fellow cubers, share your progress, and compete in challenges
          </p>
        </div>

        {/* Placeholder Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 stagger-in">
          {/* Leaderboards */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 touch-manipulation active:scale-95 card-hover group">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 sm:p-3 rounded-lg group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">Leaderboards</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
              See how you rank against other cubers in various categories
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 text-center text-gray-400 dark:text-gray-500 text-sm group-hover:bg-yellow-50 dark:group-hover:bg-yellow-900/20 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
              Coming Soon
            </div>
          </div>

          {/* Forums */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 touch-manipulation active:scale-95 card-hover group">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Forums</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
              Discuss techniques, share tips, and ask questions
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 text-center text-gray-400 dark:text-gray-500 text-sm group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Coming Soon
            </div>
          </div>

          {/* Challenges */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 touch-manipulation active:scale-95 card-hover group">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 sm:p-3 rounded-lg group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Challenges</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
              Participate in weekly and monthly challenges
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 text-center text-gray-400 dark:text-gray-500 text-sm group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Coming Soon
            </div>
          </div>

          {/* User Profiles */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 touch-manipulation active:scale-95 card-hover group">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-2 sm:p-3 rounded-lg group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">User Profiles</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
              View other cubers' profiles and achievements
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 text-center text-gray-400 dark:text-gray-500 text-sm group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Coming Soon
            </div>
          </div>

          {/* Progress Sharing */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 touch-manipulation active:scale-95 card-hover group">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-pink-100 dark:bg-pink-900/30 p-2 sm:p-3 rounded-lg group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">Progress Sharing</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
              Share your learning journey with the community
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 text-center text-gray-400 dark:text-gray-500 text-sm group-hover:bg-pink-50 dark:group-hover:bg-pink-900/20 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
              Coming Soon
            </div>
          </div>

          {/* Tournaments */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 touch-manipulation active:scale-95 card-hover group">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-2 sm:p-3 rounded-lg group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Tournaments</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4">
              Compete in organized speedcubing tournaments
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 sm:p-4 text-center text-gray-400 dark:text-gray-500 text-sm group-hover:bg-orange-50 dark:group-hover:bg-orange-900/20 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              Coming Soon
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
