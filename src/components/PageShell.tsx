import type { ReactNode } from "react";

interface PageShellProps {
  title: string;
  titleEn?: string;
  subtitle?: string;
  children: ReactNode;
}

export default function PageShell({
  title,
  titleEn,
  subtitle,
  children,
}: PageShellProps) {
  return (
    <main className="min-h-screen pt-28 pb-32">
      <div className="max-w-5xl mx-auto px-6">
        {/* Page header — bilingual title */}
        <header className="mb-20">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white/90">
            {title}
            {titleEn && (
              <span className="text-white/25 font-light ml-3">
                / {titleEn}
              </span>
            )}
          </h1>
          {subtitle && (
            <p className="mt-5 text-base md:text-lg text-white/40 font-light tracking-wide max-w-xl">
              {subtitle}
            </p>
          )}
        </header>

        {/* Page content */}
        {children}
      </div>
    </main>
  );
}
