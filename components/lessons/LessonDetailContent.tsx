"use client";

import { useMemo } from "react";
import { BookOpen, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { useLessonProgressStore } from "@/hooks/useLessonProgressStore";
import ContributionRequestForm from "@/components/lessons/ContributionRequestForm";
import type { Lesson, LessonDifficulty } from "@/lib/types";

interface LessonDetailContentProps {
  lesson: Lesson;
  locale: "en" | "vi";
  relatedAlgorithms: Array<{ id: string; name_en: string; name_vi: string }>;
}

const difficultyMeta: Record<LessonDifficulty, { label: string; badgeClass: string }> = {
  beginner: { label: "Beginner", badgeClass: "bg-green-100 text-green-700" },
  intermediate: { label: "Intermediate", badgeClass: "bg-blue-100 text-blue-700" },
  advanced: { label: "Advanced", badgeClass: "bg-purple-100 text-purple-700" },
};

export default function LessonDetailContent({ lesson, locale, relatedAlgorithms }: LessonDetailContentProps) {
  const completedLessonIds = useLessonProgressStore((state) => state.completedLessonIds);
  const toggleCompletedLesson = useLessonProgressStore((state) => state.toggleCompletedLesson);

  const isCompleted = completedLessonIds.includes(lesson.id);

  const title = locale === "vi" ? lesson.title_vi : lesson.title_en;
  const description = locale === "vi" ? lesson.description_vi : lesson.description_en;
  const content = locale === "vi" ? lesson.content_vi : lesson.content_en;
  const difficulty = difficultyMeta[lesson.difficulty];

  const practiceSteps = useMemo(() => {
    if (locale === "vi") {
      return {
        beginner: [
          "Nhìn lại cấu trúc khối và cách các mảnh di chuyển",
          "Luyện tập từng bước một cách chậm rãi",
          "Thử giải lại bài học mà không nhìn vào gợi ý",
        ],
        intermediate: [
          "Gắn kết các bước với các thuật toán đã học",
          "Tập trung vào tốc độ và độ chính xác",
          "Làm lại cùng một bài học nhiều lần để ghi nhớ",
        ],
        advanced: [
          "Tối ưu các chuyển động của bạn",
          "Luyện từ trí nhớ cơ bắp đến nhận diện mẫu",
          "So sánh cách giải của bạn với phương pháp speed cubing chuyên nghiệp",
        ],
      }[lesson.difficulty];
    }

    return {
      beginner: [
        "Review the cube structure and how pieces move",
        "Practice each step slowly and deliberately",
        "Try solving it again without the hints",
      ],
      intermediate: [
        "Connect the step to the algorithms you have learned",
        "Focus on both speed and accuracy",
        "Repeat the lesson until the pattern feels natural",
      ],
      advanced: [
        "Optimize your movement efficiency",
        "Train recognition and muscle memory together",
        "Compare your approach with more advanced speed cubing strategies",
      ],
    }[lesson.difficulty];
  }, [lesson.difficulty, locale]);

  const goals = locale === "vi"
    ? ["Hiểu khái niệm nền tảng", "Áp dụng trong thực hành", "Chuẩn bị cho các bài học tiếp theo"]
    : ["Understand the foundational concept", "Apply it during practice", "Prepare for the next lessons"];

  return (
    <main className="max-w-5xl mx-auto p-8 lg:p-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className={`rounded-full px-3 py-1 text-sm font-semibold uppercase tracking-wide ${difficulty.badgeClass}`}>
            {difficulty.label}
          </span>
          {lesson.duration_minutes ? (
            <span className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              {lesson.duration_minutes} min
            </span>
          ) : null}
        </div>

        <h1 className="text-4xl font-black text-slate-900 mb-4">{title}</h1>
        <p className="text-lg leading-relaxed text-slate-600">{description}</p>

        <button
          type="button"
          onClick={() => toggleCompletedLesson(lesson.id)}
          className={`mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            isCompleted
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          {isCompleted
            ? (locale === "vi" ? "Đã hoàn thành bài học" : "Completed lesson")
            : (locale === "vi" ? "Đánh dấu đã hoàn thành" : "Mark as complete")}
        </button>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="rounded-xl bg-slate-100 p-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {locale === "vi" ? "Nội dung bài học" : "Lesson content"}
            </h2>
          </div>

          <div className="space-y-6 text-slate-700 leading-8">
            <p>{content || description}</p>

            <div className="rounded-2xl bg-slate-50 p-4">
              <h3 className="text-lg font-black text-slate-900 mb-3">
                {locale === "vi" ? "Bạn sẽ thực hành" : "What you will practice"}
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {practiceSteps.map((step) => (
                  <li key={step} className="flex gap-2">
                    <span className="mt-1 text-indigo-500">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-black text-slate-900">
                {locale === "vi" ? "Thuật toán liên quan" : "Related algorithms"}
              </h3>
            </div>

            {relatedAlgorithms.length > 0 ? (
              <ul className="space-y-2">
                {relatedAlgorithms.map((algorithm) => (
                  <li key={algorithm.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                    {locale === "vi" ? algorithm.name_vi : algorithm.name_en}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">
                {locale === "vi" ? "Chưa có thuật toán liên quan." : "No related algorithms yet."}
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-3">
              {locale === "vi" ? "Mục tiêu học tập" : "Learning goals"}
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {goals.map((goal) => (
                <li key={goal} className="flex gap-2">
                  <span className="mt-1 text-indigo-500">•</span>
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </div>

          <ContributionRequestForm lessonId={lesson.id} lessonTitle={title} locale={locale} />
        </aside>
      </section>
    </main>
  );
}
