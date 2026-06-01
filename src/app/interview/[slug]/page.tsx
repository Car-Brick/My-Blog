import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getInterviewBySlug, getAllInterviews } from "@/lib/interviews";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllInterviews().map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const interview = getInterviewBySlug(slug);
  if (!interview) return { title: "Not Found" };
  return {
    title: `${interview.company} — ${interview.role} — Interview`,
  };
}

export default async function InterviewDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = getInterviewBySlug(slug);

  if (!entry) notFound();

  return (
    <main className="min-h-screen pt-20 pb-32">
      <article className="max-w-3xl mx-auto px-6">
        <Link
          href="/interview"
          className="inline-flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 transition-colors duration-300 mb-10"
        >
          <span className="text-white/20">←</span>
          返回面试列表
        </Link>

        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white/90 leading-tight">
            {entry.company}
          </h1>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span className="text-sm text-white/50">{entry.role}</span>
            <span className="text-white/15">·</span>
            <span className="text-xs text-white/30 font-mono">
              {entry.date}
            </span>
            {entry.outcome && (
              <>
                <span className="text-white/15">·</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded border border-white/[0.06] text-white/40">
                  {entry.outcome}
                </span>
              </>
            )}
          </div>
        </header>

        <div className="border-t border-white/[0.05] mb-12" />

        <div className="prose-custom">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {entry.content}
          </ReactMarkdown>
        </div>

        <div className="border-t border-white/[0.05] mt-16 mb-8" />

        <Link
          href="/interview"
          className="inline-flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 transition-colors duration-300"
        >
          <span className="text-white/20">←</span>
          返回面试列表
        </Link>
      </article>
    </main>
  );
}
