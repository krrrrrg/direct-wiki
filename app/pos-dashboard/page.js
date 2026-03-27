'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '../../components/shared'

export default function PosDashboardPage() {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const year = now.getFullYear()
  const month = now.getMonth()
  const currentMonth = `${year}-${String(month + 1).padStart(2, '0')}`

  // 탭
  const [tab, setTab] = useState('daily')

  // 일별 필터
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)

  // 월별 필터
  const [startMonth, setStartMonth] = useState(currentMonth)
  const [endMonth, setEndMonth] = useState(currentMonth)

  // 공통
  const [storeSearch, setStoreSearch] = useState('')
  const [selectedStore, setSelectedStore] = useState(null)
  const [storeList, setStoreList] = useState([])
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [activePreset, setActivePreset] = useState(null)

  const dailyPresets = [
    { label: '이번달', start: `${year}-${String(month + 1).padStart(2, '0')}-01`, end: today },
    { label: '저번달', start: `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-01`, end: `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-${new Date(month === 0 ? year - 1 : year, month === 0 ? 12 : month, 0).getDate()}` },
    { label: '1분기', start: `${year}-01-01`, end: `${year}-03-31` },
    { label: '2분기', start: `${year}-04-01`, end: `${year}-06-30` },
    { label: '3분기', start: `${year}-07-01`, end: `${year}-09-30` },
    { label: '4분기', start: `${year}-10-01`, end: `${year}-12-31` },
    { label: '상반기', start: `${year}-01-01`, end: `${year}-06-30` },
    { label: '하반기', start: `${year}-07-01`, end: `${year}-12-31` },
    { label: '올해', start: `${year}-01-01`, end: `${year}-12-31` },
    { label: '전년도', start: `${year - 1}-01-01`, end: `${year - 1}-12-31` },
  ]

  const monthlyPresets = [
    { label: '이번달', start: currentMonth, end: currentMonth },
    { label: '저번달', start: `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}`, end: `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}` },
    { label: '1분기', start: `${year}-01`, end: `${year}-03` },
    { label: '2분기', start: `${year}-04`, end: `${year}-06` },
    { label: '3분기', start: `${year}-07`, end: `${year}-09` },
    { label: '4분기', start: `${year}-10`, end: `${year}-12` },
    { label: '상반기', start: `${year}-01`, end: `${year}-06` },
    { label: '하반기', start: `${year}-07`, end: `${year}-12` },
    { label: '올해', start: `${year}-01`, end: `${year}-12` },
    { label: '전년도', start: `${year - 1}-01`, end: `${year - 1}-12` },
  ]

  const presets = tab === 'daily' ? dailyPresets : monthlyPresets

  // 매장 목록
  useEffect(() => {
    async function fetchStores() {
      const table = tab === 'daily' ? 'daily_sales' : 'monthly_sales'
      const { data } = await supabase.from(table).select('store_name, store_code')
      if (data) {
        const unique = new Map()
        data.forEach(d => {
          if (!unique.has(d.store_name)) unique.set(d.store_name, d.store_code)
        })
        const list = Array.from(unique.entries())
          .map(([name, code]) => ({ store_name: name, store_code: code }))
          .sort((a, b) => a.store_name.localeCompare(b.store_name, 'ko'))
        setStoreList(list)
      }
    }
    fetchStores()
  }, [tab])

  const filteredStores = useMemo(() => {
    if (!storeSearch.trim()) return []
    return storeList.filter(s =>
      s.store_name.includes(storeSearch) ||
      (s.store_code && s.store_code.includes(storeSearch))
    )
  }, [storeSearch, storeList])

  // 탭 전환 시 결과 초기화
  function switchTab(t) {
    setTab(t)
    setSalesData([])
    setSearched(false)
    setActivePreset(null)
    setSelectedStore(null)
    setStoreSearch('')
  }

  // 조회
  const handleSearch = useCallback(async () => {
    setLoading(true)
    setSearched(true)

    if (tab === 'daily') {
      if (!startDate || !endDate) { setLoading(false); return }
      let query = supabase
        .from('daily_sales')
        .select('store_name, store_code, sale_date, sale_amount')
        .gte('sale_date', startDate)
        .lte('sale_date', endDate)
        .order('sale_date', { ascending: true })
      if (selectedStore) query = query.eq('store_name', selectedStore.store_name)

      const { data } = await query
      if (data) {
        const grouped = new Map()
        data.forEach(d => {
          if (!grouped.has(d.store_name)) {
            grouped.set(d.store_name, { store_name: d.store_name, store_code: d.store_code, total_amount: 0 })
          }
          grouped.get(d.store_name).total_amount += d.sale_amount
        })
        setSalesData(Array.from(grouped.values()).sort((a, b) => b.total_amount - a.total_amount))
      }
    } else {
      if (!startMonth || !endMonth) { setLoading(false); return }
      let query = supabase
        .from('monthly_sales')
        .select('store_name, store_code, sale_month, card_amount, cash_no_receipt, cash_receipt, transfer_amount, cash_receipt_transfer, expense_amount')
        .gte('sale_month', startMonth)
        .lte('sale_month', endMonth)
        .order('sale_month', { ascending: true })
      if (selectedStore) query = query.eq('store_name', selectedStore.store_name)

      const { data } = await query
      if (data) {
        const grouped = new Map()
        data.forEach(d => {
          if (!grouped.has(d.store_name)) {
            grouped.set(d.store_name, {
              store_name: d.store_name, store_code: d.store_code,
              total_card: 0, total_cash_no_receipt: 0, total_cash_receipt: 0,
              total_transfer: 0, total_cash_receipt_transfer: 0, total_expense: 0,
            })
          }
          const g = grouped.get(d.store_name)
          g.total_card += d.card_amount
          g.total_cash_no_receipt += d.cash_no_receipt
          g.total_cash_receipt += d.cash_receipt
          g.total_transfer += d.transfer_amount
          g.total_cash_receipt_transfer += d.cash_receipt_transfer
          g.total_expense += d.expense_amount
        })
        setSalesData(
          Array.from(grouped.values())
            .map(d => ({ ...d, total_amount: d.total_card + d.total_cash_no_receipt + d.total_cash_receipt + d.total_transfer }))
            .sort((a, b) => b.total_amount - a.total_amount)
        )
      }
    }

    setLoading(false)
  }, [tab, startDate, endDate, startMonth, endMonth, selectedStore])

  const totalAmount = useMemo(() => salesData.reduce((s, d) => s + (d.total_amount || 0), 0), [salesData])
  const totalCard = useMemo(() => salesData.reduce((s, d) => s + (d.total_card || 0), 0), [salesData])
  const totalCashNoReceipt = useMemo(() => salesData.reduce((s, d) => s + (d.total_cash_no_receipt || 0), 0), [salesData])
  const totalCashReceipt = useMemo(() => salesData.reduce((s, d) => s + (d.total_cash_receipt || 0), 0), [salesData])
  const totalTransfer = useMemo(() => salesData.reduce((s, d) => s + (d.total_transfer || 0), 0), [salesData])
  const totalCashReceiptTransfer = useMemo(() => salesData.reduce((s, d) => s + (d.total_cash_receipt_transfer || 0), 0), [salesData])
  const totalExpense = useMemo(() => salesData.reduce((s, d) => s + (d.total_expense || 0), 0), [salesData])

  const fmt = (n) => new Intl.NumberFormat('ko-KR').format(n)

  return (
    <main className="min-h-screen bg-background">
      <Header title="매출 대시보드" showBack />

      <div className="max-w-[672px] mx-auto px-5 pb-10">
        {/* 탭 */}
        <div className="flex mt-6 mb-4 bg-primary/5 rounded-2xl p-1">
          <button
            onClick={() => switchTab('daily')}
            className={`flex-1 py-2.5 rounded-xl text-[14px] font-bold transition-colors ${
              tab === 'daily' ? 'bg-primary text-white shadow-sm' : 'text-primary'
            }`}
          >
            일별매출
          </button>
          <button
            onClick={() => switchTab('monthly')}
            className={`flex-1 py-2.5 rounded-xl text-[14px] font-bold transition-colors ${
              tab === 'monthly' ? 'bg-primary text-white shadow-sm' : 'text-primary'
            }`}
          >
            월별매출
          </button>
        </div>

        {/* 필터 */}
        <Card className="rounded-2xl border-border/40 shadow-sm mb-6">
          <CardContent className="p-5 space-y-4">
            {/* 기간 프리셋 */}
            <div>
              <label className="text-[13px] font-bold text-foreground mb-2 block">기간</label>
              <div className="flex flex-wrap gap-1.5">
                {presets.map(p => (
                  <button
                    key={p.label}
                    onClick={() => {
                      if (tab === 'daily') { setStartDate(p.start); setEndDate(p.end) }
                      else { setStartMonth(p.start); setEndMonth(p.end) }
                      setActivePreset(p.label)
                    }}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
                      activePreset === p.label
                        ? 'bg-primary text-white'
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 날짜/월 입력 */}
            <div>
              <label className="text-[13px] font-bold text-foreground mb-2 block">
                {tab === 'daily' ? '일자' : '월'}
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type={tab === 'daily' ? 'date' : 'month'}
                  value={tab === 'daily' ? startDate : startMonth}
                  onChange={e => {
                    tab === 'daily' ? setStartDate(e.target.value) : setStartMonth(e.target.value)
                    setActivePreset(null)
                  }}
                  className="h-11 text-[14px] rounded-xl flex-1"
                />
                <span className="text-[13px] text-muted-foreground shrink-0">~</span>
                <Input
                  type={tab === 'daily' ? 'date' : 'month'}
                  value={tab === 'daily' ? endDate : endMonth}
                  onChange={e => {
                    tab === 'daily' ? setEndDate(e.target.value) : setEndMonth(e.target.value)
                    setActivePreset(null)
                  }}
                  className="h-11 text-[14px] rounded-xl flex-1"
                />
              </div>
            </div>

            {/* 매장 */}
            <div>
              <label className="text-[13px] font-bold text-foreground mb-2 block">매장</label>
              {selectedStore ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <div>
                    <p className="text-[14px] font-bold">{selectedStore.store_name}</p>
                    {selectedStore.store_code && (
                      <p className="text-[12px] text-muted-foreground font-mono">{selectedStore.store_code}</p>
                    )}
                  </div>
                  <button
                    onClick={() => { setSelectedStore(null); setStoreSearch('') }}
                    className="text-[12px] font-semibold text-primary hover:underline"
                  >
                    전체로 변경
                  </button>
                </div>
              ) : (
                <>
                  <Input
                    value={storeSearch}
                    onChange={e => setStoreSearch(e.target.value)}
                    placeholder="전체 (매장명 또는 코드로 검색)"
                    className="h-11 text-[14px] rounded-xl"
                  />
                  {filteredStores.length > 0 && (
                    <div className="mt-2 max-h-[200px] overflow-y-auto rounded-xl border border-border/40">
                      {filteredStores.map(s => (
                        <button
                          key={s.store_name}
                          onClick={() => { setSelectedStore(s); setStoreSearch(s.store_name) }}
                          className="w-full text-left px-4 py-2.5 hover:bg-secondary/50 transition-colors border-b border-border/20 last:border-0"
                        >
                          <p className="text-[14px] font-medium">{s.store_name}</p>
                          {s.store_code && (
                            <p className="text-[12px] text-primary font-mono mt-0.5">{s.store_code}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 조회 */}
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-primary text-white font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {loading ? '조회 중...' : '조회하기'}
            </button>
          </CardContent>
        </Card>

        {/* 결과 */}
        {searched && !loading && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[14px] text-muted-foreground">{salesData.length}개 매장</p>
              <p className="text-[15px] font-bold text-foreground">합계 {fmt(totalAmount)} 원</p>
            </div>

            {salesData.length > 0 && (
              <Card className={`rounded-2xl border-border/40 shadow-sm ${tab === 'monthly' ? 'overflow-x-auto' : 'overflow-hidden'}`}>
                {/* 헤더 */}
                {tab === 'daily' ? (
                  <div className="bg-primary/5 border-b border-primary/10 px-4 py-3 flex items-center">
                    <span className="text-[12px] font-bold text-primary w-[32px] shrink-0 text-center">#</span>
                    <span className="text-[12px] font-bold text-primary flex-1">매장</span>
                    <span className="text-[12px] font-bold text-primary text-right w-[110px] shrink-0">판매금액</span>
                  </div>
                ) : (
                  <div className="bg-primary/5 border-b border-primary/10 px-4 py-3 flex items-center min-w-[780px]">
                    <span className="text-[11px] font-bold text-primary w-[120px] shrink-0">매장명</span>
                    <span className="text-[11px] font-bold text-primary text-right w-[90px] shrink-0">카드</span>
                    <span className="text-[11px] font-bold text-primary text-right w-[90px] shrink-0">현금(무)</span>
                    <span className="text-[11px] font-bold text-primary text-right w-[90px] shrink-0">현금영수증</span>
                    <span className="text-[11px] font-bold text-primary text-right w-[90px] shrink-0">이체</span>
                    <span className="text-[11px] font-bold text-primary text-right w-[90px] shrink-0">영수증-이체</span>
                    <span className="text-[11px] font-bold text-primary text-right w-[90px] shrink-0">비용</span>
                  </div>
                )}

                {/* 데이터 행 */}
                <div className="divide-y divide-border/30">
                  {salesData.map((d, i) => (
                    <div key={d.store_name} className={`px-4 py-3 flex items-center hover:bg-secondary/30 transition-colors ${tab === 'monthly' ? 'min-w-[780px]' : ''}`}>
                      {tab === 'daily' ? (
                        <>
                          <div className="w-[32px] shrink-0 text-center">
                            <span className="text-[12px] text-muted-foreground font-mono">{i + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-medium text-foreground truncate">{d.store_name}</p>
                            {d.store_code && <p className="text-[11px] text-muted-foreground font-mono">{d.store_code}</p>}
                          </div>
                          <div className="w-[110px] shrink-0 text-right">
                            <p className="text-[14px] font-bold text-foreground">{fmt(d.total_amount)} <span className="text-[11px] font-normal text-muted-foreground">원</span></p>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center w-full">
                          <div className="w-[120px] shrink-0">
                            <p className="text-[12px] font-medium text-foreground truncate">{d.store_name}</p>
                          </div>
                          <div className="w-[90px] shrink-0 text-right">
                            <p className="text-[12px] text-foreground">{fmt(d.total_card)}</p>
                          </div>
                          <div className="w-[90px] shrink-0 text-right">
                            <p className="text-[12px] text-foreground">{fmt(d.total_cash_no_receipt)}</p>
                          </div>
                          <div className="w-[90px] shrink-0 text-right">
                            <p className="text-[12px] text-foreground">{fmt(d.total_cash_receipt)}</p>
                          </div>
                          <div className="w-[90px] shrink-0 text-right">
                            <p className="text-[12px] text-foreground">{fmt(d.total_transfer)}</p>
                          </div>
                          <div className="w-[90px] shrink-0 text-right">
                            <p className="text-[12px] text-foreground">{fmt(d.total_cash_receipt_transfer)}</p>
                          </div>
                          <div className="w-[90px] shrink-0 text-right">
                            <p className="text-[12px] text-foreground">{fmt(d.total_expense)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 일별 합계행 */}
                {tab === 'daily' && (
                  <div className="bg-primary/5 border-t border-primary/10 px-4 py-3 flex items-center">
                    <div className="w-[32px] shrink-0" />
                    <div className="flex-1"><p className="text-[13px] font-bold text-primary">{salesData.length}개 매장 합계</p></div>
                    <div className="w-[110px] shrink-0 text-right"><p className="text-[13px] font-bold text-primary">{fmt(totalAmount)} 원</p></div>
                  </div>
                )}

                {/* 월별 합계행 */}
                {tab === 'monthly' && (
                  <div className="bg-primary/5 border-t border-primary/10 px-4 py-3 flex items-center min-w-[780px]">
                    <div className="w-[120px] shrink-0"><p className="text-[11px] font-bold text-primary">합계</p></div>
                    <div className="w-[90px] shrink-0 text-right"><p className="text-[11px] font-bold text-primary">{fmt(totalCard)}</p></div>
                    <div className="w-[90px] shrink-0 text-right"><p className="text-[11px] font-bold text-primary">{fmt(totalCashNoReceipt)}</p></div>
                    <div className="w-[90px] shrink-0 text-right"><p className="text-[11px] font-bold text-primary">{fmt(totalCashReceipt)}</p></div>
                    <div className="w-[90px] shrink-0 text-right"><p className="text-[11px] font-bold text-primary">{fmt(totalTransfer)}</p></div>
                    <div className="w-[90px] shrink-0 text-right"><p className="text-[11px] font-bold text-primary">{fmt(totalCashReceiptTransfer)}</p></div>
                    <div className="w-[90px] shrink-0 text-right"><p className="text-[11px] font-bold text-primary">{fmt(totalExpense)}</p></div>
                  </div>
                )}
              </Card>
            )}

            {salesData.length === 0 && (
              <div className="text-center py-16">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mx-auto mb-3 text-muted-foreground/40">
                  <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M14 26C14 26 16 22 20 22C24 22 26 26 26 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="15" cy="16" r="1.5" fill="currentColor"/>
                  <circle cx="25" cy="16" r="1.5" fill="currentColor"/>
                </svg>
                <p className="text-[14px] text-muted-foreground">해당 기간에 매출 데이터가 없습니다</p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
