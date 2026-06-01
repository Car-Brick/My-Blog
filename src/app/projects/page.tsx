import Link from "next/link";
import { getProjectGroups } from "@/lib/projects";
import PageShell from "@/components/PageShell";
import ProjectsAtmosphere from "@/components/atmosphere/ProjectsAtmosphere";

export const dynamic = "force-dynamic";

export default function ProjectsPage() {
  const groups = getProjectGroups();

  return (
    <ProjectsAtmosphere>
      <PageShell title="项目" titleEn="Projects">
        {groups.length === 0 ? (
          <p className="text-white/35 text-sm">
            暂无项目。在{" "}
            <code className="text-white/50 font-mono text-xs bg-white/[0.04] px-1.5 py-0.5 rounded">
              content/projects/
            </code>{" "}
            中添加 Markdown 文件或子文件夹即可。
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {groups.map((group) => (
              <Link
                key={group.slug}
                href={`/projects/${group.slug}`}
                className="group block border border-white/[0.06] rounded-xl p-6 hover:border-white/[0.14] hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(139,92,246,0.04)] transition-all duration-300"
              >
                <h3 className="text-white/80 font-semibold text-sm group-hover:text-white/95 transition-colors duration-300">
                  {group.title}
                </h3>
                {group.tags && (
                  <p className="mt-1 text-[11px] text-white/25 font-mono tracking-wide">
                    {group.tags}
                  </p>
                )}
                {group.summary && (
                  <p className="mt-3 text-white/42 text-sm leading-relaxed">
                    {group.summary}
                  </p>
                )}
                <p className="mt-3 text-[11px] text-white/20">
                  {group.articleCount} 篇文章
                </p>
              </Link>
            ))}
          </div>
        )}
      </PageShell>
    </ProjectsAtmosphere>
  );
}
