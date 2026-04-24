'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '../../components/shared'

export default function SizeSurveyIndexPage() {
  const [stores, setStores] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ done: 0, total: 0 })

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: storeList }, { data: surveys }, { data: subs }] = await Promise.all([
      supabase.from('stores').select('id, name, region, code').order('region').order('name'),
      supabase.from('signage_surveys').select('id, store_id, submitted_at'),
      supabase.from('signage_submissions').select('survey_id, status'),
    ])

    const surveyByStore = new Map()
    for (const s of surveys || []) surveyByStore.set(s.store_id, s)

    const countsBySurvey = new Map()
    for (const s of subs || []) {
      if (!countsBySurvey.has(s.survey_id)) countsBySurvey.set(s.survey_id, { match: 0, modified: 0, removed: 0, added: 0 })
      const c = countsBySurvey.get(s.survey_id)
      c[s.status] = (c[s.status] || 0) + 1
    }

    const rows = (storeList || [])
      .map(s => {
        const sv = surveyByStore.get(s.id)
        if (!sv) return null
        const c = countsBySurvey.get(sv.id) || { match: 0, modified: 0, removed: 0, added: 0 }
        const changeCount = (c.modified || 0) + (c.removed || 0) + (c.added || 0)
        return {
          ...s,
          surveyId: sv.id,
          submittedAt: sv.submitted_at,
          counts: c,
          changeCount,
        }
      })
      .filter(Boolean)

    const done = rows.filter(r => r.submittedAt).length
    setStats({ done, total: rows.length })
    setStores(rows)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const q = search.trim().toLowerCase()
  const filtered = q
    ? stores.filter(s =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.code || '').toLowerCase().includes(q) ||
        (s.region || '').toLowerCase().includes(q)
      )
    : stores

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="사이즈 설문" />

      <div className="max-w-[480px] mx-auto px-5 pt-6">
        <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4 mb-5">
          <p className="text-[11px] font-bold text-primary mb-1.5">📢 광고판 시공 전 실측 설문</p>
          <p className="text-sm font-bold leading-relaxed text-foreground mb-2">
            사이드광고 시안 변경 작업을 위한 <span className="text-primary">실측 확인</span>입니다.
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            매장 검색 → 매장 선택 → 광고판 하나씩 확인.<br />
            시공업자에게 이 치수로 넘길 예정이라 정확한 입력 부탁드립니다.
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-extrabold tracking-tight mb-1.5">우리 매장 찾기</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            매장명 또는 지역을 검색해 설문을 시작해주세요.
          </p>
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">
              전체 {stats.total}개 매장
            </p>
            <p className="text-xs font-bold text-primary">{stats.done} / {stats.total} 제출</p>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: stats.total ? `${(stats.done / stats.total) * 100}%` : '0%' }} />
          </div>
        </div>

        <div className="relative mb-4">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="매장명 (예: 강남, 해운대)"
            className="pl-10 bg-card h-12 text-base rounded-2xl"
            autoFocus
          />
        </div>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground text-sm">불러오는 중…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            {q ? '일치하는 매장이 없어요' : '등록된 매장이 없습니다'}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(s => (
              <Link key={s.id} href={`/size-survey/${s.surveyId}`} className="block">
                <Card className="cursor-pointer border-border/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 rounded-2xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary">
                        <path d="M3 9L12 3L21 9V21H3V9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                        <path d="M9 21V15H15V21" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm tracking-tight truncate">{s.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {s.region || ''}{s.code ? ` · ${s.code}` : ''}
                      </p>
                    </div>
                    {s.submittedAt ? (
                      s.changeCount > 0 ? (
                        <div className="shrink-0 flex flex-col items-end gap-1">
                          <span className="text-[11px] font-bold text-white bg-primary px-2.5 py-1 rounded-full">
                            변경 {s.changeCount}건
                          </span>
                          <div className="flex gap-1 text-[10px] font-bold">
                            {s.counts.modified > 0 && <span className="text-primary">수정 {s.counts.modified}</span>}
                            {s.counts.removed > 0 && <span className="text-destructive">없음 {s.counts.removed}</span>}
                            {s.counts.added > 0 && <span className="text-primary">추가 {s.counts.added}</span>}
                          </div>
                        </div>
                      ) : (
                        <span className="shrink-0 text-[11px] font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                          제출완료
                        </span>
                      )
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-muted-foreground/50">
                        <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
