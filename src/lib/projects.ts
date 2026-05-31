import fs from "fs";
import path from "path";
import matter from "gray-matter";

const projectsDirectory = path.join(process.cwd(), "content/projects");

export interface ProjectMeta {
  slug: string;
  title: string;
  tags: string;
  summary: string;
}

export interface Project extends ProjectMeta {
  content: string;
}

interface Frontmatter {
  title?: string;
  tags?: string;
  summary?: string;
}

function toUrlSlug(filename: string): string {
  return filename
    .replace(/\.md$/, "")
    .replace(/[\u3000-\u303f\uff00-\uffef]/g, "-")
    .replace(/[\u4e00-\u9fff]+/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildSlugMap(): Map<string, string> {
  if (!fs.existsSync(projectsDirectory)) return new Map();
  const map = new Map<string, string>();
  for (const f of fs.readdirSync(projectsDirectory)) {
    if (f.endsWith(".md")) map.set(toUrlSlug(f), f);
  }
  return map;
}

export function getAllProjects(): ProjectMeta[] {
  if (!fs.existsSync(projectsDirectory)) return [];

  const filenames = fs.readdirSync(projectsDirectory);

  return filenames
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const slug = toUrlSlug(filename);
      const raw = fs.readFileSync(
        path.join(projectsDirectory, filename),
        "utf-8",
      );
      const { data } = matter(raw);
      const fm = data as Frontmatter;

      return {
        slug,
        title: fm.title ?? slug,
        tags: fm.tags ?? "",
        summary: fm.summary ?? "",
      };
    });
}

export function getProjectBySlug(slug: string): Project | null {
  const slugMap = buildSlugMap();
  const filename = slugMap.get(slug);
  if (!filename) return null;
  const filePath = path.join(projectsDirectory, filename);
  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const fm = data as Frontmatter;

    return {
      slug,
      title: fm.title ?? slug,
      tags: fm.tags ?? "",
      summary: fm.summary ?? "",
      content,
    };
  } catch {
    return null;
  }
}
