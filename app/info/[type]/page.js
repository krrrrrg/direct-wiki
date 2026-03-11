'use client'

import { use, useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { Header, Footer } from '../../../components/shared'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { notFound } from 'next/navigation'

export default function InfoPage({ params }) {
  const { type } = use(params)
  if (type !== 'store' && type !== 'staff') return notFound()

  const [query, setQuery] = useState('')
  const [storeResults, setStoreResults] = useState([])
  const [staffResults, setStaffResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [storeNotes, setStoreNotes] = useState({})

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

  const search = useCallback(async (q) => {
    if (!q.trim()) { setStoreResults([]); setStaffResults([]); return }
    setLoading(true)
    const t = q.trim()
    if (type === 'store') {
      const { data } = await supabase.from('stores').select('*')
        .or(`name.ilike.%${t}%,code.ilike.%${t}%`)
        .order('region').limit(30)
      setStoreResults(data || [])
      await fetchStoreNotes((data || []).map(s => s.id))
    } else {
      const { data } = await supabase.from('login_info').select('*')
        .or(`name.ilike.%${t}%,employee_id.ilike.%${t}%`)
        .order('branch').limit(30)
      setStaffResults(data || [])
    }
    setLoading(false)
  }, [type, fetchStoreNotes])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300)
    return () => clearTimeout(timer)
  }, [query, search])

  const title = type === 'store' ? 'POS 매장 정보' : 'POS 직원 정보'

  return (
    <main className="min-h-screen bg-background">
      <Header title={title} showBack />
      <div className="max-w-[480px] mx-auto px-5 pb-10">
        <div className="pt-6">
          <Input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={type === 'store' ? '매장명 또는 매장코드 검색' : '이름 또는 사번 검색'}
            className="h-[52px] text-[15px] rounded-2xl bg-card border-border/60 px-5 shadow-sm"
            autoFocus
          />
          {query.trim() && (
            <div className="mt-4">
              {loading ? (
                <p className="text-[13px] text-muted-foreground text-center py-10">검색 중...</p>
              ) : type === 'store' ? (
                storeResults.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground text-center py-10">검색 결과가 없습니다</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[12px] font-bold text-muted-foreground mb-2">{storeResults.length}건</p>
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
                staffResults.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground text-center py-10">검색 결과가 없습니다</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[12px] font-bold text-muted-foreground mb-2">{staffResults.length}건</p>
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
      </div>
      <Footer />
    </main>
  )
}
