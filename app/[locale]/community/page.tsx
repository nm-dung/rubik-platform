import CommunityHub from "@/components/community/CommunityHub";
import { getDictionary } from "@/lib/dictionary";

export default async function CommunityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: routeLocale } = await params;
  const locale = routeLocale === 'vi' ? 'vi' : 'en';
  const dict = await getDictionary(locale);

  return <CommunityHub locale={locale} dict={dict} />;
}
