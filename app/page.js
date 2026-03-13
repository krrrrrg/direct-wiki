'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { GUIDE_DATA } from '../lib/guideData'
import { supabase } from '../lib/supabase'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header, GuideItem, Footer, CATEGORY_ICONS, INFO_ICONS } from '../components/shared'

export default function Home() {
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState([])
  const [staffResults, setStaffResults] = useState([])
  const [storeResults, setStoreResults] = useState([])
  const [dbLoading, setDbLoading] = useState(false)
  const [storeNotes, setStoreNotes] = useState({})
  const [guideViews, setGuideViews] = useState({})
  const [notice, setNotice] = useState(null)

  // Fetch active notice
  useEffect(() => {
    async function fetchNotice() {
      const { data } = await supabase
        .from('notices')
        .select('id, title, guide_id')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (data) setNotice(data)
    }
    fetchNotice()
  }, [])

  // Fetch all guide view counts
  const fetchGuideViews = useCallback(async () => {
    const { data } = await supabase.from('guide_views').select('guide_id, view_count')
    if (data) {
      const map = {}
      for (const row of data) map[row.guide_id] = row.view_count
      setGuideViews(map)
    }
  }, [])

  useEffect(() => { fetchGuideViews() }, [fetchGuideViews])

  // 최근 검색어 로드
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('recentSearches') || '[]')
      setRecentSearches(saved)
    } catch { setRecentSearches([]) }
  }, [])

  function saveSearch(q) {
    const term = q.trim()
    if (!term) return
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 10)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  function removeSearch(term) {
    const updated = recentSearches.filter(s => s !== term)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  function clearAllSearches() {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  // Fetch latest notes for given store IDs
  const fetchStoreNotes = useCallback(async (storeIds) => {
    if (!storeIds.length) { setStoreNotes({}); return }
    const { data: checksData } = await supabase
      .from('checks')
      .select('store_id, note, project_id')
      .in('store_id', storeIds)
      .not('note', 'is', null)
      .order('checked_at', { ascending: false })
    if (!checksData?.length) { setStoreNotes({}); return }
    const projIds = [...new Set(checksData.map(c => c.project_id))]
    const { data: projData } = await supabase
      .from('projects')
      .select('id, title')
      .in('id', projIds)
    const projMap = new Map((projData || []).map(p => [p.id, p.title]))
    const notes = {}
    for (const c of checksData) {
      if (!notes[c.store_id]) {
        notes[c.store_id] = { note: c.note, project: projMap.get(c.project_id) || '' }
      }
    }
    setStoreNotes(notes)
  }, [])

  // DB search (stores + staff)
  const searchDB = useCallback(async (q) => {
    if (!q.trim()) { setStaffResults([]); setStoreResults([]); setStoreNotes({}); return }
    setDbLoading(true)
    const t = q.trim()
    const [staffRes, storeRes] = await Promise.all([
      supabase.from('login_info').select('*')
        .or(`name.ilike.%${t}%,employee_id.ilike.%${t}%`)
        .order('branch').limit(20),
      supabase.from('stores').select('*')
        .or(`name.ilike.%${t}%,code.ilike.%${t}%`)
        .order('region').limit(20),
    ])
    const staff = staffRes.data || []
    const stores = storeRes.data || []
    setStaffResults(staff)
    setStoreResults(stores)
    await fetchStoreNotes(stores.map(s => s.id))
    setDbLoading(false)

    // 검색 로그 저장 (2글자 이상)
    if (t.length >= 2) {
      const guideHits = GUIDE_DATA.categories.some(cat =>
        cat.guides.some(g => {
          const text = [g.title, g.symptom, g.shortcut || '', ...(g.keywords || []), ...g.steps.map(s => s.action + ' ' + s.detail)].join(' ').toLowerCase()
          return text.includes(t.toLowerCase())
        })
      )
      const hasResults = staff.length > 0 || stores.length > 0 || guideHits
      saveSearch(t)
      supabase.from('search_logs').insert({ query: t, has_results: hasResults }).then()
    }
  }, [fetchStoreNotes])

  useEffect(() => {
    const timer = setTimeout(() => searchDB(query), 300)
    return () => clearTimeout(timer)
  }, [query, searchDB])

  // Guide search (local)
  const guideResults = query.trim()
    ? GUIDE_DATA.categories.flatMap(cat =>
        cat.guides.filter(g => {
          const text = [g.title, g.symptom, g.shortcut || '', ...(g.keywords || []), ...g.steps.map(s => s.action + ' ' + s.detail)].join(' ').toLowerCase()
          return text.includes(query.toLowerCase())
        }).map(g => ({ cat, guide: g }))
      )
    : []

  const hasResults = storeResults.length > 0 || staffResults.length > 0 || guideResults.length > 0
  const isSearching = query.trim().length > 0

  return (
    <main className="min-h-screen bg-background">
      <Header title="직영점 대응 위키" />

      <div className="max-w-[480px] mx-auto px-5 pb-10">
        {/* Hero */}
        <div className="pt-6 pb-6">
          <div className="relative rounded-3xl overflow-hidden mb-6 shadow-lg">
            <img
              src="/images/store-hero.png"
              alt="HAKA 직영점"
              className="w-full aspect-[4/3] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="text-[28px] font-extrabold tracking-tight leading-tight text-white drop-shadow-sm">무엇을 도와드릴까요?</h2>
            </div>
          </div>
        </div>

        {/* Unified Search */}
        <div className="pb-6">
          {/* Notice Banner */}
          {notice && <p className="text-[16px] font-bold text-foreground mb-3">공지사항</p>}
          {notice && (
            <Link href={`/guide/${notice.guide_id}`}>
              <div className="flex items-center gap-3 bg-teal-500 hover:bg-teal-600 transition-colors rounded-2xl px-4 py-3.5 mb-4 cursor-pointer shadow-sm">
                <div className="shrink-0 w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8L2 4C2 3.44772 2.44772 3 3 3H4L4 11H3C2.44772 11 2 10.5523 2 10V8Z" fill="white"/>
                    <path d="M4 3L12 1V13L4 11V3Z" fill="white" fillOpacity="0.9"/>
                    <path d="M5 11.5V14C5 14.5523 5.44772 15 6 15H6.5C6.89782 15 7.25436 14.7526 7.39443 14.3827L8.5 11.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="13.5" cy="5.5" r="0.5" fill="white"/>
                    <circle cx="13.5" cy="7.5" r="0.5" fill="white"/>
                  </svg>
                </div>
                <p className="flex-1 text-[14px] font-bold text-white truncate">{notice.title}</p>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                  <path d="M6 3L11 8L6 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>
          )}
          <p className="text-[16px] font-bold text-foreground mb-3">증상, 매장명, 이름으로 검색하세요</p>
          <Input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="증상, 매장명, 직원 이름 검색"
            className="h-[52px] text-[15px] rounded-2xl bg-card border-border/60 px-5 shadow-sm"
          />
        </div>

        {/* Recent Searches */}
        {!isSearching && recentSearches.length > 0 && (
          <div className="pb-4">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[13px] font-bold text-muted-foreground">최근 검색</p>
              <button
                className="text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                onClick={clearAllSearches}
              >
                전체 삭제
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {recentSearches.map(term => (
                <div key={term} className="flex items-center gap-1 border border-border/60 rounded-full pl-3.5 pr-1.5 py-1.5 bg-card">
                  <button
                    className="text-[13px] text-foreground"
                    onClick={() => setQuery(term)}
                  >
                    {term}
                  </button>
                  <button
                    className="text-muted-foreground hover:text-foreground text-[11px] w-5 h-5 flex items-center justify-center transition-colors"
                    onClick={() => removeSearch(term)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {isSearching && (
          <div className="pb-6">
            {dbLoading && !hasResults ? (
              <p className="text-[13px] text-muted-foreground text-center py-10">검색 중...</p>
            ) : !hasResults ? (
              <p className="text-[13px] text-muted-foreground text-center py-10">
                &quot;{query}&quot; 검색 결과가 없습니다
              </p>
            ) : (
              <div className="space-y-6">
                {/* Store Results */}
                {storeResults.length > 0 && (
                  <div>
                    <p className="text-[12px] font-bold text-muted-foreground mb-2.5">매장 {storeResults.length}건</p>
                    <div className="space-y-2">
                      {storeResults.map(s => (
                        <Card key={s.id} className="rounded-xl border-border/40 shadow-sm">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-primary">
                                <path d="M3 7L9 3L15 7V15H3V7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                                <path d="M7 15V11H11V15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[14px] truncate">{s.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[13px] text-primary font-bold font-mono">{s.code}</span>
                                {s.region && <Badge variant="outline" className="text-[10px] rounded-md font-medium">{s.region}</Badge>}
                              </div>
                              {storeNotes[s.id] && (
                                <p className="text-[12px] text-primary/70 mt-1 truncate">
                                  {storeNotes[s.id].project && <span className="font-semibold">[{storeNotes[s.id].project}]</span>} {storeNotes[s.id].note}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Staff Results */}
                {staffResults.length > 0 && (
                  <div>
                    <p className="text-[12px] font-bold text-muted-foreground mb-2.5">직원 {staffResults.length}건</p>
                    <div className="space-y-2">
                      {staffResults.map(l => (
                        <Card key={l.id} className="rounded-xl border-border/40 shadow-sm">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-primary">
                                <path d="M9 9C10.6569 9 12 7.65685 12 6C12 4.34315 10.6569 3 9 3C7.34315 3 6 4.34315 6 6C6 7.65685 7.34315 9 9 9Z" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M15 15C15 12.7909 12.3137 11 9 11C5.68629 11 3 12.7909 3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-[14px]">{l.name}</p>
                                {l.branch && <Badge variant="outline" className="text-[10px] rounded-md font-medium">{l.branch}</Badge>}
                              </div>
                              <p className="text-[13px] text-primary font-bold font-mono mt-0.5">{l.employee_id}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Guide Results */}
                {guideResults.length > 0 && (
                  <div>
                    <p className="text-[12px] font-bold text-muted-foreground mb-2.5">가이드 {guideResults.length}건</p>
                    <div className="space-y-2.5">
                      {guideResults.map((r, i) => (
                        <GuideItem key={i} cat={r.cat} guide={r.guide} viewCount={guideViews[r.guide.id] || 0} href={`/guide/${r.guide.id}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Default Content (no search) */}
        {!isSearching && (
          <>
            {/* POS Info Sections */}
            <p className="text-[16px] font-bold text-foreground mb-4">POS 정보 조회</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              <Link href="/info/store">
                <Card className="cursor-pointer border-border/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 rounded-2xl">
                  <CardContent className="pt-6 pb-5 px-4 text-center">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center bg-primary/10 shadow-sm">
                      {INFO_ICONS.store}
                    </div>
                    <p className="font-bold text-[14px] mb-1 tracking-tight">매장 정보</p>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">매장명으로 매장코드 조회</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/info/staff">
                <Card className="cursor-pointer border-border/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 rounded-2xl">
                  <CardContent className="pt-6 pb-5 px-4 text-center">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center bg-primary/10 shadow-sm">
                      {INFO_ICONS.staff}
                    </div>
                    <p className="font-bold text-[14px] mb-1 tracking-tight">직원 정보</p>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">이름으로 사번 조회</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Cash Collection */}
            <p className="text-[16px] font-bold text-foreground mb-4">업무</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              <Link href="/cash-collection">
                <Card className="cursor-pointer border-border/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 rounded-2xl">
                  <CardContent className="pt-6 pb-5 px-4 text-center">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center bg-amber-500/10 shadow-sm">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-amber-600">
                        <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                        <path d="M3 10H21" stroke="currentColor" strokeWidth="1.8"/>
                        <path d="M7 15H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        <path d="M16 3V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        <path d="M8 3V6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <p className="font-bold text-[14px] mb-1 tracking-tight">발렉스 현금 수거 기록</p>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">매장 현금 수거 완료 후 기록</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/repair-request">
                <Card className="cursor-pointer border-border/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 rounded-2xl">
                  <CardContent className="pt-6 pb-5 px-4 text-center">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center bg-primary/10 shadow-sm">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="font-bold text-[14px] mb-1 tracking-tight">수리 접수</p>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">장비 고장/수리 사진 첨부 접수</p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Categories */}
            <p className="text-[16px] font-bold text-foreground mb-4">어떤 문제인가요?</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {GUIDE_DATA.categories.map(cat => (
                <Link key={cat.id} href={`/category/${cat.id}`}>
                  <Card className="cursor-pointer border-border/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 rounded-2xl h-full">
                    <CardContent className="pt-6 pb-5 px-4 text-center">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center bg-primary/10 shadow-sm">
                        {CATEGORY_ICONS[cat.id] || cat.icon}
                      </div>
                      <p className="font-bold text-[14px] mb-1 tracking-tight">{cat.title}</p>
                      <p className="text-[12px] text-muted-foreground leading-relaxed">{cat.desc}</p>
                      <span className="inline-block mt-2.5 border border-primary/30 text-primary text-[11px] font-semibold rounded-full px-3 py-0.5">
                        {cat.guides.length}개 가이드
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </main>
  )
}