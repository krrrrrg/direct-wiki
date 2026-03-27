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

  // 일별 프리셋용 날짜 계산
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const dayOfWeek = now.getDay() // 0=일 1=월 ... 6=토
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const thisMonday = new Date(now)
  thisMonday.setDate(thisMonday.getDate() - mondayOffset)
  const thisMondayStr = thisMonday.toISOString().split('T')[0]

  const lastMonday = new Date(thisMonday)
  lastMonday.setDate(lastMonday.getDate() - 7)
  const lastMondayStr = lastMonday.toISOString().split('T')[0]
  const lastSunday = new Date(thisMonday)
  lastSunday.setDate(lastSunday.getDate() - 1)
  const lastSundayStr = lastSunday.toISOString().split('T')[0]

  const prevMonthStart = `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-01`
  const prevMonthEnd = `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-${new Date(month === 0 ? year - 1 : year, month === 0 ? 12 : month, 0).getDate()}`

  const twoDaysAgo = new Date(now)
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0]
  const threeDaysAgo = new Date(now)
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0]

  const dailyPresets = [
    { label: '오늘', start: today, end: today },
    { label: '어제', start: yesterdayStr, end: yesterdayStr },
    { label: '2일전', start: twoDaysAgoStr, end: twoDaysAgoStr },
    { label: '3일전', start: threeDaysAgoStr, end: threeDaysAgoStr },
    { label: '이번주', start: thisMondayStr, end: today },
    { label: '저번주', start: lastMondayStr, end: lastSundayStr },
    { label: '최근 7일', start: new Date(now.getTime() - 6 * 86400000).toISOString().split('T')[0], end: today },
    { label: '최근 30일', start: new Date(now.getTime() - 29 * 86400000).toISOString().split('T')[0], end: today },
    { label: '이번달', start: `${year}-${String(month + 1).padStart(2, '0')}-01`, end: today },
    { label: '저번달', start: prevMonthStart, end: prevMonthEnd },
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
      const { data } = await supabase.from(table).select('store_name')
      if (data) {
        const unique = new Set()
        data.forEach(d => unique.add(d.store_name))
        const list = Array.from(unique)
          .map(name => ({ store_name: name }))
          .sort((a, b) => a.store_name.localeCompare(b.store_name, 'ko'))
        setStoreList(list)
      }
    }
    fetchStores()
  }, [tab])

  const filteredStores = useMemo(() => {
    if (!storeSearch.trim()) return []
    return storeList.filter(s => s.store_name.includes(storeSearch))
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
        .select('store_name, sale_date, sale_amount')
        .gte('sale_date', startDate)
        .lte('sale_date', endDate)
        .order('sale_date', { ascending: true })
      if (selectedStore) query = query.eq('store_name', selectedStore.store_name)

      const { data } = await query
      if (data) {
        const grouped = new Map()
        data.forEach(d => {
          if (!grouped.has(d.store_name)) {
            grouped.set(d.store_name, { store_name: d.store_name, total_amount: 0 })
          }
          grouped.get(d.store_name).total_amount += d.sale_amount
        })
        setSalesData(Array.from(grouped.values()).sort((a, b) => b.total_amount - a.total_amount))
      }
    } else {
      if (!startMonth || !endMonth) { setLoading(false); return }
      let query = supabase
        .from('monthly_sales')
        .select('store_name, sale_month, card_amount, cash_no_receipt, cash_receipt, transfer_amount, expense_amount')
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
              store_name: d.store_name,
              total_card: 0, total_cash_no_receipt: 0, total_cash_receipt: 0,
              total_transfer: 0, total_expense: 0,
            })
          }
          const g = grouped.get(d.store_name)
          g.total_card += d.card_amount
          g.total_cash_no_receipt += d.cash_no_receipt
          g.total_cash_receipt += d.cash_receipt
          g.total_transfer += d.transfer_amount
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
            {tab === 'daily' ? (
              <div>
                <label className="text-[13px] font-bold text-foreground mb-2 block">일자</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={e => { setStartDate(e.target.value); setActivePreset(null) }}
                    className="h-11 text-[14px] rounded-xl flex-1"
                  />
                  <span className="text-[13px] text-muted-foreground shrink-0">~</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={e => { setEndDate(e.target.value); setActivePreset(null) }}
                    className="h-11 text-[14px] rounded-xl flex-1"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-[13px] font-bold text-foreground mb-2 block">{year}년</label>
                <div className="grid grid-cols-6 gap-1.5">
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => {
                    const mv = `${year}-${String(m).padStart(2, '0')}`
                    const isSelected = startMonth === mv && endMonth === mv
                    const isInRange = mv >= startMonth && mv <= endMonth && startMonth !== endMonth
                    return (
                      <button
                        key={m}
                        onClick={() => {
                          setStartMonth(mv)
                          setEndMonth(mv)
                          setActivePreset(null)
                        }}
                        className={`py-2 rounded-xl text-[13px] font-semibold transition-colors ${
                          isSelected
                            ? 'bg-primary text-white'
                            : isInRange
                              ? 'bg-primary/20 text-primary'
                              : 'bg-primary/5 text-foreground hover:bg-primary/10'
                        }`}
                      >
                        {m}월
                      </button>
                    )
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  선택: {startMonth} ~ {endMonth}
                </p>
              </div>
            )}

            {/* 매장 */}
            <div>
              <label className="text-[13px] font-bold text-foreground mb-2 block">매장</label>
              {selectedStore ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <div>
                    <p className="text-[14px] font-bold">{selectedStore.store_name}</p>
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
                    placeholder="전체 (매장명으로 검색)"
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
            <div className="mb-4 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[14px] text-muted-foreground">{salesData.length}개 매장</p>
                <p className="text-[15px] font-bold text-foreground">합계 {fmt(totalAmount)} 원</p>
              </div>
              <p className="text-[11px] text-muted-foreground">
                조회 기간: {tab === 'daily' ? `${startDate} ~ ${endDate}` : `${startMonth} ~ ${endMonth}`}
              </p>
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
                  <div className="bg-primary/5 border-b border-primary/10 px-4 py-3 flex items-center min-w-[680px]">
                    <span className="text-[11px] font-bold text-primary w-[120px] shrink-0">매장명</span>
                    <span className="text-[11px] font-bold text-primary text-right w-[90px] shrink-0">카드</span>
                    <span className="text-[11px] font-bold text-primary text-right w-[90px] shrink-0">현금(무)</span>
                    <span className="text-[11px] font-bold text-primary text-right w-[90px] shrink-0">현금영수증</span>
                    <span className="text-[11px] font-bold text-primary text-right w-[90px] shrink-0">이체</span>
                    <span className="text-[11px] font-bold text-primary text-right w-[90px] shrink-0">비용</span>
                  </div>
                )}

                {/* 데이터 행 */}
                <div className="divide-y divide-border/30">
                  {salesData.map((d, i) => (
                    <div key={d.store_name} className={`px-4 py-3 flex items-center hover:bg-secondary/30 transition-colors ${tab === 'monthly' ? 'min-w-[680px]' : ''}`}>
                      {tab === 'daily' ? (
                        <>
                          <div className="w-[32px] shrink-0 text-center">
                            <span className="text-[12px] text-muted-foreground font-mono">{i + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-medium text-foreground truncate">{d.store_name}</p>
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
                  <div className="bg-primary/5 border-t border-primary/10 px-4 py-3 flex items-center min-w-[680px]">
                    <div className="w-[120px] shrink-0"><p className="text-[11px] font-bold text-primary">합계</p></div>
                    <div className="w-[90px] shrink-0 text-right"><p className="text-[11px] font-bold text-primary">{fmt(totalCard)}</p></div>
                    <div className="w-[90px] shrink-0 text-right"><p className="text-[11px] font-bold text-primary">{fmt(totalCashNoReceipt)}</p></div>
                    <div className="w-[90px] shrink-0 text-right"><p className="text-[11px] font-bold text-primary">{fmt(totalCashReceipt)}</p></div>
                    <div className="w-[90px] shrink-0 text-right"><p className="text-[11px] font-bold text-primary">{fmt(totalTransfer)}</p></div>
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
