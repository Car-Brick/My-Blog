"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import type { PostMeta } from "@/lib/posts";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

export default function BlogCardList({ posts }: { posts: PostMeta[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <motion.div
      className="space-y-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {posts.map((post, i) => (
        <motion.article
          key={post.slug}
          variants={itemVariants}
          onHoverStart={() => setHoveredIndex(i)}
          onHoverEnd={() => setHoveredIndex(null)}
          animate={{
            opacity:
              hoveredIndex === null
                ? 1
                : hoveredIndex === i
                  ? 1
                  : 0.3,
          }}
          transition={{ duration: 0.35 }}
        >
          <Link href={`/blog/${post.slug}`} className="group block">
            <time className="text-xs text-white/25 font-mono tracking-wide">
              {post.date}
            </time>
            <h3 className="mt-1.5 text-white/80 font-medium group-hover:text-white/95 transition-colors duration-300">
              {post.title}
            </h3>
            {post.summary && (
              <p className="mt-2 text-white/42 text-sm leading-relaxed max-w-2xl">
                {post.summary}
              </p>
            )}
          </Link>
        </motion.article>
      ))}
    </motion.div>
  );
}
