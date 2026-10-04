"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles, Zap, Flame, Target, Award, TrendingUp } from "lucide-react";
import type { Dictionary } from "@/lib/dictionary";
import { COMMUNITY_FEATURES, type CommunityFeature, type FeatureTitleKey, type FeatureDescriptionKey, type CommunityFeatureSlug } from "./communityFeatures";
import { useEffect, useState } from "react";

// Re-export types for backward compatibility
export type { CommunityFeature, FeatureTitleKey, FeatureDescriptionKey, CommunityFeatureSlug };
export { COMMUNITY_FEATURES };

// Check for reduced motion preference
const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return prefersReducedMotion;
};

// Feature Card Component - Memoized for performance
function FeatureCard({ 
  feature, 
  index, 
  dict, 
  locale,
  getFeatureTitle, 
  getFeatureDescription 
}: { 
  feature: CommunityFeature; 
  index: number; 
  dict: Dictionary;
  locale: 'en' | 'vi';
  getFeatureTitle: (key: FeatureTitleKey) => string;
  getFeatureDescription: (key: FeatureDescriptionKey) => string;
}) {
  const Icon = feature.icon;
  const featured = feature.slug === 'challenges';
  const StatusIcon = feature.status === 'live' ? Zap : Target;
  const reducedMotion = useReducedMotion();

  return (
    <Link
      href={`/${locale}/community/${feature.slug}`}
      className={`group relative flex min-h-72 flex-col justify-between overflow-hidden rounded-2xl border bg-white dark:bg-[#18211d] p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 ${feature.accent} ${featured ? 'md:col-span-2 xl:col-span-2 min-h-80' : ''} ${reducedMotion ? '' : 'animate-fade-in'}`}
      style={{ animationDelay: reducedMotion ? undefined : `${index * 0.1}s` }}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.status === 'live' ? 'from-emerald-500/10 to-teal-500/10' : 'from-slate-500/10 to-gray-500/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      {/* Animated number */}
      <div className={`absolute top-4 right-4 text-6xl font-black text-slate-100 dark:text-slate-800 opacity-10 group-hover:opacity-20 transition-opacity duration-300 font-mono ${reducedMotion ? '' : 'animate-pulse'}`}>
        {feature.number}
      </div>

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className={`relative flex h-14 w-14 items-center justify-center rounded-xl ${feature.iconTone} group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 ${reducedMotion ? '' : 'will-change-transform'}`}>
            <Icon className="h-7 w-7" aria-hidden="true" />
            <div className={`absolute inset-0 bg-${feature.status === 'live' ? 'emerald' : 'slate'}-500 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300`}></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{feature.number}</span>
            <span className={`rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1 ${feature.status === 'live' ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
              <StatusIcon className="w-3 h-3" />
              {feature.status === 'live' ? dict.community?.feature_live : dict.community?.feature_building}
            </span>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 dark:group-hover:from-indigo-400 dark:group-hover:to-purple-400 transition-all duration-300">
            {getFeatureTitle(feature.titleKey)}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            {getFeatureDescription(feature.descriptionKey)}
          </p>
        </div>
      </div>

      <div className="relative mt-6 flex items-center justify-between border-t border-slate-200 dark:border-white/10 pt-4 text-sm font-semibold text-slate-800 dark:text-white">
        <span className="flex items-center gap-2 group-hover:translate-x-1 transition-transform duration-300">
          {dict.community?.open_feature}
        </span>
        <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:scale-110" aria-hidden="true" />
      </div>
    </Link>
  );
}

interface CommunityHubProps {
  locale: 'en' | 'vi';
  dict: Dictionary;
}

export default function CommunityHub({ locale, dict }: CommunityHubProps) {
  const reducedMotion = useReducedMotion();

  const getFeatureTitle = (titleKey: FeatureTitleKey): string => {
    const keyMap: Record<FeatureTitleKey, string> = {
      leaderboards: dict.community?.leaderboards || 'Leaderboards',
      forums: dict.community?.forums || 'Forums',
      challenges: dict.community?.challenges || 'Challenges',
      user_profiles: dict.community?.user_profiles || 'User Profiles',
      progress_sharing: dict.community?.progress_sharing || 'Progress Sharing',
      tournaments: dict.community?.tournaments || 'Tournaments',
    };
    return keyMap[titleKey];
  };

  const getFeatureDescription = (descriptionKey: FeatureDescriptionKey): string => {
    const keyMap: Record<FeatureDescriptionKey, string> = {
      leaderboards_description: dict.community?.leaderboards_description || 'See how you rank against other cubers in various categories',
      forums_description: dict.community?.forums_description || 'Discuss techniques, share tips, and ask questions',
      challenges_description: dict.community?.challenges_description || 'Take on the shared daily scramble, submit your solve, and climb the community board.',
      user_profiles_description: dict.community?.user_profiles_description || "View other cubers' profiles and achievements",
      progress_sharing_description: dict.community?.progress_sharing_description || 'Share your learning journey with the community',
      tournaments_description: dict.community?.tournaments_description || 'Compete in organized speedcubing tournaments',
    };
    return keyMap[descriptionKey];
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements - Optimized */}
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${reducedMotion ? '' : ''}`}>
        {!reducedMotion && (
          <>
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 dark:bg-yellow-900 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '4s' }}></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '6s' }}></div>
          </>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 relative z-10">
        {/* Animated Header */}
        <header className={`mb-8 flex flex-col gap-5 border-b border-emerald-950/10 pb-8 dark:border-white/10 sm:mb-10 sm:flex-row sm:items-end sm:justify-between ${reducedMotion ? '' : 'animate-fade-in'}`}>
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full bg-emerald-500 ${reducedMotion ? '' : 'animate-pulse'}`}></div>
              <span className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {dict.community.title}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              {dict.community.title}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
              {dict.community.description}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl px-6 py-3 border border-emerald-200 dark:border-emerald-800">
            <div className="relative">
              <Flame className={`w-6 h-6 text-orange-500 ${reducedMotion ? '' : 'animate-pulse'}`} />
              <div className="absolute inset-0 bg-orange-500 rounded-full blur-md opacity-30"></div>
            </div>
            <div>
              <span className="font-mono text-3xl font-bold text-emerald-800 dark:text-emerald-300">06</span>
              <span className="max-w-36 text-sm text-slate-600 dark:text-slate-300">{dict.community.hub_count_label}</span>
            </div>
          </div>
        </header>

        {/* Animated Feature Grid */}
        <section aria-label={dict.community.title} className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {COMMUNITY_FEATURES.map((feature, index) => (
            <FeatureCard
              key={feature.slug}
              feature={feature}
              index={index}
              dict={dict}
              locale={locale}
              getFeatureTitle={getFeatureTitle}
              getFeatureDescription={getFeatureDescription}
            />
          ))}
        </section>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </main>
  );
}