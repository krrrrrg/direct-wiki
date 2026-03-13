'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import html2canvas from 'html2canvas-pro'
import { supabase } from '../../lib/supabase'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const STATUS_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '접수' },
  { value: 'in_progress', label: '처리중' },
  { value: 'completed', label: '완료' },
]

const STATUS_LABEL = { pending: '접수', in_progress: '처리중', completed: '완료' }
const STATUS_COLOR = {
  pending: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  in_progress: 'bg-primary/10 text-primary border-primary/20',
  completed: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
}

export default function RepairConfirmPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [updating, setUpdating] = useState(null)
  const [exporting, setExporting] = useState(false)
  const exportRef = useRef(null)

  const fetchRecords = useCallback(async () => {
    let query = supabase
      .from('repair_requests')
      .select('*, stores(name, code, region)')
      .order('created_at', { ascending: false })

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter)
    }

    const { data } = await query
    setRecords(data || [])
    setLoading(false)
  }, [statusFilter])

  useEffect(() => {
    setLoading(true)
    fetchRecords()
  }, [fetchRecords])

  async function exportToJpg(record) {
    if (!exportRef.current) return
    setExporting(true)
    try {
      // 외부 이미지를 base64로 변환해서 CORS 우회
      const imgs = exportRef.current.querySelectorAll('img')
      const origSrcs = []
      for (const img of imgs) {
        origSrcs.push(img.src)
        try {
          const res = await fetch(img.src)
          const blob = await res.blob()
          img.src = await new Promise(resolve => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.readAsDataURL(blob)
          })
        } catch {}
      }

      // 버튼 영역 숨기기
      const hideEls = exportRef.current.querySelectorAll('[data-hide-export]')
      hideEls.forEach(el => { el.style.display = 'none' })

      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      })

      // 원본 복원
      hideEls.forEach(el => { el.style.display = '' })
      imgs.forEach((img, i) => { img.src = origSrcs[i] })

      const link = document.createElement('a')
      const storeName = record.stores?.name || '수리접수'
      const date = new Date(record.created_at).toLocaleDateString('ko-KR').replace(/\./g, '').replace(/\s/g, '')
      link.download = `수리접수_${storeName}_${date}.jpg`
      link.href = canvas.toDataURL('image/jpeg', 0.95)
      link.click()
    } catch (e) {
      alert('이미지 저장에 실패했습니다.')
    }
    setExporting(false)
  }

  async function updateStatus(id, newStatus) {
    setUpdating(id)
    await supabase.from('repair_requests').update({ status: newStatus }).eq('id', id)
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r))
    setUpdating(null)
  }

  const filtered = search.trim()
    ? records.filter(r =>
        r.stores?.name?.includes(search) ||
        r.stores?.code?.includes(search) ||
        r.reporter_name?.includes(search) ||
        r.symptom?.includes(search)
      )
    : records

  const counts = {
    all: records.length,
    pending: records.filter(r => r.status === 'pending').length,
    in_progress: records.filter(r => r.status === 'in_progress').length,
    completed: records.filter(r => r.status === 'completed').length,
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b px-5 py-3.5">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0 text-primary">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-[17px] font-bold tracking-tight">수리 접수 현황</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 pb-10">
        {/* 통계 카드 */}
        <div className="grid grid-cols-3 gap-3 pt-6 pb-4">
          <Card className="rounded-2xl border-amber-500/20 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-[24px] font-extrabold text-amber-600">{counts.pending}</p>
              <p className="text-[12px] font-semibold text-amber-600/70 mt-0.5">접수</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-primary/20 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-[24px] font-extrabold text-primary">{counts.in_progress}</p>
              <p className="text-[12px] font-semibold text-primary/70 mt-0.5">처리중</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-emerald-500/20 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-[24px] font-extrabold text-emerald-600">{counts.completed}</p>
              <p className="text-[12px] font-semibold text-emerald-600/70 mt-0.5">완료</p>
            </CardContent>
          </Card>
        </div>

        {/* 필터 + 검색 */}
        <div className="pb-4 space-y-3">
          <div className="flex gap-2">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`text-[13px] font-semibold px-3.5 py-1.5 rounded-full border transition-colors ${
                  statusFilter === opt.value
                    ? 'bg-primary text-white border-primary'
                    : 'bg-card text-muted-foreground border-border/60 hover:border-primary/40'
                }`}
              >
                {opt.label} {counts[opt.value] > 0 && `(${counts[opt.value]})`}
              </button>
            ))}
          </div>
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="매장명, 매장코드, 접수자, 증상 검색"
            className="h-11 text-[14px] rounded-xl"
          />
        </div>

        {/* 목록 */}
        {loading ? (
          <p className="text-[13px] text-muted-foreground text-center py-20">불러오는 중...</p>
        ) : filtered.length === 0 ? (
          <p className="text-[13px] text-muted-foreground text-center py-20">
            {search.trim() ? `"${search}" 검색 결과 없음` : '접수 내역이 없습니다'}
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => {
              const isExpanded = expandedId === r.id
              return (
                <Card key={r.id} className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    {/* 요약 (클릭하면 펼침) */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : r.id)}
                      className="w-full text-left p-4 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {r.photo_urls?.length > 0 ? (
                          <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden">
                            <img src={r.photo_urls[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary">
                              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[15px] font-bold truncate">{r.stores?.name || '-'}</p>
                            <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLOR[r.status]}`}>
                              {STATUS_LABEL[r.status]}
                            </span>
                          </div>
                          <p className="text-[13px] text-foreground/80 line-clamp-1">{r.symptom}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[12px] text-muted-foreground">{r.reporter_name}</span>
                            <span className="text-[12px] text-muted-foreground">|</span>
                            <span className="text-[12px] text-muted-foreground font-mono">
                              {new Date(r.created_at).toLocaleDateString('ko-KR')}
                            </span>
                            {r.photo_urls?.length > 0 && (
                              <>
                                <span className="text-[12px] text-muted-foreground">|</span>
                                <span className="text-[11px] text-primary font-semibold">사진 {r.photo_urls.length}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <svg
                          width="16" height="16" viewBox="0 0 16 16" fill="none"
                          className={`shrink-0 text-muted-foreground/50 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        >
                          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </button>

                    {/* 펼침 상세 */}
                    {isExpanded && (
                      <div ref={exportRef} className="border-t border-border/40 p-4 space-y-4 bg-white">
                        {/* 매장 정보 */}
                        <div>
                          <p className="text-[12px] font-bold text-muted-foreground mb-1">매장</p>
                          <p className="text-[14px] font-bold">{r.stores?.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[12px] text-primary font-mono font-semibold">{r.stores?.code}</span>
                            {r.stores?.region && <Badge variant="outline" className="text-[10px] rounded-md">{r.stores.region}</Badge>}
                          </div>
                        </div>

                        {/* 증상 전문 */}
                        <div>
                          <p className="text-[12px] font-bold text-muted-foreground mb-1">증상</p>
                          <p className="text-[14px] text-foreground leading-relaxed whitespace-pre-wrap">{r.symptom}</p>
                        </div>

                        {/* 첨부 사진 */}
                        {r.photo_urls?.length > 0 && (
                          <div>
                            <p className="text-[12px] font-bold text-muted-foreground mb-2">첨부 사진</p>
                            <div className="flex gap-2 flex-wrap">
                              {r.photo_urls.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                                  <div className="w-24 h-24 rounded-xl overflow-hidden border border-border/40 hover:opacity-80 transition-opacity">
                                    <img src={url} alt={`사진 ${i + 1}`} className="w-full h-full object-cover" />
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 접수 정보 */}
                        <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                          <span>접수자: <strong className="text-foreground">{r.reporter_name}</strong></span>
                          <span>접수일: <strong className="text-foreground font-mono">{new Date(r.created_at).toLocaleString('ko-KR')}</strong></span>
                        </div>

                        {/* JPG 내보내기 + 상태 변경 */}
                        <div data-hide-export className="flex items-center gap-3 pt-1">
                          <button
                            onClick={() => exportToJpg(r)}
                            disabled={exporting}
                            className="flex items-center gap-1.5 text-[13px] font-semibold px-4 py-2 rounded-xl border border-border/60 text-foreground bg-card hover:bg-secondary/50 transition-colors disabled:opacity-50"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
                              <path d="M21 15V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                              <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {exporting ? '다운로드 중...' : '이미지 다운로드'}
                          </button>
                        </div>

                        <div data-hide-export>
                          <p className="text-[12px] font-bold text-muted-foreground mb-2">상태 변경</p>
                          <div className="flex gap-2">
                            {r.status !== 'pending' && (
                              <button
                                onClick={() => updateStatus(r.id, 'pending')}
                                disabled={updating === r.id}
                                className="text-[13px] font-semibold px-4 py-2 rounded-xl border border-amber-500/30 text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                              >
                                접수
                              </button>
                            )}
                            {r.status !== 'in_progress' && (
                              <button
                                onClick={() => updateStatus(r.id, 'in_progress')}
                                disabled={updating === r.id}
                                className="text-[13px] font-semibold px-4 py-2 rounded-xl border border-primary/30 text-primary bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50"
                              >
                                처리중
                              </button>
                            )}
                            {r.status !== 'completed' && (
                              <button
                                onClick={() => updateStatus(r.id, 'completed')}
                                disabled={updating === r.id}
                                className="text-[13px] font-semibold px-4 py-2 rounded-xl border border-emerald-500/30 text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                              >
                                완료
                              </button>
                            )}
                          </div>
                        </div>
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
