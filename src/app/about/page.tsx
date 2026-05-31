import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAbout } from "@/lib/about";
import PageShell from "@/components/PageShell";
import AboutAtmosphere from "@/components/atmosphere/AboutAtmosphere";

export const dynamic = "force-dynamic";

export default function AboutPage() {
  const data = getAbout();

  return (
    <AboutAtmosphere>
      <PageShell title={data?.title ?? "关于"} titleEn={data?.titleEn ?? "About"}>
        {!data ? (
          <p className="text-white/35 text-sm">
            暂无内容。在{" "}
            <code className="text-white/50 font-mono text-xs bg-white/[0.04] px-1.5 py-0.5 rounded">
              content/about/
            </code>{" "}
            中添加 Markdown 文件即可。
          </p>
        ) : (
          <div className="prose-custom max-w-2xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {data.content}
            </ReactMarkdown>
          </div>
        )}
      </PageShell>
    </AboutAtmosphere>
  );
}
