import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/blog");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  summary: string;
}

export interface Post extends PostMeta {
  content: string;
}

interface Frontmatter {
  title?: string;
  date?: string;
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
  if (!fs.existsSync(postsDirectory)) return new Map();
  const map = new Map<string, string>();
  for (const f of fs.readdirSync(postsDirectory)) {
    if (f.endsWith(".md")) map.set(toUrlSlug(f), f);
  }
  return map;
}

/** Return all posts sorted by date descending (metadata only, no content). */
export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(postsDirectory)) return [];

  const filenames = fs.readdirSync(postsDirectory);

  return filenames
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const slug = toUrlSlug(filename);
      const filePath = path.join(postsDirectory, filename);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(raw);
      const fm = data as Frontmatter;

      return {
        slug,
        title: fm.title ?? slug,
        date: fm.date ?? "",
        summary: fm.summary ?? "",
      };
    })
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date > b.date ? -1 : 1;
    });
}

/** Return a single post with full content, or null if not found. */
export function getPostBySlug(slug: string): Post | null {
  const slugMap = buildSlugMap();
  const filename = slugMap.get(slug);
  if (!filename) return null;
  const filePath = path.join(postsDirectory, filename);

  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const fm = data as Frontmatter;

    return {
      slug,
      title: fm.title ?? slug,
      date: fm.date ?? "",
      summary: fm.summary ?? "",
      content,
    };
  } catch {
    return null;
  }
}
