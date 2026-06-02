# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint
```

No test suite is configured.

## Architecture

**Next.js 15 App Router + TypeScript + Tailwind CSS v4 + Framer Motion**

All content is stored as Markdown files with YAML frontmatter in `content/` (blog, projects, interview, about). Parsed at request time via `gray-matter` in `src/lib/`. No database, no API routes, no auth.

### Page structure

| Route | File | Render |
|---|---|---|
| `/` | `page.tsx` | Static — `<Hero />` |
| `/about` | `about/page.tsx` | `force-dynamic` |
| `/blog` | `blog/page.tsx` | `force-dynamic` |
| `/blog/[slug]` | `blog/[slug]/page.tsx` | `generateStaticParams` (SSG) |
| `/projects` | `projects/page.tsx` | `force-dynamic` |
| `/projects/[project]` | `projects/[project]/page.tsx` | `generateStaticParams` (first article) |
| `/projects/[project]/[article]` | `projects/[project]/[article]/page.tsx` | `generateStaticParams` |
| `/interview` | `interview/page.tsx` | `force-dynamic` |
| `/interview/[slug]` | `interview/[slug]/page.tsx` | `generateStaticParams` |

List pages use `force-dynamic` so they re-read the `content/` directory on every request. Detail pages are SSG via `generateStaticParams()`.

`layout.tsx` renders `<Navbar />` above all pages. `template.tsx` adds a Framer Motion fade-up page transition on every navigation.

### Content system

4 library files in `src/lib/` parse `content/`:
- **posts.ts** — `getAllPosts()`, `getPostBySlug(slug)`. Uses `normalizeDate()` to handle YAML Date objects (from unquoted dates like `date: 2026-04-20`). Frontmatter: title, date, summary.
- **projects.ts** — `getProjectGroups()`, `getProjectGroup(slug)`, `getProjectArticle(projectSlug, articleSlug)`, `getAllProjectArticleParams()`. **Folder = project**, `.md` files inside = articles. Flat `.md` files at root = single-article projects. Frontmatter: title, tags, summary.
- **interviews.ts** — `getAllInterviews()`, `getInterviewBySlug(slug)` (frontmatter: company, role, date, outcome)
- **about.ts** — reads first `.md` from `content/about/` (frontmatter: title, titleEn)

Detail pages render content with `react-markdown` + `remark-gfm` + `rehype-highlight`, styled via `.prose-custom` CSS class.

### Atmosphere system

Each page wraps its content in a dedicated atmosphere component (`src/components/atmosphere/`):

| Page | Atmosphere | Visuals |
|---|---|---|
| Hero | built into `Hero.tsx` | 12 layers: gradient bg, aurora, dot grid, scan lines, glows, particles (Canvas), vignette, grain |
| About | `AboutAtmosphere` | AuroraBackground + MouseGlow + ScrollReveal |
| Projects | `ProjectsAtmosphere` | TechGrid + ScanLine + MouseGlow |
| Blog | `BlogAtmosphere` | NoiseOverlay + MouseGlow |
| Interview | `InterviewAtmosphere` | TechGrid + TerminalDecoration + MouseGlow |

Atmosphere primitives are composable client components. Hero's `ParticleBackground` is a separate Canvas-based system with near/far depth layers and mouse-reactive connection glow.

### Key components

- **PageShell** — server component, wraps page content with `pt-20 pb-32`, title header with bilingual support (`title` + optional `titleEn`)
- **Navbar** — fixed glass-morphism nav, height 80px, active route dot via Framer Motion `layoutId`, mobile hamburger menu. Logo absolutely positioned at left edge, "车 专" text to right of image. Auto-hide on scroll down (past 80px), auto-show on scroll up.
- **ProjectSidebar** — client component, collapsible sidebar (240px → 40px), article list with active highlight, sticky `top-20`. Uses `usePathname()` to detect current article.
- **Hero** — left-right split layout: left side has subtitle, typewriter (`$` prompt), buttons; right side has "车专" in diagonal (车 top-right, 专 bottom-left) using Zhi Mang Xing calligraphy font
- **MouseGlow** — 400x400px radial gradient tracking mouse via `useMouseGlow` hook (lerp-based smoothing, RAF loop)

### Design tokens

- Background: `#08080d` (deep dark blue-black)
- Accent blue: `rgba(140, 165, 255, ...)` / `rgba(99, 102, 241, ...)`
- Page transition easing: `[0.25, 0.46, 0.45, 0.94]`, 450ms, fade-up 12px
- Container: `max-w-5xl mx-auto px-6` (PageShell), Hero uses `max-w-[75%] 2xl:max-w-[66%]`
- Chinese body font: Noto Sans SC (Google Fonts CDN)
- Calligraphy display font: Zhi Mang Xing (Google Fonts CDN)
- Code font: Geist Mono (next/font/google)
- Shell environment is broken — run `npm install && npm run dev` manually
- **Chinese URL params**: Next.js on Windows may not decode Chinese characters in dynamic route params. Use `decodeURIComponent()` in `[project]` and `[article]` pages.
- **Navbar height**: All pages use `pt-20` (80px) to offset the navbar. Sidebar uses `top-20` for sticky positioning.
