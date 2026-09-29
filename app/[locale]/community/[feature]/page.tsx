import { notFound } from "next/navigation";
import CommunityFeaturePage from "@/components/community/CommunityFeaturePage";
import { COMMUNITY_FEATURES } from "@/components/community/CommunityHub";
import { getDictionary } from "@/lib/dictionary";

export default async function CommunityFeatureRoute({ params }: { params: Promise<{ locale: string; feature: string }> }) {
  const { locale: routeLocale, feature: slug } = await params;
  const locale = routeLocale === 'vi' ? 'vi' : 'en';
  const feature = COMMUNITY_FEATURES.find((item) => item.slug === slug);

  if (!feature) notFound();

  const dict = await getDictionary(locale);
  return <CommunityFeaturePage locale={locale} dict={dict} feature={feature} />;
}