'use client'

import { useState, useEffect, useCallback, use } from 'react'
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

export default function SizeSurveyPage({ params }) {
  const { surveyId } = use(params)
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

    const [{ data: storeData }, { data: specsData }, { data: imgs }, { data: subs }] = await Promise.all([
      supabase.from('stores').select('id, name, region').eq('id', survey.store_id).single(),
      supabase.from('signage_specs').select('*').eq('store_id', survey.store_id).order('sort_order'),
      supabase.from('signage_reference_images').select('image_url, sort_order').eq('store_id', survey.store_id).order('sort_order'),
      supabase.from('signage_submissions').select('*').eq('survey_id', survey.id),
    ])

    setStore(storeData)
    setImages(imgs || [])

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
      },
    ])
  }

  function removeAddedRow(index) {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }

  const totalDecidable = rows.filter((r) => r.kind === 'spec').length + rows.filter((r) => r.kind === 'added').length
  const decidedCount = rows.filter((r) => {
    if (r.kind === 'added') return r.measured_width && r.measured_height && r.measured_qty
    if (r.kind === 'spec') return !!r.status
    return false
  }).length

  const canSubmit =
    totalDecidable > 0 ?
      decidedCount === totalDecidable &&
      rows.every((r) => {
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
          if (r.kind === 'added' && r.photo) {
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

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">
              {store?.region ? `${store.region} · ` : ''}본사 등록 {rows.filter((r) => r.kind === 'spec').length}건
            </p>
            <p className="text-xs font-bold text-primary">{decidedCount} / {totalDecidable}</p>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: totalDecidable ? `${(decidedCount / totalDecidable) * 100}%` : '0%' }} />
          </div>
        </div>

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
          {rows.map((row, idx) =>
            row.kind === 'spec' ? (
              <SpecCard
                key={row.spec.id}
                row={row}
                onStatus={(st) => setRowStatus(idx, st)}
                onChange={(patch) => updateRow(idx, patch)}
              />
            ) : (
              <AddedCard
                key={row.tempId}
                row={row}
                onChange={(patch) => updateRow(idx, patch)}
                onRemove={() => removeAddedRow(idx)}
              />
            )
          )}
        </div>

        <button
          onClick={addRow}
          className="mt-4 w-full rounded-2xl border-2 border-dashed border-primary/40 text-primary py-4 text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          본사에 없는 항목 추가
        </button>

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

function SpecCard({ row, onStatus, onChange }) {
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
            <p className="text-xs text-muted-foreground">수량 {spec.qty}개</p>
          </div>
          {isActive && (
            <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${activeColor}`}>
              {STATUS_LABELS[status]}
            </span>
          )}
        </div>

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
                {spec.width.toLocaleString()} × {spec.height.toLocaleString()} <span className="text-muted-foreground font-normal">mm · 수량 {spec.qty}개</span>
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
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="number"
                  inputMode="numeric"
                  value={row.measured_qty ?? ''}
                  onChange={(e) => onChange({ measured_qty: e.target.value })}
                  placeholder="수량"
                  className="bg-background w-24"
                />
                <span className="text-xs text-muted-foreground">개</span>
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

function AddedCard({ row, onChange, onRemove }) {
  const photoPreview = row.photo ? URL.createObjectURL(row.photo) : row.photoUrl

  function handlePhotoPick(e) {
    const file = e.target.files?.[0]
    if (file) onChange({ photo: file, photoUrl: null })
    e.target.value = ''
  }

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
            <p className="text-[11px] font-bold text-primary mb-1.5">사진 (필수)</p>
            {photoPreview ? (
              <div className="relative">
                <img src={photoPreview} alt="첨부 사진" className="w-full h-48 object-cover rounded-xl border border-border/40" />
                <button
                  onClick={() => onChange({ photo: null, photoUrl: null })}
                  className="absolute top-2 right-2 bg-background/90 backdrop-blur text-xs font-bold px-2.5 py-1 rounded-full border border-border"
                >
                  다시 찍기
                </button>
              </div>
            ) : (
              <label className="block w-full rounded-xl border-2 border-dashed border-primary/40 py-6 text-center cursor-pointer hover:bg-primary/5 transition-colors">
                <svg className="mx-auto mb-1.5 text-primary" width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                  <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.8"/>
                </svg>
                <p className="text-xs font-bold text-primary">광고판 사진 찍기</p>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoPick}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
