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

function toUrlSlug(relativePath: string): string {
  return relativePath
    .replace(/\\/g, "/")
    .split("/")
    .map(segmentToSlug)
    .filter(Boolean)
    .join("--");
}

function findMdFiles(
  dir: string,
  base: string = "",
): { relativePath: string; fullPath: string }[] {
  const results: { relativePath: string; fullPath: string }[] = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...findMdFiles(fullPath, relativePath));
    } else if (entry.name.endsWith(".md")) {
      results.push({ relativePath, fullPath });
    }
  }
  return results;
}

function buildSlugMap(): Map<string, string> {
  if (!fs.existsSync(projectsDirectory)) return new Map();
  const map = new Map<string, string>();
  for (const { relativePath } of findMdFiles(projectsDirectory)) {
    const slug = toUrlSlug(relativePath);
    if (slug) map.set(slug, relativePath);
  }
  return map;
}

export function getAllProjects(): ProjectMeta[] {
  if (!fs.existsSync(projectsDirectory)) return [];

  return findMdFiles(projectsDirectory).map(({ relativePath, fullPath }) => {
    const slug = toUrlSlug(relativePath);
    const raw = fs.readFileSync(fullPath, "utf-8");
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
  const relativePath = slugMap.get(slug);
  if (!relativePath) return null;
  const filePath = path.join(projectsDirectory, relativePath);
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
