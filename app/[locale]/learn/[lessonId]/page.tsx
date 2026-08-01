import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import LessonDetailContent from "@/components/lessons/LessonDetailContent";

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ locale: string; lessonId: string }>;
}) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale as "en" | "vi";
  const lessonId = resolvedParams.lessonId;

  if (!supabase) {
    notFound();
  }

  const { data: lesson, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .maybeSingle();

  if (error || !lesson) {
    notFound();
  }

  const relatedIds = Array.isArray(lesson.related_algorithm_ids)
    ? lesson.related_algorithm_ids
    : [];

  let relatedAlgorithms: Array<{ id: string; name_en: string; name_vi: string }> = [];
  if (relatedIds.length > 0 && supabase) {
    const { data } = await supabase
      .from("algorithms")
      .select("id, name_en, name_vi")
      .in("id", relatedIds);

    relatedAlgorithms = data || [];
  }

  return (
    <div>
      <div className="max-w-5xl mx-auto px-8 pt-8 lg:px-10">
        <Link
          href={`/${locale}/learn`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          {locale === "vi" ? "Quay lại lộ trình" : "Back to learning path"}
        </Link>
      </div>

      <LessonDetailContent lesson={lesson} locale={locale} relatedAlgorithms={relatedAlgorithms} />
    </div>
  );
}
