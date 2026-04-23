'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { supabase } from '../../../../lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

const STATUS_PILL = {
  match: { label: '동일', cls: 'bg-muted text-muted-foreground' },
  modified: { label: '수정', cls: 'bg-primary/15 text-primary' },
  removed: { label: '없음', cls: 'bg-destructive/15 text-destructive' },
  added: { label: '추가', cls: 'bg-primary/15 text-primary' },
}

export default function AdminSizeSurveyDetailPage({ params }) {
  const { storeId } = use(params)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: store }, { data: survey }, { data: specs }, { data: refs }] = await Promise.all([
        supabase.from('stores').select('id, name, region, code').eq('id', storeId).single(),
        supabase.from('signage_surveys').select('*').eq('store_id', storeId).single(),
        supabase.from('signage_specs').select('*').eq('store_id', storeId).order('sort_order'),
        supabase.from('signage_reference_images').select('image_url, sort_order').eq('store_id', storeId).order('sort_order'),
      ])

      let subs = []
      if (survey) {
        const r = await supabase.from('signage_submissions').select('*').eq('survey_id', survey.id)
        subs = r.data || []
      }

      const subBySpec = new Map()
      const added = []
      for (const s of subs) {
        if (s.spec_id) subBySpec.set(s.spec_id, s)
        else if (s.status === 'added') added.push(s)
      }

      setData({ store, survey, specs: specs || [], refs: refs || [], subBySpec, added })
      setLoading(false)
    }
    load()
  }, [storeId])

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">불러오는 중…</div>
  if (!data?.store) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">매장을 찾을 수 없습니다</div>

  const { store, survey, specs, refs, subBySpec, added } = data

  return (
    <main className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b px-5 py-3.5">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/admin" className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <div className="min-w-0">
            <h1 className="text-[17px] font-bold tracking-tight truncate">{store.name}</h1>
            <p className="text-xs text-muted-foreground">{store.region || ''} {store.code ? `· ${store.code}` : ''}</p>
          </div>
          <div className="flex-1" />
          {survey?.submitted_at ? (
            <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold shrink-0">
              {new Date(survey.submitted_at).toLocaleString('ko-KR')}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground shrink-0">미제출</span>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-6 space-y-6">
        {survey?.submitted_by_name && (
          <p className="text-sm text-muted-foreground">제출자: <span className="font-bold text-foreground">{survey.submitted_by_name}</span></p>
        )}

        {refs.length > 0 && (
          <Card className="border-border/40 rounded-2xl">
            <CardContent className="p-4">
              <p className="text-xs font-bold text-muted-foreground mb-3">본사 레퍼런스 이미지</p>
              <div className="flex gap-2 overflow-x-auto">
                {refs.map((r, i) => (
                  <a key={i} href={r.image_url} target="_blank" rel="noreferrer" className="shrink-0">
                    <img src={r.image_url} alt="" className="h-40 rounded-lg border border-border/40" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-border/40 rounded-2xl">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">#</TableHead>
                  <TableHead className="text-xs">유형</TableHead>
                  <TableHead className="text-xs text-center">본사 치수</TableHead>
                  <TableHead className="text-xs text-center">측정 치수</TableHead>
                  <TableHead className="text-xs text-center">상태</TableHead>
                  <TableHead className="text-xs">메모</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {specs.map((spec, i) => {
                  const sub = subBySpec.get(spec.id)
                  const status = sub?.status
                  const hqStr = `${spec.width}×${spec.height}×${spec.qty}`
                  const mStr = !sub ? '-' :
                    status === 'removed' ? '—' :
                    status === 'match' ? hqStr :
                    `${sub.measured_width ?? '?'}×${sub.measured_height ?? '?'}×${sub.measured_qty ?? '?'}`
                  const diff = status === 'modified' &&
                    (sub.measured_width !== spec.width || sub.measured_height !== spec.height || sub.measured_qty !== spec.qty)
                  return (
                    <TableRow key={spec.id} className={diff ? 'bg-primary/5' : status === 'removed' ? 'bg-destructive/5' : ''}>
                      <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="text-xs font-semibold">{spec.item_type}</TableCell>
                      <TableCell className="text-xs text-center font-mono">{hqStr}</TableCell>
                      <TableCell className={`text-xs text-center font-mono ${diff ? 'text-primary font-bold' : status === 'removed' ? 'text-destructive line-through' : ''}`}>
                        {mStr}
                      </TableCell>
                      <TableCell className="text-xs text-center">
                        {status ? (
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_PILL[status].cls}`}>
                            {STATUS_PILL[status].label}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">{sub?.note || ''}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {added.length > 0 && (
          <div>
            <p className="text-sm font-bold mb-2 text-primary">매니저 추가 항목 ({added.length})</p>
            <Card className="border-primary/40 border-2 rounded-2xl">
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">#</TableHead>
                      <TableHead className="text-xs text-center">치수</TableHead>
                      <TableHead className="text-xs">메모</TableHead>
                      <TableHead className="text-xs text-center">사진</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {added.map((a, i) => (
                      <TableRow key={a.id}>
                        <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="text-xs text-center font-mono font-bold">
                          {a.measured_width}×{a.measured_height}×{a.measured_qty}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{a.note || ''}</TableCell>
                        <TableCell className="text-xs text-center">
                          {a.photo_url ? (
                            <a href={a.photo_url} target="_blank" rel="noreferrer">
                              <img src={a.photo_url} alt="" className="w-16 h-16 object-cover rounded-lg border border-border/40 inline-block" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {specs.length === 0 && added.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">등록된 항목이 없습니다</p>
        )}
      </div>
    </main>
  )
}
