import fs from "fs";
import path from "path";
import matter from "gray-matter";

const projectsDirectory = path.join(process.cwd(), "content/projects");

// ── Types ──────────────────────────────────────────────

export interface ProjectGroupMeta {
  slug: string;
  title: string;
  tags: string;
  summary: string;
  articleCount: number;
}

export interface ProjectArticleMeta {
  slug: string;
  title: string;
  summary: string;
}

export interface ProjectGroup extends ProjectGroupMeta {
  articles: ProjectArticleMeta[];
}

export interface ProjectArticle extends ProjectArticleMeta {
  tags: string;
  content: string;
}

interface Frontmatter {
  title?: string;
  tags?: string;
  summary?: string;
}

interface ArticleEntry {
  slug: string;
  filePath: string;
}

interface ProjectEntry {
  slug: string;
  title: string;
  tags: string;
  summary: string;
  articles: ArticleEntry[];
}

// ── Slug helper ───────────────────────────────────────

function segmentToSlug(segment: string): string {
  return segment
    .replace(/\.md$/, "")
    .replace(/[\u3000-\u303f\uff00-\uffef]/g, "-")
    .replace(/[^a-zA-Z0-9\u4e00-\u9fff\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Internal: build project map ───────────────────────

function buildProjectMap(): Map<string, ProjectEntry> {
  const map = new Map<string, ProjectEntry>();
  if (!fs.existsSync(projectsDirectory)) return map;

  for (const entry of fs.readdirSync(projectsDirectory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;

    if (entry.isDirectory()) {
      const projectSlug = segmentToSlug(entry.name);
      const articles: ArticleEntry[] = [];
      const dirPath = path.join(projectsDirectory, entry.name);

      if (fs.existsSync(dirPath)) {
        for (const f of fs.readdirSync(dirPath)) {
          if (f.endsWith(".md")) {
            articles.push({
              slug: segmentToSlug(f),
              filePath: path.join(dirPath, f),
            });
          }
        }
      }

      let title = entry.name;
      let tags = "";
      let summary = "";
      if (articles.length > 0) {
        try {
          const raw = fs.readFileSync(articles[0].filePath, "utf-8");
          const { data } = matter(raw);
          const fm = data as Frontmatter;
          tags = fm.tags ?? "";
          summary = fm.summary ?? "";
        } catch { /* keep defaults */ }
      }

      map.set(projectSlug, { slug: projectSlug, title, tags, summary, articles });
    } else if (entry.name.endsWith(".md")) {
      const projectSlug = segmentToSlug(entry.name);
      const filePath = path.join(projectsDirectory, entry.name);

      let title = projectSlug;
      let tags = "";
      let summary = "";
      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const { data } = matter(raw);
        const fm = data as Frontmatter;
        title = fm.title ?? projectSlug;
        tags = fm.tags ?? "";
        summary = fm.summary ?? "";
      } catch { /* keep defaults */ }

      map.set(projectSlug, {
        slug: projectSlug,
        title,
        tags,
        summary,
        articles: [{ slug: projectSlug, filePath }],
      });
    }
  }

  return map;
}

// ── Public API ─────────────────────────────────────────

export function getProjectGroups(): ProjectGroupMeta[] {
  const map = buildProjectMap();
  return Array.from(map.values()).map((p) => ({
    slug: p.slug,
    title: p.title,
    tags: p.tags,
    summary: p.summary,
    articleCount: p.articles.length,
  }));
}

export function getProjectGroup(slug: string): ProjectGroup | null {
  const map = buildProjectMap();
  const entry = map.get(slug);
  if (!entry) return null;

  const articles: ProjectArticleMeta[] = entry.articles.map((a) => {
    let title = a.slug;
    let summary = "";
    try {
      const raw = fs.readFileSync(a.filePath, "utf-8");
      const { data } = matter(raw);
      const fm = data as Frontmatter;
      title = fm.title ?? a.slug;
      summary = fm.summary ?? "";
    } catch { /* keep defaults */ }
    return { slug: a.slug, title, summary };
  });

  return {
    slug: entry.slug,
    title: entry.title,
    tags: entry.tags,
    summary: entry.summary,
    articleCount: articles.length,
    articles,
  };
}

export function getProjectArticle(
  projectSlug: string,
  articleSlug: string,
): ProjectArticle | null {
  const map = buildProjectMap();
  const entry = map.get(projectSlug);
  if (!entry) return null;

  const article = entry.articles.find((a) => a.slug === articleSlug);
  if (!article) return null;

  try {
    const raw = fs.readFileSync(article.filePath, "utf-8");
    const { data, content } = matter(raw);
    const fm = data as Frontmatter;
    return {
      slug: article.slug,
      title: fm.title ?? article.slug,
      summary: fm.summary ?? "",
      tags: fm.tags ?? "",
      content,
    };
  } catch {
    return null;
  }
}

export function getAllProjectArticleParams(): { project: string; article: string }[] {
  const map = buildProjectMap();
  const params: { project: string; article: string }[] = [];
  for (const [projectSlug, entry] of map) {
    for (const article of entry.articles) {
      params.push({ project: projectSlug, article: article.slug });
    }
  }
  return params;
}
