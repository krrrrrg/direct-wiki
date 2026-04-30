'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Header, Footer } from '../../components/shared'

function amountValue(value) {
  const number = Number(String(value).replace(/[^0-9]/g, ''))
  return Number.isFinite(number) ? number : 0
}

function formatAmount(value) {
  return `${Number(value || 0).toLocaleString('ko-KR')}원`
}

export default function CashCollectionPage() {
  const [stores, setStores] = useState([])
  const [staff, setStaff] = useState([])
  const [storeSearch, setStoreSearch] = useState('')
  const [staffSearch, setStaffSearch] = useState('')
  const [selectedStore, setSelectedStore] = useState(null)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [workerName, setWorkerName] = useState('')
  const [collectionDate, setCollectionDate] = useState(() => new Date().toISOString().split('T')[0])
  const [cashAmount, setCashAmount] = useState('')
  const [cashReceiptAmount, setCashReceiptAmount] = useState('')
  const [cardAmount, setCardAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [recentRecords, setRecentRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // 이번 달 수거 대상 = 지난달
  const now = new Date()
  const targetYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
  const targetMonthNum = now.getMonth() === 0 ? 12 : now.getMonth()
  const targetMonth = `${targetYear}-${String(targetMonthNum).padStart(2, '0')}`
  const targetLabel = `${targetYear}년 ${targetMonthNum}월`
  const amountTotal = amountValue(cashAmount) + amountValue(cashReceiptAmount) + amountValue(cardAmount)

  const fetchStores = useCallback(async () => {
    const response = await fetch('/api/cash-collections/stores')
    const payload = await response.json()
    if (!response.ok) throw new Error(payload?.error?.message || '매장 목록을 불러오지 못했습니다.')
    setStores(payload.data || [])
  }, [])

  const fetchStaff = useCallback(async () => {
    const { data } = await supabase.from('login_info').select('*').order('name')
    setStaff(data || [])
  }, [])

  const fetchRecent = useCallback(async () => {
    const response = await fetch(`/api/cash-collections?targetMonth=${targetMonth}&status=SUBMITTED&limit=10`)
    const payload = await response.json()
    if (!response.ok) throw new Error(payload?.error?.message || '최근 기록을 불러오지 못했습니다.')
    setRecentRecords(payload.data || [])
  }, [targetMonth])

  useEffect(() => {
    async function init() {
      setLoading(true)
      setLoadError('')
      try {
        await Promise.all([fetchStores(), fetchStaff(), fetchRecent()])
      } catch (error) {
        setLoadError(error?.message || '데이터를 불러오지 못했습니다.')
      }
      setLoading(false)
    }
    init()
  }, [fetchStores, fetchStaff, fetchRecent])

  const filteredStores = storeSearch.trim()
    ? stores.filter(s => s.name.includes(storeSearch) || s.code.includes(storeSearch))
    : []

  const filteredStaff = staffSearch.trim()
    ? staff.filter(s => s.name.includes(staffSearch) || String(s.employee_id || '').includes(staffSearch))
    : []

  async function handleSubmit() {
    const finalWorkerName = selectedStaff ? selectedStaff.name : workerName.trim()
    if (!selectedStore || !finalWorkerName || !collectionDate || amountTotal <= 0) return
    setSaving(true)

    try {
      const existingResponse = await fetch(`/api/cash-collections?storeCode=${encodeURIComponent(selectedStore.code)}&targetMonth=${targetMonth}&status=SUBMITTED&limit=1`)
      const existingPayload = await existingResponse.json()
      if (!existingResponse.ok) throw new Error(existingPayload?.error?.message || '중복 확인에 실패했습니다.')

      if ((existingPayload.data || []).length > 0) {
        if (!confirm(`${selectedStore.name}은(는) 이미 ${targetLabel} 수거 기록이 있습니다. 덮어쓸까요?`)) {
          setSaving(false)
          return
        }
      }

      const saveResponse = await fetch('/api/cash-collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collectionDate,
          targetMonth,
          storeCode: selectedStore.code,
          cashAmount: amountValue(cashAmount),
          cashReceiptAmount: amountValue(cashReceiptAmount),
          cardAmount: amountValue(cardAmount),
          submitterName: finalWorkerName,
          sourceSubmissionId: `direct-wiki:${selectedStore.code}:${targetMonth}`,
          raw: {
            source: 'direct-wiki-cash-collection',
            store: selectedStore,
            staff: selectedStaff,
          },
        }),
      })
      const savePayload = await saveResponse.json()
      if (!saveResponse.ok) throw new Error(savePayload?.error?.message || '저장에 실패했습니다.')
    } catch (error) {
      alert(error?.message || '저장에 실패했습니다.')
      setSaving(false)
      return
    }

    setSaving(false)
    setSaved(true)
    setSelectedStore(null)
    setSelectedStaff(null)
    setWorkerName('')
    setStoreSearch('')
    setStaffSearch('')
    setCollectionDate(new Date().toISOString().split('T')[0])
    setCashAmount('')
    setCashReceiptAmount('')
    setCardAmount('')
    fetchRecent()

    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header title="발렉스 현금 수거 기록" showBack />
        <p className="text-[13px] text-muted-foreground text-center py-20">불러오는 중...</p>
      </main>
    )
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-background">
        <Header title="발렉스 현금 수거 기록" showBack />
        <div className="max-w-[480px] mx-auto px-5 py-10">
          <Card className="rounded-2xl border-red-200 bg-red-50">
            <CardContent className="p-5">
              <p className="text-[14px] font-bold text-red-700">ERP 연동 오류</p>
              <p className="text-[13px] text-red-600 mt-2">{loadError}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header title="발렉스 현금 수거 기록" showBack />

      <div className="max-w-[480px] mx-auto px-5 pb-10">
        {/* 대상 월 안내 */}
        <div className="pt-6 pb-4">
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3.5">
            <div className="shrink-0 w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2V4M8 12V14M2 8H4M12 8H14" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="8" r="3" stroke="#D97706" strokeWidth="1.5"/>
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-bold text-amber-700">{targetLabel} 현금 수거</p>
              <p className="text-[12px] text-amber-600/80 mt-0.5">수거 완료 후 아래에서 기록해주세요</p>
            </div>
          </div>
        </div>

        {/* 입력 폼 */}
        <Card className="rounded-2xl border-border/40 shadow-sm mb-6">
          <CardContent className="p-5 space-y-4">
            {/* 매장 선택 */}
            <div>
              <label className="text-[13px] font-bold text-foreground mb-2 block">매장 선택</label>
              {selectedStore ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <div>
                    <p className="text-[14px] font-bold">{selectedStore.name}</p>
                    <p className="text-[12px] text-muted-foreground font-mono">{selectedStore.code}</p>
                  </div>
                  <button
                    onClick={() => { setSelectedStore(null); setStoreSearch('') }}
                    className="text-[12px] font-semibold text-primary hover:underline"
                  >
                    변경
                  </button>
                </div>
              ) : (
                <>
                  <Input
                    value={storeSearch}
                    onChange={e => setStoreSearch(e.target.value)}
                    placeholder="매장명 또는 매장코드 검색"
                    className="h-11 text-[16px] rounded-xl"
                  />
                  {filteredStores.length > 0 && (
                    <div className="mt-2 max-h-[200px] overflow-y-auto rounded-xl border border-border/40">
                      {filteredStores.map(s => (
                        <button
                          key={s.id}
                          onClick={() => { setSelectedStore(s); setStoreSearch(s.name) }}
                          className="w-full text-left px-4 py-2.5 hover:bg-secondary/50 transition-colors border-b border-border/20 last:border-0"
                        >
                          <p className="text-[14px] font-medium">{s.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[12px] text-primary font-mono">{s.code}</span>
                            {s.region && <span className="text-[11px] text-muted-foreground">{s.region}</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {storeSearch.trim() && filteredStores.length === 0 && (
                    <div className="mt-2 text-center py-3">
                      <p className="text-[12px] text-muted-foreground">검색 결과 없음</p>
                      <p className="text-[11px] text-muted-foreground mt-1">경영지원 제명환 <a href="tel:01087488031" className="text-primary font-semibold">010-8748-8031</a> 연락</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 근무자 선택 */}
            <div>
              <label className="text-[13px] font-bold text-foreground mb-2 block">근무자</label>
              {selectedStaff ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <div>
                    <p className="text-[14px] font-bold">{selectedStaff.name}</p>
                    <p className="text-[12px] text-muted-foreground font-mono">{selectedStaff.employee_id}</p>
                  </div>
                  <button
                    onClick={() => { setSelectedStaff(null); setStaffSearch('') }}
                    className="text-[12px] font-semibold text-primary hover:underline"
                  >
                    변경
                  </button>
                </div>
              ) : (
                <>
                  <Input
                    value={staffSearch}
                    onChange={e => setStaffSearch(e.target.value)}
                    placeholder="이름 또는 사번으로 검색"
                    className="h-11 text-[16px] rounded-xl"
                  />
                  {filteredStaff.length > 0 && (
                    <div className="mt-2 max-h-[200px] overflow-y-auto rounded-xl border border-border/40">
                      {filteredStaff.map(s => (
                        <button
                          key={s.id}
                          onClick={() => { setSelectedStaff(s); setStaffSearch(s.name) }}
                          className="w-full text-left px-4 py-2.5 hover:bg-secondary/50 transition-colors border-b border-border/20 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <p className="text-[14px] font-medium">{s.name}</p>
                            {s.branch && <span className="text-[11px] text-muted-foreground">{s.branch}</span>}
                          </div>
                          <p className="text-[12px] text-primary font-mono mt-0.5">{s.employee_id}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  {staffSearch.trim() && filteredStaff.length === 0 && (
                    <div className="mt-2 text-center py-3">
                      <p className="text-[12px] text-muted-foreground">검색 결과 없음</p>
                      <p className="text-[11px] text-muted-foreground mt-1">경영지원 제명환 <a href="tel:01087488031" className="text-primary font-semibold">010-8748-8031</a> 연락</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {!selectedStaff && (
              <div>
                <label className="text-[13px] font-bold text-foreground mb-2 block">근무자 직접 입력</label>
                <Input
                  value={workerName}
                  onChange={e => setWorkerName(e.target.value)}
                  placeholder="검색이 안 될 때 이름 직접 입력"
                  className="h-11 text-[16px] rounded-xl"
                />
              </div>
            )}

            {/* 수거일 */}
            <div>
              <label className="text-[13px] font-bold text-foreground mb-2 block">수거일</label>
              <Input
                type="date"
                value={collectionDate}
                onChange={e => setCollectionDate(e.target.value)}
                className="h-11 text-[16px] rounded-xl"
              />
            </div>

            <div>
              <label className="text-[13px] font-bold text-foreground mb-2 block">수거 금액</label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={cashAmount}
                  onChange={e => setCashAmount(e.target.value)}
                  placeholder="현금"
                  className="h-11 text-[15px] rounded-xl"
                />
                <Input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={cashReceiptAmount}
                  onChange={e => setCashReceiptAmount(e.target.value)}
                  placeholder="현금영수증"
                  className="h-11 text-[15px] rounded-xl"
                />
                <Input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={cardAmount}
                  onChange={e => setCardAmount(e.target.value)}
                  placeholder="카드"
                  className="h-11 text-[15px] rounded-xl"
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-[12px]">
                <span className="text-muted-foreground">합계</span>
                <span className="font-bold text-foreground">{formatAmount(amountTotal)}</span>
              </div>
            </div>

            {/* 저장 버튼 */}
            <button
              onClick={handleSubmit}
              disabled={saving || !selectedStore || (!selectedStaff && !workerName.trim()) || !collectionDate || amountTotal <= 0}
              className="w-full h-12 rounded-2xl bg-primary text-white font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '저장 중...' : '수거 기록 저장'}
            </button>

            {saved && (
              <div className="flex items-center gap-2 justify-center text-[13px] font-semibold text-emerald-600">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                저장 완료
              </div>
            )}
          </CardContent>
        </Card>

        {/* 최근 기록 */}
        {recentRecords.length > 0 && (
          <div>
            <p className="text-[16px] font-bold text-foreground mb-3">
              {targetLabel} 수거 기록
            </p>
            <div className="space-y-2">
              {recentRecords.map(r => (
                <Card key={r.id} className="rounded-xl border-border/40 shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7L6 10L11 4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold truncate">{r.stores?.name || '-'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[12px] text-muted-foreground">{r.worker_name}</span>
                        <span className="text-[12px] text-muted-foreground">|</span>
                        <span className="text-[12px] text-muted-foreground font-mono">{r.collection_date}</span>
                      </div>
                      <p className="text-[12px] font-semibold text-foreground mt-1">
                        {formatAmount(r.totalAmount)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
