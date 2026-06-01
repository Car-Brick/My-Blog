import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getProjectArticle, getAllProjectArticleParams } from "@/lib/projects";

interface Props {
  params: Promise<{ project: string; article: string }>;
}

export async function generateStaticParams() {
  return getAllProjectArticleParams();
}

export async function generateMetadata({ params }: Props) {
  const { project: rawP, article: rawA } = await params;
  const project = decodeURIComponent(rawP);
  const article = decodeURIComponent(rawA);
  const data = getProjectArticle(project, article);
  if (!data) return { title: "Not Found" };
  return {
    title: `${data.title} — Projects`,
    description: data.summary,
  };
}

export default async function ProjectArticlePage({ params }: Props) {
  const { project: rawP, article: rawA } = await params;
  const project = decodeURIComponent(rawP);
  const article = decodeURIComponent(rawA);
  const data = getProjectArticle(project, article);

  if (!data) notFound();

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
          {data.title}
        </h1>
        {data.tags && (
          <p className="mt-2 text-xs text-white/25 font-mono tracking-wide">
            {data.tags}
          </p>
        )}
        {data.summary && (
          <p className="mt-4 text-base text-white/40 leading-relaxed max-w-2xl">
            {data.summary}
          </p>
        )}
      </header>

      <div className="border-t border-white/[0.05] mb-12" />

      <div className="prose-custom">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {data.content}
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
