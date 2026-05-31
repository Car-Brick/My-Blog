import fs from "fs";
import path from "path";
import matter from "gray-matter";

const aboutDirectory = path.join(process.cwd(), "content/about");

export interface AboutData {
  title: string;
  titleEn: string;
  content: string;
}

interface Frontmatter {
  title?: string;
  titleEn?: string;
}

export function getAbout(): AboutData | null {
  if (!fs.existsSync(aboutDirectory)) return null;

  const filenames = fs.readdirSync(aboutDirectory).filter((f) => f.endsWith(".md"));
  if (filenames.length === 0) return null;

  const filePath = path.join(aboutDirectory, filenames[0]);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const fm = data as Frontmatter;

  return {
    title: fm.title ?? "关于",
    titleEn: fm.titleEn ?? "About",
    content,
  };
}
