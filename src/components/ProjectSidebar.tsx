"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ProjectArticleMeta } from "@/lib/projects";

interface Props {
  projectSlug: string;
  projectTitle: string;
  articles: ProjectArticleMeta[];
}

export default function ProjectSidebar({
  projectSlug,
  projectTitle,
  articles,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  // segments: ["projects", "project-slug"] or ["projects", "project-slug", "article-slug"]
  const currentArticleSlug =
    segments.length > 2 ? segments[2] : articles[0]?.slug;

  return (
    <aside
      className={`sticky top-20 shrink-0 transition-all duration-300 border-r border-white/[0.06] bg-[#08080d]/80 backdrop-blur-sm self-start ${
        collapsed ? "w-10" : "w-64"
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`flex items-center gap-2 w-full text-xs text-white/30 hover:text-white/60 transition-colors duration-200 ${
          collapsed ? "justify-center py-4 px-0" : "justify-between py-4 px-4"
        }`}
      >
        {collapsed ? (
          <span>▶</span>
        ) : (
          <>
            <span className="truncate text-white/50 font-medium text-[11px] tracking-wide">
              {projectTitle}
            </span>
            <span>◀</span>
          </>
        )}
      </button>

      {/* Article list */}
      {!collapsed && (
        <nav className="px-3 pb-6">
          {articles.map((article) => {
            const isFirst = articles.length > 0 && article.slug === articles[0].slug;
            const href = isFirst
              ? `/projects/${projectSlug}`
              : `/projects/${projectSlug}/${article.slug}`;

            return (
              <Link
                key={article.slug}
                href={href}
                className={`block px-3 py-2 rounded-md text-sm transition-all duration-200 truncate ${
                  article.slug === currentArticleSlug
                    ? "text-white/90 bg-white/[0.06] font-medium"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                }`}
              >
                {article.title}
              </Link>
            );
          })}
        </nav>
      )}
    </aside>
  );
}
