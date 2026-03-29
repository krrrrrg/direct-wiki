'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '../../components/shared'
import dynamic from 'next/dynamic'
import * as XLSX from 'xlsx'

const StoreChartLazy = dynamic(() => import('./StoreChart'), { ssr: false })

export default function PosDashboardPage() {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const year = now.getFullYear()
  const month = now.getMonth()
  const currentMonth = `${year}-${String(month + 1).padStart(2, '0')}`

  const [tab, setTab] = useState('daily')
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [startMonth, setStartMonth] = useState(currentMonth)
  const [endMonth, setEndMonth] = useState(currentMonth)
  const [storeSearch, setStoreSearch] = useState('')
  const [selectedStore, setSelectedStore] = useState(null)
  const [storeList, setStoreList] = useState([])
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [activePreset, setActivePreset] = useState(null)
  const [expandedStore, setExpandedStore] = useState(null)
  const [rawData, setRawData] = useState([])

  // 일별 프리셋
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const thisMonday = new Date(now); thisMonday.setDate(thisMonday.getDate() - mondayOffset)
  const thisMondayStr = thisMonday.toISOString().split('T')[0]
  const lastMonday = new Date(thisMonday); lastMonday.setDate(lastMonday.getDate() - 7)
  const lastMondayStr = lastMonday.toISOString().split('T')[0]
  const lastSunday = new Date(thisMonday); lastSunday.setDate(lastSunday.getDate() - 1)
  const lastSundayStr = lastSunday.toISOString().split('T')[0]
  const prevMonthStart = `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-01`
  const prevMonthEnd = `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-${new Date(month === 0 ? year - 1 : year, month === 0 ? 12 : month, 0).getDate()}`
  const twoDaysAgo = new Date(now); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0]
  const threeDaysAgo = new Date(now); threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
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

  // 매장 목록 (daily_sales 하나에서)
  useEffect(() => {
    async function fetchStores() {
      const { data } = await supabase.from('daily_sales').select('store_name')
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
  }, [])

  const filteredStores = useMemo(() => {
    if (!storeSearch.trim()) return []
    return storeList.filter(s => s.store_name.includes(storeSearch))
  }, [storeSearch, storeList])

  function switchTab(t) {
    setTab(t)
    setSalesData([])
    setSearched(false)
    setActivePreset(null)
    setSelectedStore(null)
    setStoreSearch('')
  }

  // 페이지네이션
  async function fetchAll(filters) {
    const PAGE = 1000
    let allData = []
    let from = 0
    while (true) {
      let query = supabase.from('daily_sales')
        .select('store_name, sale_date, sale_amount, card_amount, cash_no_receipt, cash_receipt, transfer_amount')
      filters.forEach(f => { query = query[f.op](f.col, f.val) })
      query = query.order('sale_date', { ascending: true }).range(from, from + PAGE - 1)
      const { data, error } = await query
      if (error) { console.error(error); break }
      if (!data || data.length === 0) break
      allData = allData.concat(data)
      if (data.length < PAGE) break
      from += PAGE
    }
    return allData
  }

  // 조회
  const handleSearch = useCallback(async () => {
    setLoading(true)
    setSearched(true)
    setExpandedStore(null)

    let filters
    if (tab === 'daily') {
      if (!startDate || !endDate) { setLoading(false); return }
      filters = [
        { op: 'gte', col: 'sale_date', val: startDate },
        { op: 'lte', col: 'sale_date', val: endDate },
      ]
    } else {
      if (!startMonth || !endMonth) { setLoading(false); return }
      // 월말 날짜 계산
      const [ey, em] = endMonth.split('-').map(Number)
      const lastDay = new Date(ey, em, 0).getDate()
      filters = [
        { op: 'gte', col: 'sale_date', val: `${startMonth}-01` },
        { op: 'lte', col: 'sale_date', val: `${endMonth}-${String(lastDay).padStart(2, '0')}` },
      ]
    }
    if (selectedStore) filters.push({ op: 'eq', col: 'store_name', val: selectedStore.store_name })

    const data = await fetchAll(filters)
    setRawData(data)

    if (data.length > 0) {
      const grouped = new Map()
      data.forEach(d => {
        const key = tab === 'daily' ? d.store_name : d.store_name
        if (!grouped.has(key)) {
          grouped.set(key, {
            store_name: d.store_name,
            total_amount: 0, total_card: 0, total_cash_no_receipt: 0,
            total_cash_receipt: 0, total_transfer: 0,
          })
        }
        const g = grouped.get(key)
        g.total_amount += d.sale_amount || 0
        g.total_card += d.card_amount || 0
        g.total_cash_no_receipt += d.cash_no_receipt || 0
        g.total_cash_receipt += d.cash_receipt || 0
        g.total_transfer += d.transfer_amount || 0
      })
      setSalesData(Array.from(grouped.values()).sort((a, b) => b.total_amount - a.total_amount))
    } else {
      setSalesData([])
    }

    setLoading(false)
  }, [tab, startDate, endDate, startMonth, endMonth, selectedStore])

  const totalAmount = useMemo(() => salesData.reduce((s, d) => s + (d.total_amount || 0), 0), [salesData])
  const totalCard = useMemo(() => salesData.reduce((s, d) => s + (d.total_card || 0), 0), [salesData])
  const totalCashNoReceipt = useMemo(() => salesData.reduce((s, d) => s + (d.total_cash_no_receipt || 0), 0), [salesData])
  const totalCashReceipt = useMemo(() => salesData.reduce((s, d) => s + (d.total_cash_receipt || 0), 0), [salesData])
  const totalTransfer = useMemo(() => salesData.reduce((s, d) => s + (d.total_transfer || 0), 0), [salesData])

  const fmt = (n) => new Intl.NumberFormat('ko-KR').format(n)

  const downloadExcel = () => {
    const rows = salesData.map((d, i) => ({
      ...(tab === 'daily' ? { '순위': i + 1 } : {}),
      '매장명': d.store_name,
      '카드': d.total_card,
      '현금(무)': d.total_cash_no_receipt,
      '현금영수증': d.total_cash_receipt,
      '이체': d.total_transfer,
      '합계': d.total_amount,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '매출')
    const filename = tab === 'daily' ? `일별매출_${startDate}_${endDate}.xlsx` : `월별매출_${startMonth}_${endMonth}.xlsx`
    XLSX.writeFile(wb, filename)
  }

  const getStoreChartData = (storeName) => {
    try {
      if (tab === 'daily') {
        return rawData
          .filter(d => d.store_name === storeName)
          .map(d => ({ date: (d.sale_date || '').slice(5), amount: d.sale_amount || 0 }))
      } else {
        // 월별: 일별 데이터를 월 기준으로 합산
        const monthly = {}
        rawData.filter(d => d.store_name === storeName).forEach(d => {
          const m = (d.sale_date || '').slice(0, 7)
          if (!monthly[m]) monthly[m] = 0
          monthly[m] += d.sale_amount || 0
        })
        return Object.entries(monthly).sort().map(([m, v]) => ({ month: m.slice(5) + '월', 총액: v }))
      }
    } catch { return [] }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header title="매출 대시보드" showBack />

      <div className="max-w-[672px] mx-auto px-5 pb-10">
        {/* 탭 */}
        <div className="flex mt-6 mb-4 bg-primary/5 rounded-2xl p-1">
          <button onClick={() => switchTab('daily')} className={`flex-1 py-2.5 rounded-xl text-[14px] font-bold transition-colors ${tab === 'daily' ? 'bg-primary text-white shadow-sm' : 'text-primary'}`}>일별매출</button>
          <button onClick={() => switchTab('monthly')} className={`flex-1 py-2.5 rounded-xl text-[14px] font-bold transition-colors ${tab === 'monthly' ? 'bg-primary text-white shadow-sm' : 'text-primary'}`}>월별매출</button>
        </div>

        {/* 필터 */}
        <Card className="rounded-2xl border-border/40 shadow-sm mb-6">
          <CardContent className="p-5 space-y-4">
            <div>
              <label className="text-[13px] font-bold text-foreground mb-2 block">기간</label>
              <div className="flex flex-wrap gap-1.5">
                {presets.map(p => (
                  <button key={p.label} onClick={() => {
                    if (tab === 'daily') { setStartDate(p.start); setEndDate(p.end) }
                    else { setStartMonth(p.start); setEndMonth(p.end) }
                    setActivePreset(p.label)
                  }} className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${activePreset === p.label ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>{p.label}</button>
                ))}
              </div>
            </div>

            {tab === 'daily' ? (
              <div>
                <label className="text-[13px] font-bold text-foreground mb-2 block">일자</label>
                <div className="flex items-center gap-2">
                  <Input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setActivePreset(null) }} className="h-11 text-[14px] rounded-xl flex-1" />
                  <span className="text-[13px] text-muted-foreground shrink-0">~</span>
                  <Input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); setActivePreset(null) }} className="h-11 text-[14px] rounded-xl flex-1" />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-[13px] font-bold text-foreground mb-2 block">월</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center flex-1 h-11 rounded-xl border border-border/40 bg-background">
                    <button onClick={() => { const [y,m]=startMonth.split('-').map(Number); setStartMonth(m===1?`${y-1}-12`:`${y}-${String(m-1).padStart(2,'0')}`); setActivePreset(null) }} className="px-3 h-full text-muted-foreground hover:text-primary transition-colors">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <span className="flex-1 text-center text-[14px] font-medium">{startMonth}</span>
                    <button onClick={() => { const [y,m]=startMonth.split('-').map(Number); setStartMonth(m===12?`${y+1}-01`:`${y}-${String(m+1).padStart(2,'0')}`); setActivePreset(null) }} className="px-3 h-full text-muted-foreground hover:text-primary transition-colors">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                  <span className="text-[13px] text-muted-foreground shrink-0">~</span>
                  <div className="flex items-center flex-1 h-11 rounded-xl border border-border/40 bg-background">
                    <button onClick={() => { const [y,m]=endMonth.split('-').map(Number); setEndMonth(m===1?`${y-1}-12`:`${y}-${String(m-1).padStart(2,'0')}`); setActivePreset(null) }} className="px-3 h-full text-muted-foreground hover:text-primary transition-colors">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <span className="flex-1 text-center text-[14px] font-medium">{endMonth}</span>
                    <button onClick={() => { const [y,m]=endMonth.split('-').map(Number); setEndMonth(m===12?`${y+1}-01`:`${y}-${String(m+1).padStart(2,'0')}`); setActivePreset(null) }} className="px-3 h-full text-muted-foreground hover:text-primary transition-colors">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-[13px] font-bold text-foreground mb-2 block">매장</label>
              {selectedStore ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <p className="text-[14px] font-bold">{selectedStore.store_name}</p>
                  <button onClick={() => { setSelectedStore(null); setStoreSearch('') }} className="text-[12px] font-semibold text-primary hover:underline">전체로 변경</button>
                </div>
              ) : (
                <>
                  <Input value={storeSearch} onChange={e => setStoreSearch(e.target.value)} placeholder="전체 (매장명으로 검색)" className="h-11 text-[14px] rounded-xl" />
                  {filteredStores.length > 0 && (
                    <div className="mt-2 max-h-[200px] overflow-y-auto rounded-xl border border-border/40">
                      {filteredStores.map(s => (
                        <button key={s.store_name} onClick={() => { setSelectedStore(s); setStoreSearch(s.store_name) }} className="w-full text-left px-4 py-2.5 hover:bg-secondary/50 transition-colors border-b border-border/20 last:border-0">
                          <p className="text-[14px] font-medium">{s.store_name}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <button onClick={handleSearch} disabled={loading} className="w-full h-12 rounded-2xl bg-primary text-white font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              {loading ? '조회 중...' : '조회하기'}
            </button>
          </CardContent>
        </Card>

        {/* 결과 */}
        {searched && !loading && (
          <>
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[14px] text-muted-foreground">{salesData.length}개 매장</p>
                <p className="text-[15px] font-bold text-foreground">합계 {fmt(totalAmount)} 원</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">
                  조회 기간: {tab === 'daily' ? `${startDate} ~ ${endDate}` : `${startMonth} ~ ${endMonth}`}
                </p>
                {salesData.length > 0 && (
                  <button onClick={downloadExcel} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold hover:bg-primary/20 transition-colors">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2V8M6 8L4 6M6 8L8 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 10H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    엑셀 다운로드
                  </button>
                )}
              </div>
            </div>

            {salesData.length > 0 && (
              <Card className="rounded-2xl border-border/40 shadow-sm overflow-x-auto">
                {/* 헤더 */}
                <div className="bg-primary/5 border-b border-primary/10 px-4 py-3 flex items-center min-w-[600px]">
                  {tab === 'daily' && <span className="text-[11px] font-bold text-primary w-[32px] shrink-0 text-center">#</span>}
                  <span className="text-[11px] font-bold text-primary w-[110px] shrink-0">매장명</span>
                  <span className="text-[11px] font-bold text-primary text-right w-[80px] shrink-0">카드</span>
                  <span className="text-[11px] font-bold text-primary text-right w-[80px] shrink-0">현금(무)</span>
                  <span className="text-[11px] font-bold text-primary text-right w-[80px] shrink-0">현금영수증</span>
                  <span className="text-[11px] font-bold text-primary text-right w-[70px] shrink-0">이체</span>
                  <span className="text-[11px] font-bold text-primary text-right w-[90px] shrink-0">합계</span>
                </div>

                <div className="divide-y divide-border/30">
                  {salesData.map((d, i) => (
                    <div key={d.store_name}>
                      <div onClick={() => setExpandedStore(expandedStore === d.store_name ? null : d.store_name)}
                        className={`px-4 py-3 flex items-center hover:bg-secondary/30 transition-colors cursor-pointer min-w-[600px] ${expandedStore === d.store_name ? 'bg-primary/5' : ''}`}>
                        {tab === 'daily' && (
                          <div className="w-[32px] shrink-0 text-center">
                            <span className="text-[11px] text-muted-foreground font-mono">{i + 1}</span>
                          </div>
                        )}
                        <div className="w-[110px] shrink-0 flex items-center gap-1">
                          <p className="text-[12px] font-medium text-foreground truncate">{d.store_name}</p>
                          <svg width="8" height="8" viewBox="0 0 10 10" fill="none" className={`shrink-0 text-muted-foreground transition-transform ${expandedStore === d.store_name ? 'rotate-180' : ''}`}>
                            <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="w-[80px] shrink-0 text-right"><p className="text-[12px] text-foreground">{fmt(d.total_card)}</p></div>
                        <div className="w-[80px] shrink-0 text-right"><p className="text-[12px] text-foreground">{fmt(d.total_cash_no_receipt)}</p></div>
                        <div className="w-[80px] shrink-0 text-right"><p className="text-[12px] text-foreground">{fmt(d.total_cash_receipt)}</p></div>
                        <div className="w-[70px] shrink-0 text-right"><p className="text-[12px] text-foreground">{fmt(d.total_transfer)}</p></div>
                        <div className="w-[90px] shrink-0 text-right"><p className="text-[12px] font-bold text-foreground">{fmt(d.total_amount)}</p></div>
                      </div>

                      {expandedStore === d.store_name && (
                        <StoreChartLazy storeName={d.store_name} tab={tab} chartData={getStoreChartData(d.store_name)} />
                      )}
                    </div>
                  ))}
                </div>

                {/* 합계행 */}
                <div className="bg-primary/5 border-t border-primary/10 px-4 py-3 flex items-center min-w-[600px]">
                  {tab === 'daily' && <div className="w-[32px] shrink-0" />}
                  <div className="w-[110px] shrink-0"><p className="text-[11px] font-bold text-primary">합계</p></div>
                  <div className="w-[80px] shrink-0 text-right"><p className="text-[11px] font-bold text-primary">{fmt(totalCard)}</p></div>
                  <div className="w-[80px] shrink-0 text-right"><p className="text-[11px] font-bold text-primary">{fmt(totalCashNoReceipt)}</p></div>
                  <div className="w-[80px] shrink-0 text-right"><p className="text-[11px] font-bold text-primary">{fmt(totalCashReceipt)}</p></div>
                  <div className="w-[70px] shrink-0 text-right"><p className="text-[11px] font-bold text-primary">{fmt(totalTransfer)}</p></div>
                  <div className="w-[90px] shrink-0 text-right"><p className="text-[11px] font-bold text-primary">{fmt(totalAmount)}</p></div>
                </div>
              </Card>
            )}

            {salesData.length === 0 && (
              <div className="text-center py-16">
                <p className="text-[14px] text-muted-foreground">해당 기간에 매출 데이터가 없습니다</p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
