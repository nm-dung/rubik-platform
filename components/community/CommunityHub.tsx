import Link from "next/link";
import { ArrowUpRight, CalendarDays, MessageSquareText, Share2, Sparkles, Trophy, Users, type LucideIcon } from "lucide-react";
import type { Dictionary } from "@/lib/dictionary";

export type CommunityFeatureSlug = 'leaderboards' | 'forums' | 'challenges' | 'profiles' | 'progress-sharing' | 'tournaments';
type FeatureTitleKey = 'leaderboards' | 'forums' | 'challenges' | 'user_profiles' | 'progress_sharing' | 'tournaments';
type FeatureDescriptionKey = 'leaderboards_description' | 'forums_description' | 'challenges_description' | 'user_profiles_description' | 'progress_sharing_description' | 'tournaments_description';

export interface CommunityFeature {
  slug: CommunityFeatureSlug;
  titleKey: FeatureTitleKey;
  descriptionKey: FeatureDescriptionKey;
  icon: LucideIcon;
  status: 'live' | 'building';
  accent: string;
  iconTone: string;
  number: string;
  relatedHref: string;
  relatedTitleKey: 'learn' | 'algorithms' | 'timer' | 'dashboard' | 'challenges';
}

export const COMMUNITY_FEATURES: CommunityFeature[] = [
  {
    slug: 'challenges',
    titleKey: 'challenges',
    descriptionKey: 'challenges_description',
    icon: CalendarDays,
    status: 'live',
    accent: 'border-emerald-300 dark:border-emerald-800',
    iconTone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
    number: '01',
    relatedHref: '/timer',
    relatedTitleKey: 'timer',
  },
  {
    slug: 'leaderboards',
    titleKey: 'leaderboards',
    descriptionKey: 'leaderboards_description',
    icon: Trophy,
    status: 'live',
    accent: 'border-amber-300 dark:border-amber-800',
    iconTone: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
    number: '02',
    relatedHref: '/algorithms',
    relatedTitleKey: 'algorithms',
  },
  {
    slug: 'forums',
    titleKey: 'forums',
    descriptionKey: 'forums_description',
    icon: MessageSquareText,
    status: 'building',
    accent: 'border-sky-300 dark:border-sky-800',
    iconTone: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200',
    number: '03',
    relatedHref: '/learn',
    relatedTitleKey: 'learn',
  },
  {
    slug: 'profiles',
    titleKey: 'user_profiles',
    descriptionKey: 'user_profiles_description',
    icon: Users,
    status: 'building',
    accent: 'border-rose-300 dark:border-rose-800',
    iconTone: 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200',
    number: '04',
    relatedHref: '/dashboard',
    relatedTitleKey: 'dashboard',
  },
  {
    slug: 'progress-sharing',
    titleKey: 'progress_sharing',
    descriptionKey: 'progress_sharing_description',
    icon: Share2,
    status: 'building',
    accent: 'border-cyan-300 dark:border-cyan-800',
    iconTone: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200',
    number: '05',
    relatedHref: '/dashboard',
    relatedTitleKey: 'dashboard',
  },
  {
    slug: 'tournaments',
    titleKey: 'tournaments',
    descriptionKey: 'tournaments_description',
    icon: Sparkles,
    status: 'building',
    accent: 'border-orange-300 dark:border-orange-800',
    iconTone: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
    number: '06',
    relatedHref: '/community/challenges',
    relatedTitleKey: 'challenges',
  },
];

interface CommunityHubProps {
  locale: 'en' | 'vi';
  dict: Dictionary;
}

export default function CommunityHub({ locale, dict }: CommunityHubProps) {
  return (
    <main className="min-h-screen bg-[#f3f6f3] text-slate-950 dark:bg-[#101714] dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="mb-8 flex flex-col gap-5 border-b border-emerald-950/10 pb-8 dark:border-white/10 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {dict.community.title}
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">{dict.community.title}</h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
              {dict.community.description}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <span className="font-mono text-2xl font-bold text-emerald-800 dark:text-emerald-300">06</span>
            <span className="max-w-36">{dict.community.hub_count_label}</span>
          </div>
        </header>

        <section aria-label={dict.community.title} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {COMMUNITY_FEATURES.map((feature) => {
            const Icon = feature.icon;
            const featured = feature.slug === 'challenges';

            return (
              <Link
                key={feature.slug}
                href={`/${locale}/community/${feature.slug}`}
                className={`group relative flex min-h-64 flex-col justify-between overflow-hidden rounded-lg border bg-white p-5 transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 dark:bg-[#18211d] sm:p-6 ${feature.accent} ${featured ? 'md:col-span-2 xl:col-span-2' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${feature.iconTone}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{feature.number}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${feature.status === 'live' ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                      {feature.status === 'live' ? dict.community.feature_live : dict.community.feature_building}
                    </span>
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="text-xl font-bold">{dict.community[feature.titleKey]}</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {dict.community[feature.descriptionKey]}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 text-sm font-semibold text-slate-800 dark:border-white/10 dark:text-white">
                  <span>{dict.community.open_feature}</span>
                  <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}