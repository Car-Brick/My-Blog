import { notFound } from "next/navigation";
import { getProjectGroup } from "@/lib/projects";
import ProjectSidebar from "@/components/ProjectSidebar";

interface Props {
  params: Promise<{ project: string }>;
  children: React.ReactNode;
}

export default async function ProjectLayout({ params, children }: Props) {
  const { project: raw } = await params;
  const project = decodeURIComponent(raw);
  const group = getProjectGroup(project);

  if (!group) notFound();

  return (
    <main className="min-h-screen pt-20 pb-32">
      <div className="max-w-7xl mx-auto pl-4 pr-6 flex gap-0">
        <ProjectSidebar
          projectSlug={group.slug}
          projectTitle={group.title}
          articles={group.articles}
        />
        <div className="flex-1 min-w-0 pl-8">{children}</div>
      </div>
    </main>
  );
}
