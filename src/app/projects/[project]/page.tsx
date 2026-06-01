import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getProjectGroup, getProjectArticle, getProjectGroups } from "@/lib/projects";

interface Props {
  params: Promise<{ project: string }>;
}

export async function generateStaticParams() {
  return getProjectGroups().map((p) => ({ project: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { project: raw } = await params;
  const project = decodeURIComponent(raw);
  const group = getProjectGroup(project);
  if (!group || group.articles.length === 0) return { title: "Not Found" };
  return {
    title: `${group.title} — Projects`,
    description: group.summary,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { project: raw } = await params;
  const project = decodeURIComponent(raw);
  const group = getProjectGroup(project);

  if (!group || group.articles.length === 0) notFound();

  const firstArticle = getProjectArticle(project, group.articles[0].slug);
  if (!firstArticle) notFound();

  return (
    <article>
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 transition-colors duration-300 mb-10"
      >
        <span className="text-white/20">←</span>
        返回项目列表
      </Link>

      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white/90 leading-tight">
          {firstArticle.title}
        </h1>
        {firstArticle.tags && (
          <p className="mt-2 text-xs text-white/25 font-mono tracking-wide">
            {firstArticle.tags}
          </p>
        )}
        {firstArticle.summary && (
          <p className="mt-4 text-base text-white/40 leading-relaxed max-w-2xl">
            {firstArticle.summary}
          </p>
        )}
      </header>

      <div className="border-t border-white/[0.05] mb-12" />

      <div className="prose-custom">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {firstArticle.content}
        </ReactMarkdown>
      </div>

      <div className="border-t border-white/[0.05] mt-16 mb-8" />

      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 transition-colors duration-300"
      >
        <span className="text-white/20">←</span>
        返回项目列表
      </Link>
    </article>
  );
}
