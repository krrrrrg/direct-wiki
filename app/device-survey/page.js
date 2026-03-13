'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Header, Footer } from '../../components/shared'

export default function DeviceSurveyPage() {
  const [stores, setStores] = useState([])
  const [storeSearch, setStoreSearch] = useState('')
  const [selectedStore, setSelectedStore] = useState(null)
  const [barcodeModel, setBarcodeModel] = useState('')
  const [barcodePhoto, setBarcodePhoto] = useState(null)
  const [barcodePreview, setBarcodePreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [doneCount, setDoneCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  const fetchStores = useCallback(async () => {
    const { data } = await supabase.from('stores').select('*').order('region, name')
    setStores(data || [])
    setTotalCount(data?.length || 0)
  }, [])

  const fetchDoneCount = useCallback(async () => {
    const { count } = await supabase.from('device_surveys').select('id', { count: 'exact', head: true })
    setDoneCount(count || 0)
  }, [])

  useEffect(() => {
    async function init() {
      setLoading(true)
      await Promise.all([fetchStores(), fetchDoneCount()])
      setLoading(false)
    }
    init()
  }, [fetchStores, fetchDoneCount])

  // 매장 선택 시 이미 응답했는지 체크
  async function selectStore(store) {
    setSelectedStore(store)
    setStoreSearch(store.name)
    const { data } = await supabase
      .from('device_surveys')
      .select('id')
      .eq('store_id', store.id)
      .limit(1)
    setAlreadyDone(data && data.length > 0)
  }

  const filteredStores = storeSearch.trim()
    ? stores.filter(s => s.name.includes(storeSearch) || s.code.includes(storeSearch))
    : []

  function handlePhoto(file, type) {
    if (!file) return
    const preview = URL.createObjectURL(file)
    if (type === 'barcode') {
      if (barcodePreview) URL.revokeObjectURL(barcodePreview)
      setBarcodePhoto(file)
      setBarcodePreview(preview)
    } else {
      if (terminalPreview) URL.revokeObjectURL(terminalPreview)
      setTerminalPhoto(file)
      setTerminalPreview(preview)
    }
  }

  function removePhoto(type) {
    if (type === 'barcode') {
      if (barcodePreview) URL.revokeObjectURL(barcodePreview)
      setBarcodePhoto(null)
      setBarcodePreview(null)
    } else {
      if (terminalPreview) URL.revokeObjectURL(terminalPreview)
      setTerminalPhoto(null)
      setTerminalPreview(null)
    }
  }

  async function uploadPhoto(file) {
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('device-survey-photos').upload(path, file)
    if (error) return null
    const { data } = supabase.storage.from('device-survey-photos').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSubmit() {
    if (!selectedStore) return
    if (!barcodeModel.trim() && !barcodePhoto) return
    setSaving(true)

    let barcodePhotoUrl = null
    if (barcodePhoto) barcodePhotoUrl = await uploadPhoto(barcodePhoto)

    const payload = {
      store_id: selectedStore.id,
      reporter_name: selectedStore.name,
      barcode_reader_model: barcodeModel.trim() || null,
      barcode_reader_photo: barcodePhotoUrl,
    }

    // UNIQUE(store_id) 이므로 이미 있으면 덮어쓰기
    if (alreadyDone) {
      await supabase.from('device_surveys').update(payload).eq('store_id', selectedStore.id)
    } else {
      await supabase.from('device_surveys').insert(payload)
    }

    // store_assets 바코드 리더기 모델명도 동기화
    if (barcodeModel.trim()) {
      const { data: existing } = await supabase.from('store_assets').select('id').eq('store_id', selectedStore.id).limit(1)
      if (existing && existing.length > 0) {
        await supabase.from('store_assets').update({ barcode_reader_model: barcodeModel.trim() }).eq('store_id', selectedStore.id)
      } else {
        await supabase.from('store_assets').insert({ store_id: selectedStore.id, barcode_reader_model: barcodeModel.trim() })
      }
    }

    setSaving(false)
    setSaved(true)
    setSelectedStore(null)
    setStoreSearch('')
    setBarcodeModel('')
    removePhoto('barcode')
    setAlreadyDone(false)
    fetchDoneCount()
  }

  const canSubmit = selectedStore &&
    (barcodeModel.trim() || barcodePhoto)

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header title="장비 모델명 조사" showBack />
        <p className="text-[13px] text-muted-foreground text-center py-20">불러오는 중...</p>
      </main>
    )
  }

  if (saved) {
    return (
      <main className="min-h-screen bg-background">
        <Header title="바코드 리더기 모델명 조사" showBack />
        <div className="max-w-[480px] mx-auto px-5 pb-10 pt-20 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M10 20L17 27L30 13" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-[22px] font-extrabold text-foreground mb-2">제출이 완료되었습니다</p>
          <p className="text-[15px] text-muted-foreground">감사합니다</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header title="바코드 리더기 모델명 조사" showBack />

      <div className="max-w-[480px] mx-auto px-5 pb-10">
        {/* 안내 + 진행률 */}
        <div className="pt-6 pb-4 space-y-3">
          <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3.5">
            <div className="shrink-0 w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="3" width="20" height="18" rx="2" stroke="#4ECDC4" strokeWidth="1.5"/>
                <path d="M8 7V17" stroke="#4ECDC4" strokeWidth="1.5"/>
                <path d="M12 7V17" stroke="#4ECDC4" strokeWidth="1"/>
                <path d="M15 7V17" stroke="#4ECDC4" strokeWidth="1.5"/>
                <path d="M18 7V17" stroke="#4ECDC4" strokeWidth="1"/>
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-bold text-primary">바코드 리더기 모델명 조사</p>
              <p className="text-[12px] text-primary/70 mt-0.5">매장의 바코드 리더기 모델명을 입력해주세요</p>
            </div>
          </div>

          {/* 진행률 */}
          <Card className="rounded-2xl border-border/40 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[13px] font-bold">응답 현황</p>
                <span className="text-[13px] font-bold text-primary">{doneCount}/{totalCount}</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 입력 폼 */}
        <Card className="rounded-2xl border-border/40 shadow-sm mb-6">
          <CardContent className="p-5 space-y-5">
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
                    onClick={() => { setSelectedStore(null); setStoreSearch(''); setAlreadyDone(false) }}
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
                    className="h-11 text-[14px] rounded-xl"
                  />
                  {filteredStores.length > 0 && (
                    <div className="mt-2 max-h-[200px] overflow-y-auto rounded-xl border border-border/40">
                      {filteredStores.map(s => (
                        <button
                          key={s.id}
                          onClick={() => selectStore(s)}
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
              {alreadyDone && (
                <p className="text-[12px] text-amber-600 font-semibold mt-2">이미 응답한 매장입니다. 다시 제출하면 덮어씁니다.</p>
              )}
            </div>

            {/* 바코드 리더기 */}
            <div>
              <label className="text-[13px] font-bold text-foreground mb-2 block">
                바코드 리더기 모델명
              </label>
              <p className="text-[12px] text-muted-foreground mb-2">모델명을 알면 직접 입력, 모르면 사진 촬영</p>
              <Input
                value={barcodeModel}
                onChange={e => setBarcodeModel(e.target.value)}
                placeholder="예: DS-2208"
                className="h-11 text-[14px] rounded-xl mb-2"
              />
              <div className="flex items-center gap-2">
                {barcodePreview ? (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border/40">
                    <img src={barcodePreview} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto('barcode')}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-[11px]"
                    >
                      &times;
                    </button>
                  </div>
                ) : (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <span className="text-[10px] text-muted-foreground mt-1">사진</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handlePhoto(e.target.files[0], 'barcode')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* 제출 */}
            <button
              onClick={handleSubmit}
              disabled={saving || !canSubmit}
              className="w-full h-12 rounded-2xl bg-primary text-white font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '제출 중...' : alreadyDone ? '다시 제출하기' : '제출하기'}
            </button>

          </CardContent>
        </Card>
      </div>

      <Footer />
    </main>
  )
}
