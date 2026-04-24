'use client'

import { useState, useEffect, useCallback, use, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Header, Footer } from '../../../components/shared'

const STATUS_LABELS = {
  match: '동일',
  modified: '수정',
  removed: '없음',
  added: '추가',
}

const STICKER_INSTRUCTION = {
  '지우기': {
    title: '유리 시트지 작업 안내',
    body: '매장 유리 시트지 중 "냄새까지 바꾸는 선택" 문구 부분을 칼로 떼어주세요.',
  },
  '선택을지우기': {
    title: '유리 시트지 작업 안내',
    body: '매장 유리 시트지 문구 중 "선택" 글자만 칼로 떼어주세요.',
  },
  '스티커작업요청': {
    title: '별도 스티커 작업 요청',
    body: '스티커 관련 별도 작업 요청이 있습니다. 경영지원으로 문의 부탁드려요.',
  },
}

export default function SizeSurveyPage(props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SizeSurveyInner {...props} />
    </Suspense>
  )
}

function SizeSurveyInner({ params }) {
  const { surveyId } = use(params)
  const searchParams = useSearchParams()
  const reviewMode = searchParams?.get('review') === '1'
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [store, setStore] = useState(null)
  const [images, setImages] = useState([])
  const [rows, setRows] = useState([])
  const [managerName, setManagerName] = useState('')
  const [submittedAt, setSubmittedAt] = useState(null)
  const [saving, setSaving] = useState(false)
  const [justSubmitted, setJustSubmitted] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [stickerInstruction, setStickerInstruction] = useState(null)
  const [designTypes, setDesignTypes] = useState([])

  const fetchAll = useCallback(async () => {
    setLoading(true)

    const { data: survey } = await supabase
      .from('signage_surveys')
      .select('id, store_id, submitted_at, submitted_by_name')
      .eq('id', surveyId)
      .single()

    if (!survey) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setSubmittedAt(survey.submitted_at)
    setManagerName(survey.submitted_by_name || '')

    const [{ data: storeData }, { data: specsData }, { data: imgs }, { data: subs }, { data: sticker }, { data: designs }] = await Promise.all([
      supabase.from('stores').select('id, name, region').eq('id', survey.store_id).single(),
      supabase.from('signage_specs').select('*').eq('store_id', survey.store_id).order('sort_order'),
      supabase.from('signage_reference_images').select('image_url, sort_order').eq('store_id', survey.store_id).order('sort_order'),
      supabase.from('signage_submissions').select('*').eq('survey_id', survey.id),
      supabase.from('signage_sticker_instructions').select('tag, excel_phrase').eq('store_id', survey.store_id).maybeSingle(),
      supabase.from('signage_design_types').select('*').order('sort_order'),
    ])

    setStore(storeData)
    setImages(imgs || [])
    setStickerInstruction(sticker || null)
    setDesignTypes(designs || [])

    const subBySpec = new Map()
    const addedExisting = []
    for (const s of subs || []) {
      if (s.spec_id) subBySpec.set(s.spec_id, s)
      else if (s.status === 'added') addedExisting.push(s)
    }

    const specRows = (specsData || []).map((spec) => {
      const existing = subBySpec.get(spec.id)
      return {
        kind: 'spec',
        spec,
        status: existing?.status || null,
        measured_width: existing?.measured_width ?? spec.width,
        measured_height: existing?.measured_height ?? spec.height,
        measured_qty: existing?.measured_qty ?? spec.qty,
        note: existing?.note || '',
        photo: null,
        photoUrl: existing?.photo_url || null,
        designCode: existing?.design_code || spec.design_code || null,
      }
    })

    const addedRows = addedExisting.map((s) => ({
      kind: 'added',
      tempId: s.id,
      item_type: '사이드광고',
      measured_width: s.measured_width ?? '',
      measured_height: s.measured_height ?? '',
      measured_qty: s.measured_qty ?? '',
      note: s.note || '',
      status: 'added',
      photo: null,
      photoUrl: s.photo_url || null,
      designCode: s.design_code || null,
    }))

    setRows([...specRows, ...addedRows])
    setLoading(false)
  }, [surveyId])

  useEffect(() => { fetchAll() }, [fetchAll])

  function updateRow(index, patch) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)))
  }

  function setRowStatus(index, status) {
    const row = rows[index]
    if (row.kind !== 'spec') return
    const patch = { status }
    if (status === 'match') {
      patch.measured_width = row.spec.width
      patch.measured_height = row.spec.height
      patch.measured_qty = row.spec.qty
      patch.note = ''
    }
    if (status === 'removed') {
      patch.measured_width = null
      patch.measured_height = null
      patch.measured_qty = 0
    }
    updateRow(index, patch)
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        kind: 'added',
        tempId: `new-${Date.now()}-${Math.random()}`,
        item_type: '사이드광고',
        measured_width: '',
        measured_height: '',
        measured_qty: 1,
        note: '',
        status: 'added',
        photo: null,
        photoUrl: null,
        designCode: null,
      },
    ])
  }

  function removeAddedRow(index) {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  async function toggleOrderTarget(specId, nextValue) {
    setRows((prev) => prev.map((r) =>
      r.kind === 'spec' && r.spec?.id === specId
        ? { ...r, spec: { ...r.spec, is_order_target: nextValue }, status: nextValue ? r.status : null }
        : r
    ))
    const { error } = await supabase.from('signage_specs').update({ is_order_target: nextValue }).eq('id', specId)
    if (error) {
      alert('저장 실패: ' + error.message)
      setRows((prev) => prev.map((r) =>
        r.kind === 'spec' && r.spec?.id === specId
          ? { ...r, spec: { ...r.spec, is_order_target: !nextValue } }
          : r
      ))
    }
  }

  const isTargetSpec = (r) => r.kind === 'spec' && r.spec?.is_order_target !== false
  const orderTargetRows = rows.filter((r) => isTargetSpec(r) || r.kind === 'added')
  const excludedRows = rows.filter((r) => r.kind === 'spec' && r.spec?.is_order_target === false)

  const totalDecidable = orderTargetRows.length
  const decidedCount = orderTargetRows.filter((r) => {
    if (r.kind === 'added') return r.measured_width && r.measured_height && r.measured_qty
    if (r.kind === 'spec') return !!r.status
    return false
  }).length

  const canSubmit =
    totalDecidable > 0 ?
      decidedCount === totalDecidable &&
      orderTargetRows.every((r) => {
        if (r.kind !== 'added') return true
        const hasSize = r.measured_width && r.measured_height && r.measured_qty
        const hasPhoto = !!(r.photo || r.photoUrl)
        return hasSize && hasPhoto
      })
    : true

  async function uploadAddedPhoto(file) {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `signage-added/${surveyId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error } = await supabase.storage.from('device-survey-photos').upload(path, file, { upsert: false })
    if (error) throw error
    const { data } = supabase.storage.from('device-survey-photos').getPublicUrl(path)
    return data.publicUrl
  }

  async function submit() {
    setSaving(true)
    try {
      const uploaded = await Promise.all(
        rows.map(async (r) => {
          if (r.photo) {
            const url = await uploadAddedPhoto(r.photo)
            return { ...r, photoUrl: url, photo: null }
          }
          return r
        })
      )

      await supabase.from('signage_submissions').delete().eq('survey_id', surveyId)

      const payload = uploaded.map((r) => {
        if (r.kind === 'spec') {
          return {
            survey_id: surveyId,
            spec_id: r.spec.id,
            status: r.status,
            measured_width: r.status === 'removed' ? null : Number(r.measured_width) || null,
            measured_height: r.status === 'removed' ? null : Number(r.measured_height) || null,
            measured_qty: r.status === 'removed' ? 0 : Number(r.measured_qty) || 0,
            note: r.note || null,
            photo_url: r.photoUrl || null,
            design_code: r.designCode || null,
          }
        }
        return {
          survey_id: surveyId,
          spec_id: null,
          status: 'added',
          measured_width: Number(r.measured_width) || null,
          measured_height: Number(r.measured_height) || null,
          measured_qty: Number(r.measured_qty) || 1,
          note: r.note || null,
          photo_url: r.photoUrl || null,
          design_code: r.designCode || null,
        }
      })

      if (payload.length > 0) {
        await supabase.from('signage_submissions').insert(payload)
      }

      const now = new Date().toISOString()
      await supabase
        .from('signage_surveys')
        .update({ submitted_at: now, submitted_by_name: managerName || null, updated_at: now })
        .eq('id', surveyId)

      setRows(uploaded)
      setSubmittedAt(now)
      setJustSubmitted(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="사이즈 설문" />
        <div className="max-w-[480px] mx-auto px-5 py-10 text-center text-muted-foreground">불러오는 중…</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="사이즈 설문" />
        <div className="max-w-[480px] mx-auto px-5 py-10 text-center">
          <p className="text-lg font-bold mb-2">링크를 확인해주세요</p>
          <p className="text-sm text-muted-foreground">존재하지 않는 설문입니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header title={store?.name || '사이즈 설문'} />

      <div className="max-w-[480px] mx-auto px-5 pt-5">
        {justSubmitted && (
          <div className="rounded-2xl bg-primary/10 border border-primary/30 px-4 py-3 mb-4 flex items-center gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="text-sm">
              <div className="font-bold">제출되었습니다</div>
              <div className="text-muted-foreground text-xs">필요하면 수정 후 다시 제출 가능합니다.</div>
            </div>
          </div>
        )}

        {submittedAt && !justSubmitted && (
          <div className="rounded-2xl bg-primary/10 border border-primary/30 px-4 py-3 mb-4">
            <p className="text-sm font-bold text-primary mb-0.5">⚠️ 이미 제출된 설문입니다</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              아래 기준대로 맞게 작성됐는지 한 번 더 확인 부탁드려요. 수정 후 [다시 제출] 누르시면 갱신됩니다.
            </p>
          </div>
        )}

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">
              {store?.region ? `${store.region} · ` : ''}발주 대상 {orderTargetRows.filter(r => r.kind === 'spec').length}건
              {excludedRows.length > 0 && ` · 제외 ${excludedRows.length}`}
            </p>
            <p className="text-xs font-bold text-primary">{decidedCount} / {totalDecidable}</p>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: totalDecidable ? `${(decidedCount / totalDecidable) * 100}%` : '0%' }} />
          </div>
        </div>

        <details className="mb-5 rounded-2xl bg-primary/5 border border-primary/20 overflow-hidden" open>
          <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-primary flex items-center justify-between">
            <span>📋 진행 방법 (꼭 읽어주세요)</span>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="transition-transform"><path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </summary>
          <div className="px-4 pb-4 space-y-3 text-[13px] leading-relaxed">
            <div className="rounded-xl bg-card border border-border/40 px-3 py-2.5">
              <p className="font-bold text-foreground mb-0.5">1. 아래 본사 사진 먼저 확인</p>
              <p className="text-muted-foreground">사진에 <span className="text-destructive font-bold">"유지"</span>라고 표시된 광고판은 이번 변경 대상이 <span className="font-bold">아닙니다</span>. 치수가 본사와 맞으면 그냥 <span className="font-bold text-primary">[동일]</span> 눌러주세요.</p>
            </div>
            <div className="rounded-xl bg-card border border-border/40 px-3 py-2.5">
              <p className="font-bold text-foreground mb-1">2. 나머지 광고판만 카드 하나씩 확인</p>
              <p className="text-muted-foreground mb-1">광고판 1개 = 카드 1장이에요. 실측 후 아래 기준으로:</p>
              <ul className="space-y-0.5 text-muted-foreground">
                <li>✓ 본사 치수와 <span className="font-bold">같으면</span> → <span className="font-bold text-primary">[동일]</span></li>
                <li>✏ 본사 치수와 <span className="font-bold">다르면</span> → <span className="font-bold text-primary">[수정]</span> + 실측 가로×세로 입력</li>
                <li>✕ 현장에 <span className="font-bold">실제로 없으면</span> → <span className="font-bold text-destructive">[없음]</span></li>
              </ul>
            </div>
            <div className="rounded-xl bg-card border border-border/40 px-3 py-2.5">
              <p className="font-bold text-foreground mb-0.5">3. 본사에 없는 광고판이 더 있으면</p>
              <p className="text-muted-foreground">아래 <span className="font-bold text-primary">[+ 본사에 없는 항목 추가]</span>로 추가 + <span className="font-bold">광고판 사진 촬영 필수</span></p>
            </div>
            <div className="rounded-xl bg-card border border-border/40 px-3 py-2.5">
              <p className="font-bold text-foreground mb-0.5">4. 맨 아래 이름 입력 → [제출하기]</p>
              <p className="text-muted-foreground">이 치수로 시공업자에게 전달됩니다. 재제작되지 않게 정확히 부탁드려요 🙏</p>
            </div>
          </div>
        </details>

        {images.length > 0 && (
          <div className="mb-6">
            <div className="rounded-2xl overflow-hidden border border-border/40 bg-card">
              <img src={images[activeImage]?.image_url} alt={`본사 레퍼런스 ${activeImage + 1}`} className="w-full h-auto object-contain bg-white" />
            </div>
            {images.length > 1 && (
              <div className="flex justify-center gap-2 mt-3">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === activeImage ? 'bg-primary w-6' : 'bg-muted-foreground/30'}`}
                  />
                ))}
              </div>
            )}
            <p className="text-center text-xs text-muted-foreground mt-2">본사가 보유한 사이즈 이미지</p>
          </div>
        )}

        <div className="space-y-3">
          {rows.map((row, idx) => {
            if (row.kind === 'spec' && row.spec?.is_order_target === false) return null
            const isSpec = row.kind === 'spec'
            return isSpec ? (
              <SpecCard
                key={row.spec.id}
                row={row}
                reviewMode={reviewMode}
                designTypes={designTypes}
                onStatus={(st) => setRowStatus(idx, st)}
                onChange={(patch) => updateRow(idx, patch)}
                onToggleOrderTarget={() => toggleOrderTarget(row.spec.id, !row.spec.is_order_target)}
              />
            ) : (
              <AddedCard
                key={row.tempId}
                row={row}
                designTypes={designTypes}
                onChange={(patch) => updateRow(idx, patch)}
                onRemove={() => removeAddedRow(idx)}
              />
            )
          })}
        </div>

        <button
          onClick={addRow}
          className="mt-4 w-full rounded-2xl border-2 border-dashed border-primary/40 text-primary py-4 text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          본사에 없는 항목 추가
        </button>

        {excludedRows.length > 0 && (
          <div className="mt-8">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              발주 제외 ({excludedRows.length}) — 유지되는 광고판
            </p>
            <div className="space-y-2">
              {excludedRows.map((row) => (
                <ExcludedCard
                  key={row.spec.id}
                  row={row}
                  reviewMode={reviewMode}
                  onToggleOrderTarget={() => toggleOrderTarget(row.spec.id, !row.spec.is_order_target)}
                />
              ))}
            </div>
          </div>
        )}

        {stickerInstruction && STICKER_INSTRUCTION[stickerInstruction.tag] && (
          <div className="mt-6 rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-start gap-2.5">
              <div className="shrink-0 w-7 h-7 rounded-full bg-destructive/15 text-destructive flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 22h20L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M12 10v5M12 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-destructive mb-1">⚠️ {STICKER_INSTRUCTION[stickerInstruction.tag].title}</p>
                <p className="text-[13px] leading-relaxed text-foreground">
                  {STICKER_INSTRUCTION[stickerInstruction.tag].body}
                </p>
                {stickerInstruction.excel_phrase && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    ※ 본사 확인 문구: <span className="font-mono">"{stickerInstruction.excel_phrase}"</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pb-6">
          <label className="block text-xs font-bold text-muted-foreground mb-2">매니저 이름 (선택)</label>
          <Input
            value={managerName}
            onChange={(e) => setManagerName(e.target.value)}
            placeholder="홍길동"
            className="bg-card"
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t">
        <div className="max-w-[480px] mx-auto px-5 py-3">
          <Button
            onClick={submit}
            disabled={!canSubmit || saving}
            className="w-full h-12 text-sm font-bold rounded-2xl bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? '제출 중…' : submittedAt ? '다시 제출' : '제출하기'}
          </Button>
          {!canSubmit && (
            <p className="text-center text-[11px] text-muted-foreground mt-2">
              모든 항목의 상태를 결정해주세요
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function SpecCard({ row, reviewMode, designTypes, onStatus, onChange, onToggleOrderTarget }) {
  const { spec, status } = row
  const isActive = !!status
  const activeColor =
    status === 'match' ? 'bg-primary text-white' :
    status === 'modified' ? 'bg-primary text-white' :
    status === 'removed' ? 'bg-destructive text-white' : ''

  return (
    <Card className="border-border/40 rounded-2xl">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {spec.item_type}
              </span>
              {spec.location_label && <span className="text-[11px] text-muted-foreground">{spec.location_label}</span>}
            </div>
            <p className="text-base font-bold tracking-tight">
              {spec.width.toLocaleString()} × {spec.height.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">mm</span>
            </p>
          </div>
          {isActive && (
            <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${activeColor}`}>
              {STATUS_LABELS[status]}
            </span>
          )}
        </div>

        {reviewMode && (
          <button
            onClick={onToggleOrderTarget}
            className="w-full mb-3 rounded-xl border-2 border-dashed border-muted-foreground/30 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/50"
            title="경영지원 전용: 발주 대상에서 제외"
          >
            👔 발주 제외로 이동
          </button>
        )}

        <div className="grid grid-cols-3 gap-2 mb-2">
          <StatusButton active={status === 'match'} onClick={() => onStatus('match')} label="동일" tone="primary" />
          <StatusButton active={status === 'modified'} onClick={() => onStatus('modified')} label="수정" tone="primary" />
          <StatusButton active={status === 'removed'} onClick={() => onStatus('removed')} label="없음" tone="destructive" />
        </div>

        {status === 'modified' && (
          <div className="mt-3 pt-3 border-t border-border/40 space-y-3">
            <div className="rounded-xl bg-secondary/60 px-3 py-2">
              <p className="text-[11px] font-bold text-muted-foreground mb-0.5">본사 치수</p>
              <p className="text-sm font-bold font-mono">
                {spec.width.toLocaleString()} × {spec.height.toLocaleString()} <span className="text-muted-foreground font-normal">mm</span>
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-primary mb-1.5">실측 치수</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="numeric"
                  value={row.measured_width ?? ''}
                  onChange={(e) => onChange({ measured_width: e.target.value })}
                  placeholder="가로"
                  className="bg-background"
                />
                <span className="text-muted-foreground">×</span>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={row.measured_height ?? ''}
                  onChange={(e) => onChange({ measured_height: e.target.value })}
                  placeholder="세로"
                  className="bg-background"
                />
              </div>
            </div>
            <Input
              value={row.note || ''}
              onChange={(e) => onChange({ note: e.target.value })}
              placeholder="메모 (선택)"
              className="bg-background"
            />
          </div>
        )}

        {status === 'removed' && (
          <div className="mt-3 pt-3 border-t border-border/40">
            <Input
              value={row.note || ''}
              onChange={(e) => onChange({ note: e.target.value })}
              placeholder="사유 (예: 철거됨, 파손)"
              className="bg-background"
            />
          </div>
        )}

        {isActive && (
          <div className="mt-3 pt-3 border-t border-border/40 space-y-3">
            <DesignPicker
              value={row.designCode}
              onChange={(code) => onChange({ designCode: code })}
              designs={designTypes}
            />
            <PhotoPicker photo={row.photo} photoUrl={row.photoUrl} onChange={onChange} compact />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ExcludedCard({ row, reviewMode, onToggleOrderTarget }) {
  const { spec } = row
  return (
    <Card className="border-border/30 rounded-2xl opacity-60 bg-muted/30">
      <CardContent className="p-3 flex items-center gap-3">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-muted-foreground font-mono">
            {spec.width.toLocaleString()} × {spec.height.toLocaleString()} mm
          </p>
          <p className="text-[10px] text-muted-foreground">유지 · 이번 발주 제외</p>
        </div>
        {reviewMode && (
          <button
            onClick={onToggleOrderTarget}
            className="shrink-0 text-[11px] font-bold text-primary border border-primary/40 px-2.5 py-1 rounded-full hover:bg-primary/10"
          >
            발주 포함으로 복원
          </button>
        )}
      </CardContent>
    </Card>
  )
}

function StatusButton({ active, onClick, label, tone }) {
  const activeClass = tone === 'destructive' ? 'bg-destructive text-white border-destructive' : 'bg-primary text-white border-primary'
  const idleClass = 'bg-background text-foreground border-border hover:bg-secondary'
  return (
    <button
      onClick={onClick}
      className={`h-10 rounded-xl border-2 text-sm font-bold transition-colors ${active ? activeClass : idleClass}`}
    >
      {label}
    </button>
  )
}

function DesignPicker({ value, onChange, designs }) {
  if (!designs || designs.length === 0) return null
  const selected = designs.find((d) => d.code === value)
  return (
    <div>
      <p className="text-[11px] font-bold text-muted-foreground mb-1.5">시안 종류 (선택)</p>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm"
      >
        <option value="">시안 선택 안 함</option>
        {designs.map((d) => (
          <option key={d.code} value={d.code}>
            {d.code} · {d.label}
          </option>
        ))}
      </select>
      {selected && selected.image_url && (
        <div className="mt-2 flex items-center justify-center bg-muted/40 rounded-xl p-2">
          <img
            src={selected.image_url}
            alt={selected.label}
            className={`object-contain ${selected.orientation === 'H' ? 'h-40' : 'h-28'}`}
          />
        </div>
      )}
      {selected && !selected.image_url && (
        <div className="mt-2 rounded-xl bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground text-center">
          참고 이미지 없음 · 현재 교체 대상 시안
        </div>
      )}
    </div>
  )
}

function PhotoPicker({ photo, photoUrl, onChange, label = '사진 (선택)', compact = false }) {
  const preview = photo ? URL.createObjectURL(photo) : photoUrl

  function handlePhotoPick(e) {
    const file = e.target.files?.[0]
    if (file) onChange({ photo: file, photoUrl: null })
    e.target.value = ''
  }

  async function handlePasteButton() {
    if (!navigator.clipboard?.read) {
      alert('이 브라우저는 붙여넣기를 지원하지 않아요. 사진 찍기로 등록해주세요.')
      return
    }
    try {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type)
            const ext = type.split('/')[1] || 'png'
            const file = new File([blob], `clipboard-${Date.now()}.${ext}`, { type })
            onChange({ photo: file, photoUrl: null })
            return
          }
        }
      }
      alert('클립보드에 이미지가 없어요.')
    } catch {
      alert('붙여넣기 권한을 허용해주세요.')
    }
  }

  function handlePasteEvent(e) {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          onChange({ photo: file, photoUrl: null })
          e.preventDefault()
        }
        return
      }
    }
  }

  return (
    <div onPaste={handlePasteEvent}>
      <p className="text-[11px] font-bold text-muted-foreground mb-1.5">{label}</p>
      {preview ? (
        <div className="relative">
          <img src={preview} alt="첨부 사진" className={`w-full object-cover rounded-xl border border-border/40 ${compact ? 'h-32' : 'h-48'}`} />
          <button
            type="button"
            onClick={() => onChange({ photo: null, photoUrl: null })}
            className="absolute top-2 right-2 bg-background/90 backdrop-blur text-[11px] font-bold px-2 py-0.5 rounded-full border border-border"
          >
            다시 찍기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <label className="block rounded-xl border-2 border-dashed border-primary/40 py-3 text-center cursor-pointer hover:bg-primary/5 transition-colors">
            <svg className="mx-auto mb-1 text-primary" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
              <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.8"/>
            </svg>
            <p className="text-[11px] font-bold text-primary">사진 찍기</p>
            <input type="file" accept="image/*" capture="environment" onChange={handlePhotoPick} className="hidden" />
          </label>
          <button
            type="button"
            onClick={handlePasteButton}
            className="rounded-xl border-2 border-dashed border-primary/40 py-3 text-center hover:bg-primary/5 transition-colors"
          >
            <svg className="mx-auto mb-1 text-primary" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="8" y="2" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M16 4h3a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3" stroke="currentColor" strokeWidth="1.8"/>
            </svg>
            <p className="text-[11px] font-bold text-primary">붙여넣기</p>
          </button>
        </div>
      )}
    </div>
  )
}

function AddedCard({ row, designTypes, onChange, onRemove }) {
  return (
    <Card className="border-primary/40 border-2 rounded-2xl bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full">
            매니저 추가 항목
          </span>
          <button
            onClick={onRemove}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            삭제
          </button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="numeric"
              value={row.measured_width}
              onChange={(e) => onChange({ measured_width: e.target.value })}
              placeholder="가로"
              className="bg-background"
            />
            <span className="text-muted-foreground">×</span>
            <Input
              type="number"
              inputMode="numeric"
              value={row.measured_height}
              onChange={(e) => onChange({ measured_height: e.target.value })}
              placeholder="세로"
              className="bg-background"
            />
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="numeric"
              value={row.measured_qty}
              onChange={(e) => onChange({ measured_qty: e.target.value })}
              placeholder="수량"
              className="bg-background w-24"
            />
            <span className="text-xs text-muted-foreground">개</span>
            <Input
              value={row.note}
              onChange={(e) => onChange({ note: e.target.value })}
              placeholder="위치 메모 (선택)"
              className="bg-background flex-1"
            />
          </div>

          <div className="pt-2">
            <DesignPicker
              value={row.designCode}
              onChange={(code) => onChange({ designCode: code })}
              designs={designTypes}
            />
          </div>

          <div className="pt-2">
            <PhotoPicker photo={row.photo} photoUrl={row.photoUrl} onChange={onChange} label="사진 (필수)" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
