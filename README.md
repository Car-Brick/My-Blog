# 车 专 — Personal Blog

个人技术博客，深色科技风，Vercel / Linear / Apple 风格。

## Tech Stack

| 类别 | 技术 |
|------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS v4 |
| Animation | Framer Motion |
| Content | Markdown + gray-matter + react-markdown |
| Fonts | Geist (Latin) + Noto Sans SC (CJK) |

## Getting Started

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`。

## Project Structure

```
content/blog/                          # Markdown 文章目录
├── building-reliable-distributed-systems.md
├── ai-infrastructure-future.md
└── rethinking-backend-architecture.md

src/
├── app/
│   ├── layout.tsx                     # 根布局：字体、metadata、Navbar
│   ├── template.tsx                   # 页面切换动画 (fade-up)
│   ├── page.tsx                       # 首页 → Hero
│   ├── globals.css                    # 全局样式 + 暗色排版
│   ├── about/page.tsx                 # 关于
│   ├── projects/page.tsx              # 项目
│   ├── blog/
│   │   ├── page.tsx                   # 博客列表（自动读取 content/blog/）
│   │   └── [slug]/page.tsx            # 文章详情（Markdown 渲染）
│   └── interview/page.tsx             # 面试经历
│
├── components/
│   ├── Hero/
│   │   ├── Hero.tsx                   # 首页 10 层视觉效果
│   │   ├── ParticleBackground.tsx     # Canvas 粒子背景
│   │   ├── TypewriterText.tsx         # 打字机效果
│   │   └── HeroButton.tsx             # Apple 风格按钮
│   ├── Navbar/
│   │   └── Navbar.tsx                 # 毛玻璃导航栏
│   └── PageShell.tsx                  # 页面统一布局（容器/标题/间距）
│
└── lib/
    └── posts.ts                       # Markdown 读取与解析工具
```

## Routes

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | Hero | 首页，10 层视觉特效 |
| `/about` | 关于 | 个人简介 + 技能标签 |
| `/projects` | 项目 | 项目卡片网格 |
| `/blog` | 博客 | 文章列表，自动读取 `content/blog/*.md` |
| `/blog/[slug]` | 文章详情 | Markdown 渲染 + 代码高亮 |
| `/interview` | 面试经历 | 面试时间线 |

## How to Add a Blog Post

在 `content/blog/` 下创建 `my-slug.md`：

```md
---
title: "文章标题"
date: "2026-05-26"
summary: "文章摘要，会显示在博客列表页。"
---

## 正文标题

正文内容，支持 Markdown + GFM（表格、删除线等）。

​```go
func main() {
    fmt.Println("hello")
}
​```
```

刷新页面即可看到新文章，无需重启或重新构建。

## Design Principles

- **No cheap effects** — 无霓虹、无赛博朋克、无过度发光
- **Dark theme** — `#08080d` 底色，全局统一
- **Glass morphism** — Navbar 毛玻璃，滚动增强 blur
- **GPU-composited** — 鼠标光晕使用 `transform: translate()` 避免布局抖动
- **Chinese-first** — 中文内容 + 英文技术标签，中英混排页面标题

## Commands

```bash
npm run dev      # 开发模式
npm run build    # 生产构建
npm run start    # 运行生产版本
npm run lint     # 代码检查
```
