import { getAllPosts } from "@/lib/posts";
import PageShell from "@/components/PageShell";
import BlogAtmosphere from "@/components/atmosphere/BlogAtmosphere";
import BlogCardList from "./BlogCardList";

export const dynamic = "force-dynamic";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <BlogAtmosphere>
      <PageShell title="博客" titleEn="Blog">
        {posts.length === 0 ? (
          <p className="text-white/35 text-sm">
            暂无文章。在 <code className="text-white/50 font-mono text-xs bg-white/[0.04] px-1.5 py-0.5 rounded">content/blog/</code> 中添加 Markdown 文件即可。
          </p>
        ) : (
          <BlogCardList posts={posts} />
        )}
      </PageShell>
    </BlogAtmosphere>
  );
}
