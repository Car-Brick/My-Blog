import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { getPostBySlug, getAllPosts } from "@/lib/posts";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} — Blog`,
    description: post.summary,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return (
    <main className="min-h-screen pt-28 pb-32">
      <article className="max-w-3xl mx-auto px-6">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 transition-colors duration-300 mb-10"
        >
          <span className="text-white/20">←</span>
          返回博客
        </Link>

        {/* Header */}
        <header className="mb-12">
          <time className="text-xs text-white/25 font-mono tracking-wide">
            {post.date}
          </time>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-white/90 leading-tight">
            {post.title}
          </h1>
          {post.summary && (
            <p className="mt-4 text-base text-white/40 leading-relaxed max-w-2xl">
              {post.summary}
            </p>
          )}
        </header>

        {/* Divider */}
        <div className="border-t border-white/[0.05] mb-12" />

        {/* Markdown content */}
        <div className="prose-custom">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Bottom divider */}
        <div className="border-t border-white/[0.05] mt-16 mb-8" />

        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs text-white/35 hover:text-white/60 transition-colors duration-300"
        >
          <span className="text-white/20">←</span>
          返回博客列表
        </Link>
      </article>
    </main>
  );
}
