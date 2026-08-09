"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Users, MessageSquare, Trophy, Share2, Calendar, TrendingUp } from "lucide-react";

export default function CommunityPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4 animate-pulse">
            Community Hub
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 px-2">
            Connect with fellow cubers, share your progress, and compete in challenges
          </p>
        </div>

        {/* Placeholder Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Leaderboards */}
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 touch-manipulation active:scale-95">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-yellow-100 p-2 sm:p-3 rounded-lg">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Leaderboards</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              See how you rank against other cubers in various categories
            </p>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center text-gray-400 text-sm">
              Coming Soon
            </div>
          </div>

          {/* Forums */}
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 touch-manipulation active:scale-95">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Forums</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              Discuss techniques, share tips, and ask questions
            </p>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center text-gray-400 text-sm">
              Coming Soon
            </div>
          </div>

          {/* Challenges */}
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 touch-manipulation active:scale-95">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Challenges</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              Participate in weekly and monthly challenges
            </p>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center text-gray-400 text-sm">
              Coming Soon
            </div>
          </div>

          {/* User Profiles */}
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 touch-manipulation active:scale-95">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-purple-100 p-2 sm:p-3 rounded-lg">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">User Profiles</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              View other cubers' profiles and achievements
            </p>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center text-gray-400 text-sm">
              Coming Soon
            </div>
          </div>

          {/* Progress Sharing */}
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 touch-manipulation active:scale-95">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-pink-100 p-2 sm:p-3 rounded-lg">
                <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Progress Sharing</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              Share your solves and achievements with the community
            </p>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center text-gray-400 text-sm">
              Coming Soon
            </div>
          </div>

          {/* Tournaments */}
          <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 touch-manipulation active:scale-95">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="bg-red-100 p-2 sm:p-3 rounded-lg">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Tournaments</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              Compete in community tournaments and events
            </p>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center text-gray-400 text-sm">
              Coming Soon
            </div>
          </div>
        </div>

        {/* Login Prompt for non-logged users */}
        {!user && (
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 text-center text-white shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Join the Community</h2>
            <p className="mb-4 sm:mb-6 text-sm sm:text-base text-indigo-100 px-2">
              Sign up to connect with other cubers and access all community features
            </p>
            <div className="flex gap-3 sm:gap-4 justify-center">
              <a
                href="/en/auth/login"
                className="bg-white text-indigo-600 px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors text-sm sm:text-base touch-manipulation active:scale-95"
              >
                Sign In
              </a>
              <a
                href="/en/auth/signup"
                className="bg-indigo-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-indigo-800 transition-colors text-sm sm:text-base touch-manipulation active:scale-95"
              >
                Sign Up
              </a>
            </div>
          </div>
        )}

        {/* Welcome message for logged users */}
        {user && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 text-center text-white shadow-lg">
            <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Welcome to the Community!</h2>
            <p className="text-sm sm:text-base text-green-100">
              Stay tuned for exciting community features coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
}