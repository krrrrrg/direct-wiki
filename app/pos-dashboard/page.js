'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '../../components/shared'

export default function PosDashboardPage() {
  const today = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [storeSearch, setStoreSearch] = useState('')
  const [selectedStore, setSelectedStore] = useState(null)
  const [storeList, setStoreList] = useState([])
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // 매장 목록 가져오기 (daily_sales에 있는 매장명 기준)
  useEffect(() => {
    async function fetchStores() {
      const { data } = await supabase
        .from('daily_sales')
        .select('store_name, store_code')
      if (data) {
        const unique = new Map()
        data.forEach(d => {
          if (!unique.has(d.store_name)) {
            unique.set(d.store_name, d.store_code)
          }
        })
        const list = Array.from(unique.entries())
          .map(([name, code]) => ({ store_name: name, store_code: code }))
          .sort((a, b) => a.store_name.localeCompare(b.store_name, 'ko'))
        setStoreList(list)
      }
    }
    fetchStores()
  }, [])

  const filteredStores = useMemo(() => {
    if (!storeSearch.trim()) return []
    return storeList.filter(s =>
      s.store_name.includes(storeSearch) ||
      (s.store_code && s.store_code.includes(storeSearch))
    )
  }, [storeSearch, storeList])

  const handleSearch = useCallback(async () => {
    if (!startDate || !endDate) return
    setLoading(true)
    setSearched(true)

    let query = supabase
      .from('daily_sales')
      .select('store_name, store_code, sale_date, sale_amount')
      .gte('sale_date', startDate)
      .lte('sale_date', endDate)
      .order('sale_date', { ascending: true })

    if (selectedStore) {
      query = query.eq('store_name', selectedStore.store_name)
    }

    const { data } = await query

    if (data) {
      // 매장별로 합산
      const grouped = new Map()
      data.forEach(d => {
        const key = d.store_name
        if (!grouped.has(key)) {
          grouped.set(key, {
            store_name: d.store_name,
            store_code: d.store_code,
            total_amount: 0,
          })
        }
        grouped.get(key).total_amount += d.sale_amount
      })

      const result = Array.from(grouped.values())
        .sort((a, b) => b.total_amount - a.total_amount)

      setSalesData(result)
    }

    setLoading(false)
  }, [startDate, endDate, selectedStore])

  // 전체 합계
  const totalAmount = useMemo(() =>
    salesData.reduce((sum, d) => sum + d.total_amount, 0), [salesData])

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount)
  }

  return (
    <main className="min-h-screen bg-background">
      <Header title="일별매출" showBack />

      <div className="max-w-[672px] mx-auto px-5 pb-10">
        {/* 필터 영역 */}
        <Card className="rounded-2xl border-border/40 shadow-sm mt-6 mb-6">
          <CardContent className="p-5 space-y-4">
            {/* 일자 */}
            <div>
              <label className="text-[13px] font-bold text-foreground mb-2 block">일자</label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="h-11 text-[14px] rounded-xl flex-1"
                />
                <span className="text-[13px] text-muted-foreground shrink-0">~</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
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

            {/* 조회 버튼 */}
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

        {/* 결과 영역 */}
        {searched && !loading && (
          <>
            {/* 요약 */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[14px] text-muted-foreground">
                {salesData.length}개 매장
              </p>
              <p className="text-[15px] font-bold text-foreground">
                합계 {formatAmount(totalAmount)} 원
              </p>
            </div>

            {/* 테이블 헤더 */}
            {salesData.length > 0 && (
              <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
                <div className="bg-primary/5 border-b border-primary/10 px-4 py-3 flex items-center">
                  <span className="text-[12px] font-bold text-primary w-[72px] shrink-0">매장코드</span>
                  <span className="text-[12px] font-bold text-primary flex-1">매장명</span>
                  <span className="text-[12px] font-bold text-primary text-right w-[100px] shrink-0">판매금액</span>
                </div>

                <div className="divide-y divide-border/30">
                  {salesData.map((d, i) => (
                    <div key={d.store_name} className="px-4 py-3.5 flex items-center hover:bg-secondary/30 transition-colors">
                      <div className="w-[72px] shrink-0">
                        <span className="text-[13px] text-muted-foreground font-mono">
                          {d.store_code || '-'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-foreground truncate">
                          {d.store_name}
                        </p>
                      </div>
                      <div className="w-[100px] shrink-0 text-right">
                        <p className="text-[14px] font-bold text-foreground">
                          {formatAmount(d.total_amount)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">원</p>
                      </div>
                    </div>
                  ))}
                </div>
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
