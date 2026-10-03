import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarDays, MessageSquareText, Share2, Sparkles, Trophy, Users, type LucideIcon } from "lucide-react";
import DailyChallengeComponent from "@/components/community/DailyChallengeComponent";
import LeaderboardsComponent from "@/components/community/LeaderboardsComponent";
import { COMMUNITY_FEATURES, type CommunityFeature } from "@/components/community/communityFeatures";
import type { Dictionary } from "@/lib/dictionary";

const ICONS: Record<string, LucideIcon> = {
  challenges: CalendarDays,
  leaderboards: Trophy,
  forums: MessageSquareText,
  profiles: Users,
  'progress-sharing': Share2,
  tournaments: Sparkles,
};

interface CommunityFeaturePageProps {
  locale: 'en' | 'vi';
  dict: Dictionary;
  feature: CommunityFeature;
}

export default function CommunityFeaturePage({ locale, dict, feature }: CommunityFeaturePageProps) {
  const Icon = ICONS[feature.slug];
  const title = dict.community[feature.titleKey];
  const suggestionTitle = feature.relatedTitleKey === 'dashboard'
    ? dict.dashboard.welcome
    : feature.relatedTitleKey === 'challenges'
      ? dict.community.challenges
      : dict[feature.relatedTitleKey].title;

  return (
    <main className="min-h-screen bg-[#f3f6f3] text-slate-950 dark:bg-[#101714] dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
        <Link href={`/${locale}/community`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-800 dark:text-slate-300 dark:hover:text-emerald-300">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {dict.community.back_to_community}
        </Link>

        <nav aria-label={dict.community.title} className="mt-6 flex gap-2 overflow-x-auto border-b border-slate-200 pb-3 dark:border-white/10">
          {COMMUNITY_FEATURES.map((item) => {
            const ItemIcon = ICONS[item.slug];
            const active = item.slug === feature.slug;
            return (
              <Link
                key={item.slug}
                href={`/${locale}/community/${item.slug}`}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${active ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-white/10'}`}
              >
                <ItemIcon className="h-4 w-4" aria-hidden="true" />
                {dict.community[item.titleKey]}
              </Link>
            );
          })}
        </nav>

        <header className="my-7 flex flex-col gap-4 border-b border-slate-200 pb-7 dark:border-white/10 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${feature.iconTone}`}>
              <Icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <div className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{dict.community.title}</div>
              <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                {dict.community[feature.descriptionKey]}
              </p>
            </div>
          </div>
          <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${feature.status === 'live' ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}>
            {feature.status === 'live' ? dict.community.feature_live : dict.community.feature_building}
          </span>
        </header>

        {feature.slug === 'challenges' ? (
          <DailyChallengeComponent locale={locale} dict={dict} />
        ) : feature.slug === 'leaderboards' ? (
          <LeaderboardsComponent locale={locale} dict={dict} />
        ) : (
          <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#18211d] sm:grid-cols-[minmax(0,1fr)_280px] sm:p-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">{dict.community.coming_soon}</span>
              <h2 className="mt-2 text-xl font-bold">{dict.community.feature_preview_title}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{dict.community.feature_preview_description}</p>
            </div>
            <Link href={`/${locale}${feature.relatedHref}`} className="flex min-h-28 items-center justify-between gap-4 rounded-lg bg-slate-50 p-4 text-slate-900 transition-colors hover:bg-emerald-50 dark:bg-white/5 dark:text-white dark:hover:bg-emerald-950/40">
              <span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">{dict.community.feature_suggestion}</span>
                <span className="mt-1 block font-bold">{suggestionTitle}</span>
              </span>
              <ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden="true" />
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}