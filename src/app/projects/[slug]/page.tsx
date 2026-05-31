import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getProjectBySlug, getAllProjects } from "@/lib/projects";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Not Found" };
  return {
    title: `${project.title} — Projects`,
    description: project.summary,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  return (
    <main className="min-h-screen pt-28 pb-32">
      <article className="max-w-3xl mx-auto px-6">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 transition-colors duration-300 mb-10"
        >
          <span className="text-white/20">←</span>
          返回项目列表
        </Link>

        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white/90 leading-tight">
            {project.title}
          </h1>
          {project.tags && (
            <p className="mt-2 text-xs text-white/25 font-mono tracking-wide">
              {project.tags}
            </p>
          )}
          {project.summary && (
            <p className="mt-4 text-base text-white/40 leading-relaxed max-w-2xl">
              {project.summary}
            </p>
          )}
        </header>

        <div className="border-t border-white/[0.05] mb-12" />

        <div className="prose-custom">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {project.content}
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
    </main>
  );
}
