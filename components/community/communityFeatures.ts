import { CalendarDays, MessageSquareText, Share2, Sparkles, Trophy, Users, type LucideIcon } from "lucide-react";

export type CommunityFeatureSlug = 'leaderboards' | 'forums' | 'challenges' | 'profiles' | 'progress-sharing' | 'tournaments';
export type FeatureTitleKey = 'leaderboards' | 'forums' | 'challenges' | 'user_profiles' | 'progress_sharing' | 'tournaments';
export type FeatureDescriptionKey = 'leaderboards_description' | 'forums_description' | 'challenges_description' | 'user_profiles_description' | 'progress_sharing_description' | 'tournaments_description';

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
