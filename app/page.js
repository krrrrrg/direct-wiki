'use client'

import { useState, useEffect, useCallback } from 'react'
import { GUIDE_DATA } from '../lib/guideData'
import { supabase } from '../lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const CATEGORY_ICONS = {
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
}

const INFO_ICONS = {
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

export default function Home() {
  const [view, setView] = useState('main')
  const [selectedCat, setSelectedCat] = useState(null)
  const [selectedGuide, setSelectedGuide] = useState(null)
  const [query, setQuery] = useState('')
  const [staffResults, setStaffResults] = useState([])
  const [storeResults, setStoreResults] = useState([])
  const [dbLoading, setDbLoading] = useState(false)
  const [infoView, setInfoView] = useState(null) // 'store' | 'staff' | null
  const [infoQuery, setInfoQuery] = useState('')
  const [infoStoreResults, setInfoStoreResults] = useState([])
  const [infoStaffResults, setInfoStaffResults] = useState([])
  const [infoLoading, setInfoLoading] = useState(false)
  const [storeNotes, setStoreNotes] = useState({})
  const [guideViews, setGuideViews] = useState({})

  // Fetch all guide view counts
  const fetchGuideViews = useCallback(async () => {
    const { data } = await supabase.from('guide_views').select('guide_id, view_count')
    if (data) {
      const map = {}
      for (const row of data) map[row.guide_id] = row.view_count
      setGuideViews(map)
    }
  }, [])

  // Increment guide view count
  async function incrementView(guideId) {
    await supabase.rpc('increment_guide_view', { p_guide_id: guideId })
    setGuideViews(prev => ({ ...prev, [guideId]: (prev[guideId] || 0) + 1 }))
  }

  useEffect(() => { fetchGuideViews() }, [fetchGuideViews])

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
    setStaffResults(staffRes.data || [])
    setStoreResults(storeRes.data || [])
    await fetchStoreNotes((storeRes.data || []).map(s => s.id))
    setDbLoading(false)
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

  // Info section search
  const searchInfo = useCallback(async (q, type) => {
    if (!q.trim()) { setInfoStoreResults([]); setInfoStaffResults([]); return }
    setInfoLoading(true)
    const t = q.trim()
    if (type === 'store') {
      const { data } = await supabase.from('stores').select('*')
        .or(`name.ilike.%${t}%,code.ilike.%${t}%`)
        .order('region').limit(30)
      setInfoStoreResults(data || [])
      await fetchStoreNotes((data || []).map(s => s.id))
    } else {
      const { data } = await supabase.from('login_info').select('*')
        .or(`name.ilike.%${t}%,employee_id.ilike.%${t}%`)
        .order('branch').limit(30)
      setInfoStaffResults(data || [])
    }
    setInfoLoading(false)
  }, [fetchStoreNotes])

  useEffect(() => {
    if (!infoView) return
    const timer = setTimeout(() => searchInfo(infoQuery, infoView), 300)
    return () => clearTimeout(timer)
  }, [infoQuery, infoView, searchInfo])

  // 브라우저 뒤로가기/앞으로가기 지원
  function restoreState(state) {
    if (!state || state.view === 'main') {
      setView('main')
      setSelectedCat(null)
      setSelectedGuide(null)
      setQuery('')
      setInfoView(null)
    } else if (state.view === 'list') {
      const cat = GUIDE_DATA.categories.find(c => c.id === state.catId)
      setSelectedCat(cat)
      setView('list')
      setSelectedGuide(null)
    } else if (state.view === 'detail') {
      const cat = GUIDE_DATA.categories.find(c => c.id === state.catId)
      const guide = cat?.guides.find(g => g.id === state.guideId)
      if (cat && guide) {
        setSelectedCat(cat)
        setSelectedGuide(guide)
        setView('detail')
      }
    } else if (state.view === 'info') {
      setInfoView(state.infoType)
      setInfoQuery('')
      setInfoStoreResults([])
      setInfoStaffResults([])
      setView('info')
    }
  }

  useEffect(() => {
    // 초기 상태 저장
    window.history.replaceState({ view: 'main' }, '')

    function handlePopState(e) {
      restoreState(e.state)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function openInfoView(type) {
    window.history.pushState({ view: 'info', infoType: type }, '')
    setInfoView(type)
    setInfoQuery('')
    setInfoStoreResults([])
    setInfoStaffResults([])
    setView('info')
  }

  function showList(cat) {
    window.history.pushState({ view: 'list', catId: cat.id }, '')
    setSelectedCat(cat)
    setView('list')
  }

  function showDetail(cat, guide) {
    window.history.pushState({ view: 'detail', catId: cat.id, guideId: guide.id }, '')
    setSelectedCat(cat)
    setSelectedGuide(guide)
    setView('detail')
    window.scrollTo({ top: 0 })
    incrementView(guide.id)
  }

  function goBack() {
    window.history.back()
  }

  const headerTitle = view === 'detail' ? selectedGuide?.title : view === 'list' ? selectedCat?.title : view === 'info' ? (infoView === 'store' ? 'POS 매장 정보' : 'POS 직원 정보') : '직영점 대응 위키'

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b px-5 py-3.5">
        <div className="max-w-[480px] mx-auto flex items-center gap-3">
          {view !== 'main' ? (
            <button
              onClick={goBack}
              className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ) : (
            <img src="/images/logo.png" alt="HAKA" className="shrink-0 w-7 h-7" />
          )}
          <h1 className="text-[17px] font-bold tracking-tight truncate">{headerTitle}</h1>
        </div>
      </div>

      <div className="max-w-[480px] mx-auto px-5 pb-10">
        {/* Main View */}
        {view === 'main' && (
          <>
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
              <p className="text-[16px] font-bold text-foreground mb-3">증상, 매장명, 이름으로 검색하세요</p>
              <Input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="증상, 매장명, 직원 이름 검색"
                className="h-[52px] text-[15px] rounded-2xl bg-card border-border/60 px-5 shadow-sm"
              />
            </div>

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
                            <GuideItem key={i} cat={r.cat} guide={r.guide} onClick={() => showDetail(r.cat, r.guide)} viewCount={guideViews[r.guide.id] || 0} />
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
                {/* Categories */}
                <p className="text-[16px] font-bold text-foreground mb-4">어떤 문제인가요?</p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {GUIDE_DATA.categories.map(cat => (
                    <Card
                      key={cat.id}
                      className="cursor-pointer border-border/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 rounded-2xl"
                      onClick={() => showList(cat)}
                    >
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
                  ))}
                </div>

                {/* POS Info Sections */}
                <p className="text-[16px] font-bold text-foreground mb-4">POS 정보 조회</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <Card
                    className="cursor-pointer border-border/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 rounded-2xl"
                    onClick={() => openInfoView('store')}
                  >
                    <CardContent className="pt-6 pb-5 px-4 text-center">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center bg-primary/10 shadow-sm">
                        {INFO_ICONS.store}
                      </div>
                      <p className="font-bold text-[14px] mb-1 tracking-tight">매장 정보</p>
                      <p className="text-[12px] text-muted-foreground leading-relaxed">매장명으로 매장코드 조회</p>
                    </CardContent>
                  </Card>
                  <Card
                    className="cursor-pointer border-border/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 rounded-2xl"
                    onClick={() => openInfoView('staff')}
                  >
                    <CardContent className="pt-6 pb-5 px-4 text-center">
                      <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center bg-primary/10 shadow-sm">
                        {INFO_ICONS.staff}
                      </div>
                      <p className="font-bold text-[14px] mb-1 tracking-tight">직원 정보</p>
                      <p className="text-[12px] text-muted-foreground leading-relaxed">이름으로 사번 조회</p>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </>
        )}

        {/* Info View */}
        {view === 'info' && infoView && (
          <div className="pt-6">
            <Input
              type="text"
              value={infoQuery}
              onChange={e => setInfoQuery(e.target.value)}
              placeholder={infoView === 'store' ? '매장명 또는 매장코드 검색' : '이름 또는 사번 검색'}
              className="h-[52px] text-[15px] rounded-2xl bg-card border-border/60 px-5 shadow-sm"
              autoFocus
            />
            {infoQuery.trim() && (
              <div className="mt-4">
                {infoLoading ? (
                  <p className="text-[13px] text-muted-foreground text-center py-10">검색 중...</p>
                ) : infoView === 'store' ? (
                  infoStoreResults.length === 0 ? (
                    <p className="text-[13px] text-muted-foreground text-center py-10">검색 결과가 없습니다</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[12px] font-bold text-muted-foreground mb-2">{infoStoreResults.length}건</p>
                      {infoStoreResults.map(s => (
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
                                <span className="text-[15px] text-primary font-bold font-mono">{s.code}</span>
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
                  )
                ) : (
                  infoStaffResults.length === 0 ? (
                    <p className="text-[13px] text-muted-foreground text-center py-10">검색 결과가 없습니다</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[12px] font-bold text-muted-foreground mb-2">{infoStaffResults.length}건</p>
                      {infoStaffResults.map(l => (
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
                              <p className="text-[15px] text-primary font-bold font-mono mt-0.5">{l.employee_id}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {view === 'list' && selectedCat && (
          <div className="pt-6">
            {selectedCat.notice && (
              <div className="rounded-2xl bg-primary/8 border border-primary/15 px-5 py-4 mb-5">
                <p className="text-[13px] text-foreground/70 leading-relaxed">
                  {selectedCat.notice}
                </p>
              </div>
            )}
            <div className="space-y-2.5">
              {selectedCat.guides.map(g => (
                <GuideItem key={g.id} cat={selectedCat} guide={g} onClick={() => showDetail(selectedCat, g)} viewCount={guideViews[g.id] || 0} />
              ))}
            </div>
          </div>
        )}

        {/* Detail View */}
        {view === 'detail' && selectedGuide && selectedCat && (
          <div className="pt-8">
            <h2 className="text-[22px] font-extrabold tracking-tight leading-tight mb-3">{selectedGuide.title}</h2>
            <span className="inline-block border border-primary text-primary text-[13px] font-semibold rounded-full px-4 py-1.5">
              {selectedGuide.symptom}
            </span>
            {selectedGuide.shortcut && (
              <Card className="mt-5 rounded-2xl border-primary/20 bg-primary/5">
                <CardContent className="py-4 text-center">
                  <p className="text-[11px] text-muted-foreground mb-1 font-medium">단축키</p>
                  <p className="text-[20px] font-extrabold tracking-[0.15em] text-foreground">{selectedGuide.shortcut}</p>
                </CardContent>
              </Card>
            )}

            {/* Steps */}
            <div className="mt-8 space-y-5">
              {selectedGuide.steps.map((step, i) => (
                <div key={i} className="relative pl-14">
                  {i < selectedGuide.steps.length - 1 && (
                    <div className="absolute left-[21px] top-12 bottom-0 w-0.5 bg-border" />
                  )}
                  <div
                    className="absolute left-0 top-0 w-[42px] h-[42px] rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-[14px] font-extrabold shadow-sm"
                  >
                    {i + 1}
                  </div>
                  <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
                    <CardContent className="p-5">
                      <p className="font-bold text-[15px] mb-1.5">{step.action}</p>
                      <p className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-line">{step.detail}</p>
                    </CardContent>
                    {step.image && (
                      <img src={step.image} alt={step.action} className="w-full max-h-[360px] object-contain bg-muted/50 border-t" />
                    )}
                  </Card>
                </div>
              ))}
            </div>

            {selectedGuide.note && (
              <div className="mt-6 mb-8 rounded-2xl bg-primary/8 border border-primary/20 px-5 py-4">
                <p className="text-[13px] font-semibold text-foreground/70 leading-relaxed">
                  {selectedGuide.note}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center pb-10 px-5">
        <span className="inline-block bg-primary text-white text-[13px] font-bold rounded-full px-6 py-2.5 shadow-sm">
          해결이 안 되면 본사 경영지원팀에 연락
        </span>
        <p className="text-[12px] text-muted-foreground mt-3">하카코리아 경영지원팀 &middot; {GUIDE_DATA.lastUpdate}</p>
      </div>
    </main>
  )
}

function GuideItem({ cat, guide, onClick, viewCount }) {
  return (
    <Card
      className="cursor-pointer border-border/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 rounded-2xl"
      onClick={onClick}
    >
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
}
