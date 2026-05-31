import Link from "next/link";
import { getAllInterviews } from "@/lib/interviews";
import PageShell from "@/components/PageShell";
import InterviewAtmosphere from "@/components/atmosphere/InterviewAtmosphere";

export const dynamic = "force-dynamic";

export default function InterviewPage() {
  const entries = getAllInterviews();

  return (
    <InterviewAtmosphere>
      <PageShell title="面试经历" titleEn="Interview">
      {entries.length === 0 ? (
        <p className="text-white/35 text-sm">
          暂无面试记录。在{" "}
          <code className="text-white/50 font-mono text-xs bg-white/[0.04] px-1.5 py-0.5 rounded">
            content/interview/
          </code>{" "}
          中添加 Markdown 文件即可。
        </p>
      ) : (
        <div className="space-y-12">
          {entries.map((entry) => (
            <Link
              key={entry.slug}
              href={`/interview/${entry.slug}`}
              className="block group border-l border-white/[0.06] pl-5 hover:border-white/[0.14] transition-colors duration-300"
            >
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h3 className="text-white/80 font-medium text-sm group-hover:text-white/95 transition-colors duration-300">
                  {entry.company}
                </h3>
                <span className="text-white/20 text-xs">/</span>
                <span className="text-xs text-white/40 font-mono tracking-wide">
                  {entry.role}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-white/25 font-mono">
                  {entry.date}
                </span>
                {entry.outcome && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/[0.06] text-white/35">
                    {entry.outcome}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
    </InterviewAtmosphere>
  );
}
