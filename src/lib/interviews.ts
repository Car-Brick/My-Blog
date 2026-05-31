import fs from "fs";
import path from "path";
import matter from "gray-matter";

const interviewsDirectory = path.join(process.cwd(), "content/interview");

export interface InterviewMeta {
  slug: string;
  company: string;
  role: string;
  date: string;
  outcome: string;
}

export interface Interview extends InterviewMeta {
  content: string;
}

interface Frontmatter {
  company?: string;
  role?: string;
  date?: string;
  outcome?: string;
}

/** Convert a filename to a URL-safe slug (ASCII-only, no spaces). */
function toUrlSlug(filename: string): string {
  return filename
    .replace(/\.md$/, "")
    .replace(/[\u3000-\u303f\uff00-\uffef]/g, "-") // CJK punctuation → hyphen
    .replace(/[\u4e00-\u9fff]+/g, "")               // remove Chinese characters
    .replace(/[^a-zA-Z0-9\s-]/g, "")               // remove remaining special chars
    .trim()
    .replace(/\s+/g, "-")                           // spaces → hyphens
    .replace(/-+/g, "-")                            // collapse hyphens
    .replace(/^-|-$/g, "");                         // trim leading/trailing
}

/** Build a lookup from URL-safe slug → filesystem filename. */
function buildSlugMap(): Map<string, string> {
  if (!fs.existsSync(interviewsDirectory)) return new Map();
  const map = new Map<string, string>();
  for (const f of fs.readdirSync(interviewsDirectory)) {
    if (f.endsWith(".md")) map.set(toUrlSlug(f), f);
  }
  return map;
}

export function getAllInterviews(): InterviewMeta[] {
  if (!fs.existsSync(interviewsDirectory)) return [];

  const filenames = fs.readdirSync(interviewsDirectory);

  return filenames
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const slug = toUrlSlug(filename);
      const raw = fs.readFileSync(
        path.join(interviewsDirectory, filename),
        "utf-8",
      );
      const { data } = matter(raw);
      const fm = data as Frontmatter;

      return {
        slug,
        company: fm.company ?? slug,
        role: fm.role ?? "",
        date: fm.date ?? "",
        outcome: fm.outcome ?? "",
      };
    })
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return a.date > b.date ? -1 : 1;
    });
}

export function getInterviewBySlug(slug: string): Interview | null {
  const slugMap = buildSlugMap();
  const filename = slugMap.get(slug);
  if (!filename) return null;
  const filePath = path.join(interviewsDirectory, filename);
  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const fm = data as Frontmatter;

    return {
      slug,
      company: fm.company ?? slug,
      role: fm.role ?? "",
      date: fm.date ?? "",
      outcome: fm.outcome ?? "",
      content,
    };
  } catch {
    return null;
  }
}
