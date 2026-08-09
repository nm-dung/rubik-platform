"use client";

import { useState } from "react";
import { CheckCircle2, SendHorizonal } from "lucide-react";

interface ContributionRequestFormProps {
  lessonId: string;
  lessonTitle: string;
  locale: "en" | "vi";
}

export default function ContributionRequestForm({ lessonId, lessonTitle, locale }: ContributionRequestFormProps) {
  const [form, setForm] = useState({
    name: "",
    role: "coach",
    type: "lesson",
    details: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const text = {
    en: {
      title: "Suggest an improvement",
      description: "Coaches can request new lessons, algorithms, or videos for the club library.",
      name: "Your name",
      role: "Role",
      roleOptions: { coach: "Coach", student: "Student", admin: "Admin" },
      type: "What would you like to add?",
      typeOptions: {
        lesson: "Lesson",
        algorithm: "Algorithm",
        video: "Video",
        other: "Other",
      },
      details: "Tell us what you want to add or improve",
      submit: "Send suggestion",
      success: "Thanks! Your suggestion has been recorded for review.",
      fallback: "The request was saved locally for now. It will be wired into the club dashboard later.",
    },
    vi: {
      title: "Gợi ý cải thiện",
      description: "Huấn luyện viên có thể đề xuất bài học mới, thuật toán hoặc video cho thư viện câu lạc bộ.",
      name: "Tên của bạn",
      role: "Vai trò",
      roleOptions: { coach: "Huấn luyện viên", student: "Học viên", admin: "Quản trị viên" },
      type: "Bạn muốn thêm gì?",
      typeOptions: {
        lesson: "Bài học",
        algorithm: "Thuật toán",
        video: "Video",
        other: "Khác",
      },
      details: "Cho biết bạn muốn thêm hoặc cải thiện điều gì",
      submit: "Gửi gợi ý",
      success: "Cảm ơn! Gợi ý của bạn đã được ghi nhận để xem xét.",
      fallback: "Yêu cầu đã được lưu cục bộ tạm thời. Nó sẽ được kết nối với bảng điều khiển câu lạc bộ sau.",
    },
  }[locale];

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        lessonId,
        lessonTitle,
        contributionType: form.type,
        submittedBy: form.name.trim() || "Anonymous",
        role: form.role,
        details: form.details.trim(),
        locale,
      };

      const response = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Unable to submit right now");
      }

      setSubmitted(true);
      setForm({ name: "", role: "coach", type: "lesson", details: "" });
    } catch (err) {
      const fallbackKey = `rubik-contribution-${lessonId}`;
      localStorage.setItem(
        fallbackKey,
        JSON.stringify({
          ...form,
          lessonId,
          lessonTitle,
          locale,
          createdAt: new Date().toISOString(),
        })
      );
      setSubmitted(true);
      setError(text.fallback);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 p-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <h4 className="text-lg font-black text-slate-900 dark:text-white">{text.title}</h4>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">{text.description}</p>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          <span className="mb-1 block">{text.name}</span>
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-slate-900 dark:text-white"
            placeholder={locale === "vi" ? "Ví dụ: Linh" : "e.g. Alex"}
          />
        </label>

        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          <span className="mb-1 block">{text.role}</span>
          <select
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-slate-900 dark:text-white"
          >
            {Object.entries(text.roleOptions).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        <span className="mb-1 block">{text.type}</span>
        <select
          value={form.type}
          onChange={(event) => setForm({ ...form, type: event.target.value })}
          className="w-full rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-slate-900 dark:text-white"
        >
          {Object.entries(text.typeOptions).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        <span className="mb-1 block">{text.details}</span>
        <textarea
          value={form.details}
          onChange={(event) => setForm({ ...form, details: event.target.value })}
          className="min-h-24 w-full rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-slate-900 dark:text-white"
          placeholder={locale === "vi" ? "Ví dụ: Tôi muốn thêm một video giải thích F2L" : "e.g. I want to add a short video explaining F2L"}
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 rounded-full bg-indigo-600 dark:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <SendHorizonal className="w-4 h-4" />
        {isSubmitting ? (locale === "vi" ? "Đang gửi..." : "Sending...") : text.submit}
      </button>

      {submitted ? (
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{text.success}</p>
      ) : null}
      {error ? <p className="text-sm font-medium text-amber-700 dark:text-amber-400">{error}</p> : null}
    </form>
  );
}
