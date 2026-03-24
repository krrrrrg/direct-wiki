'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'

export const CATEGORY_ICONS = {
  terminal: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M2 10H22" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M6 15H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M14 15H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  closing: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary">
      <path d="M12 2V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M12 18V22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M2 12H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M18 12H22" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  setup: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
  update: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 3v5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 16h5v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  display: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M8 21h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  signature: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  ),
  payment: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary">
      <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M1 10H23" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M5 15H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M13 15H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  hakacare: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  ),
  registration: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M9 15h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M9 11h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  inquiry: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
}

export const INFO_ICONS = {
  store: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary">
      <path d="M3 9L12 3L21 9V21H3V9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M9 21V15H15V21" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  ),
  staff: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary">
      <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M20 20C20 17.0544 16.4183 14.6667 12 14.6667C7.58172 14.6667 4 17.0544 4 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
}

export function Header({ title, showBack = false }) {
  return (
    <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b px-5 py-3.5">
      <div className="max-w-[480px] mx-auto flex items-center gap-3">
        {showBack ? (
          <Link
            href="/"
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        ) : (
          <img src="/images/logo.png" alt="HAKA" className="shrink-0 w-7 h-7" />
        )}
        <h1 className="text-[17px] font-bold tracking-tight truncate">{title}</h1>
      </div>
    </div>
  )
}

export function GuideItem({ cat, guide, viewCount = 0, href }) {
  const content = (
    <Card className="cursor-pointer border-border/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 rounded-2xl">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10">
          {CATEGORY_ICONS[cat.id] || cat.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-bold text-[14px] tracking-tight truncate">{guide.title}</p>
            {viewCount > 0 && (
              <span className="shrink-0 flex items-center gap-0.5 text-[11px] text-muted-foreground">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-muted-foreground/60">
                  <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {viewCount}
              </span>
            )}
          </div>
          <p className="text-[12px] text-muted-foreground truncate">{guide.symptom}</p>
          {guide.shortcut && (
            <span className="inline-block mt-1.5 border border-primary/30 text-primary text-[11px] font-bold rounded-full px-2.5 py-0.5">
              {guide.shortcut}
            </span>
          )}
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-muted-foreground/50">
          <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href} className="block">{content}</Link>
  }
  return content
}

export function Footer() {
  return (
    <div className="text-center pb-10 px-5">
      <span className="inline-block bg-primary text-white text-[13px] font-bold rounded-full px-6 py-2.5 shadow-sm">
        해결이 안 되면 본사 경영지원팀에 연락
      </span>
      <p className="text-[12px] text-muted-foreground mt-3">하카코리아 경영지원팀</p>
    </div>
  )
}
