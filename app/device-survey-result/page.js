'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DeviceSurveyResultPage() {
  const [records, setRecords] = useState([])
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showFilter, setShowFilter] = useState('all') // 'all' | 'done' | 'missing'
  const [regionFilter, setRegionFilter] = useState('전체')
  const [expandedId, setExpandedId] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [storeRes, surveyRes] = await Promise.all([
      supabase.from('stores').select('*').order('region, name'),
      supabase.from('device_surveys').select('*, stores(name, code, region)').order('created_at', { ascending: false }),
    ])
    setStores(storeRes.data || [])
    setRecords(surveyRes.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const surveyMap = new Map(records.map(r => [r.store_id, r]))
  const regions = ['전체', ...Array.from(new Set(stores.map(s => s.region).filter(Boolean))).sort()]

  const doneCount = records.length
  const totalCount = stores.length
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  // 필터링된 매장 목록
  const filteredStores = stores.filter(s => {
    if (regionFilter !== '전체' && s.region !== regionFilter) return false
    if (search.trim()) {
      const q = search.trim()
      if (!s.name.includes(q) && !s.code.includes(q)) return false
    }
    if (showFilter === 'done') return surveyMap.has(s.id)
    if (showFilter === 'missing') return !surveyMap.has(s.id)
    return true
  })

  const filteredDone = filteredStores.filter(s => surveyMap.has(s.id)).length
  const filteredMissing = filteredStores.filter(s => !surveyMap.has(s.id)).length

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b px-5 py-3.5">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0 text-primary">
            <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M8 7V17" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M12 7V17" stroke="currentColor" strokeWidth="1"/>
            <path d="M15 7V17" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M18 7V17" stroke="currentColor" strokeWidth="1"/>
          </svg>
          <h1 className="text-[17px] font-bold tracking-tight">장비 모델명 조사 현황</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 pb-10">
        {/* 통계 */}
        <div className="grid grid-cols-3 gap-3 pt-6 pb-4">
          <Card className="rounded-2xl border-primary/20 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-[24px] font-extrabold text-primary">{doneCount}</p>
              <p className="text-[12px] font-semibold text-primary/70 mt-0.5">응답 완료</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-amber-500/20 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-[24px] font-extrabold text-amber-600">{totalCount - doneCount}</p>
              <p className="text-[12px] font-semibold text-amber-600/70 mt-0.5">미응답</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-emerald-500/20 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-[24px] font-extrabold text-emerald-600">{progress}%</p>
              <p className="text-[12px] font-semibold text-emerald-600/70 mt-0.5">진행률</p>
            </CardContent>
          </Card>
        </div>

        {/* 진행 바 */}
        <div className="pb-4">
          <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* 필터 */}
        <div className="pb-4 space-y-3">
          {/* 상태 필터 */}
          <div className="flex gap-2">
            {[
              { key: 'all', label: '전체' },
              { key: 'done', label: `응답 ${filteredDone}` },
              { key: 'missing', label: `미응답 ${filteredMissing}` },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setShowFilter(f.key)}
                className={`text-[13px] font-semibold px-3.5 py-1.5 rounded-full border transition-colors ${
                  showFilter === f.key
                    ? f.key === 'missing' ? 'bg-amber-500 text-white border-amber-500' : 'bg-primary text-white border-primary'
                    : f.key === 'missing' ? 'border-amber-300 text-amber-600 hover:bg-amber-50' : 'bg-card text-muted-foreground border-border/60 hover:border-primary/40'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* 지역 필터 */}
          <div className="flex gap-2 flex-wrap">
            {regions.map(r => (
              <button
                key={r}
                onClick={() => setRegionFilter(r)}
                className={`text-[12px] px-3 py-1 rounded-full font-semibold transition-colors ${
                  regionFilter === r
                    ? 'bg-primary text-white'
                    : 'border border-primary/30 text-primary hover:bg-primary/5'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* 검색 */}
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="매장명 또는 매장코드 검색"
            className="h-11 text-[14px] rounded-xl"
          />
        </div>

        {/* 목록 */}
        {loading ? (
          <p className="text-[13px] text-muted-foreground text-center py-20">불러오는 중...</p>
        ) : filteredStores.length === 0 ? (
          <p className="text-[13px] text-muted-foreground text-center py-20">
            {search.trim() ? `"${search}" 검색 결과 없음` : '해당 조건의 매장이 없습니다'}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredStores.map(store => {
              const survey = surveyMap.get(store.id)
              const isDone = !!survey
              const isExpanded = expandedId === store.id

              return (
                <Card key={store.id} className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : store.id)}
                      className="w-full text-left p-4 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`shrink-0 w-8 h-8 rounded-lg border-2 flex items-center justify-center ${
                          isDone ? 'bg-primary border-primary' : 'border-amber-300 bg-amber-50'
                        }`}>
                          {isDone ? (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5H8" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-[14px] truncate ${isDone ? 'font-medium text-muted-foreground' : 'font-bold text-foreground'}`}>
                              {store.name}
                            </p>
                            {store.region && <Badge variant="outline" className="text-[10px] rounded-md font-medium shrink-0">{store.region}</Badge>}
                          </div>
                          <span className="text-[12px] text-primary font-mono">{store.code}</span>
                        </div>
                        {isDone && (
                          <svg
                            width="16" height="16" viewBox="0 0 16 16" fill="none"
                            className={`shrink-0 text-muted-foreground/50 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          >
                            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </button>

                    {/* 상세 */}
                    {isExpanded && isDone && survey && (
                      <div className="border-t border-border/40 p-4 space-y-4 bg-white">
                        {/* 바코드 리더기 */}
                        <div>
                          <p className="text-[12px] font-bold text-muted-foreground mb-1">바코드 리더기</p>
                          {survey.barcode_reader_model && (
                            <p className="text-[15px] font-bold text-foreground">{survey.barcode_reader_model}</p>
                          )}
                          {survey.barcode_reader_photo && (
                            <a href={survey.barcode_reader_photo} target="_blank" rel="noopener noreferrer">
                              <div className="mt-2 w-32 h-32 rounded-xl overflow-hidden border border-border/40 hover:opacity-80 transition-opacity">
                                <img src={survey.barcode_reader_photo} alt="바코드 리더기" className="w-full h-full object-cover" />
                              </div>
                            </a>
                          )}
                          {!survey.barcode_reader_model && !survey.barcode_reader_photo && (
                            <p className="text-[13px] text-muted-foreground">미입력</p>
                          )}
                        </div>

                        {/* 카드단말기 */}
                        <div>
                          <p className="text-[12px] font-bold text-muted-foreground mb-1">카드단말기</p>
                          {survey.card_terminal_model && (
                            <p className="text-[15px] font-bold text-foreground">{survey.card_terminal_model}</p>
                          )}
                          {survey.card_terminal_photo && (
                            <a href={survey.card_terminal_photo} target="_blank" rel="noopener noreferrer">
                              <div className="mt-2 w-32 h-32 rounded-xl overflow-hidden border border-border/40 hover:opacity-80 transition-opacity">
                                <img src={survey.card_terminal_photo} alt="카드단말기" className="w-full h-full object-cover" />
                              </div>
                            </a>
                          )}
                          {!survey.card_terminal_model && !survey.card_terminal_photo && (
                            <p className="text-[13px] text-muted-foreground">미입력</p>
                          )}
                        </div>

                        {/* 응답 일시 */}
                        <p className="text-[12px] text-muted-foreground">
                          응답일: <strong className="text-foreground font-mono">{new Date(survey.created_at).toLocaleString('ko-KR')}</strong>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
