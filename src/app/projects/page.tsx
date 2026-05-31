import Link from "next/link";
import { getAllProjects } from "@/lib/projects";
import PageShell from "@/components/PageShell";
import ProjectsAtmosphere from "@/components/atmosphere/ProjectsAtmosphere";

export const dynamic = "force-dynamic";

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <ProjectsAtmosphere>
      <PageShell title="项目" titleEn="Projects">
        {projects.length === 0 ? (
          <p className="text-white/35 text-sm">
            暂无项目。在{" "}
            <code className="text-white/50 font-mono text-xs bg-white/[0.04] px-1.5 py-0.5 rounded">
              content/projects/
            </code>{" "}
            中添加 Markdown 文件即可。
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((project) => (
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="group block border border-white/[0.06] rounded-xl p-6 hover:border-white/[0.14] hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(139,92,246,0.04)] transition-all duration-300"
              >
                <h3 className="text-white/80 font-semibold text-sm group-hover:text-white/95 transition-colors duration-300">
                  {project.title}
                </h3>
                {project.tags && (
                  <p className="mt-1 text-[11px] text-white/25 font-mono tracking-wide">
                    {project.tags}
                  </p>
                )}
                {project.summary && (
                  <p className="mt-3 text-white/42 text-sm leading-relaxed">
                    {project.summary}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </PageShell>
    </ProjectsAtmosphere>
  );
}
