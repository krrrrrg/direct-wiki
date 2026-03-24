'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Header, Footer } from '../../components/shared'

export default function RepairRequestPage() {
  const [stores, setStores] = useState([])
  const [staff, setStaff] = useState([])
  const [storeSearch, setStoreSearch] = useState('')
  const [staffSearch, setStaffSearch] = useState('')
  const [selectedStore, setSelectedStore] = useState(null)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [symptom, setSymptom] = useState('')
  const [photos, setPhotos] = useState([])
  const [previews, setPreviews] = useState([])
  const [video, setVideo] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [recentRecords, setRecentRecords] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchStores = useCallback(async () => {
    const { data } = await supabase.from('stores').select('*').order('region, name')
    setStores(data || [])
  }, [])

  const fetchStaff = useCallback(async () => {
    const { data } = await supabase.from('login_info').select('*').order('name')
    setStaff(data || [])
  }, [])

  const fetchRecent = useCallback(async () => {
    const { data } = await supabase
      .from('repair_requests')
      .select('*, stores(name, code, region)')
      .order('created_at', { ascending: false })
      .limit(10)
    setRecentRecords(data || [])
  }, [])

  useEffect(() => {
    async function init() {
      setLoading(true)
      await Promise.all([fetchStores(), fetchStaff(), fetchRecent()])
      setLoading(false)
    }
    init()
  }, [fetchStores, fetchStaff, fetchRecent])

  const filteredStores = storeSearch.trim()
    ? stores.filter(s => s.name.includes(storeSearch) || s.code.includes(storeSearch))
    : []

  const filteredStaff = staffSearch.trim()
    ? staff.filter(s => s.name.includes(staffSearch) || s.employee_id.includes(staffSearch))
    : []

  function handlePhotoChange(e) {
    const files = Array.from(e.target.files)
    if (photos.length + files.length > 5) {
      alert('사진은 최대 5장까지 첨부할 수 있습니다.')
      return
    }
    setPhotos(prev => [...prev, ...files])
    const newPreviews = files.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...newPreviews])
  }

  function removePhoto(index) {
    URL.revokeObjectURL(previews[index])
    setPhotos(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  function handleVideoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 100 * 1024 * 1024) {
      alert('동영상은 100MB 이하만 첨부할 수 있습니다.')
      return
    }
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideo(file)
    setVideoPreview(URL.createObjectURL(file))
  }

  function removeVideo() {
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideo(null)
    setVideoPreview(null)
  }

  async function handleSubmit() {
    if (!selectedStore || !selectedStaff || !symptom.trim()) return
    setSaving(true)

    // 사진 업로드
    const uploadedUrls = []
    let photoFailed = 0
    for (const file of photos) {
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage
        .from('repair-photos')
        .upload(path, file)
      if (!error) {
        const { data: urlData } = supabase.storage
          .from('repair-photos')
          .getPublicUrl(path)
        uploadedUrls.push(urlData.publicUrl)
      } else {
        photoFailed++
      }
    }
    if (photoFailed > 0) {
      alert(`사진 ${photoFailed}장 업로드에 실패했습니다. 나머지는 정상 첨부됩니다.`)
    }

    // 동영상 업로드
    let videoUrl = null
    if (video) {
      const ext = video.name.split('.').pop()
      const path = `video_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage
        .from('repair-photos')
        .upload(path, video)
      if (!error) {
        const { data: urlData } = supabase.storage
          .from('repair-photos')
          .getPublicUrl(path)
        videoUrl = urlData.publicUrl
      }
    }

    const { error: insertError } = await supabase.from('repair_requests').insert({
      store_id: selectedStore.id,
      reporter_name: selectedStaff.name,
      symptom: symptom.trim(),
      photo_urls: uploadedUrls,
      video_url: videoUrl,
    })

    if (insertError) {
      setSaving(false)
      alert('접수에 실패했습니다. 다시 시도해주세요.')
      return
    }

    setSaving(false)
    setSaved(true)
    setSelectedStore(null)
    setSelectedStaff(null)
    setSymptom('')
    setPhotos([])
    previews.forEach(p => URL.revokeObjectURL(p))
    setPreviews([])
    removeVideo()
    setStoreSearch('')
    setStaffSearch('')
    fetchRecent()

    setTimeout(() => setSaved(false), 3000)
  }

  const statusLabel = { pending: '접수', in_progress: '처리중', completed: '완료' }
  const statusColor = {
    pending: 'bg-amber-500/10 text-amber-700',
    in_progress: 'bg-primary/10 text-primary',
    completed: 'bg-emerald-500/10 text-emerald-700',
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header title="수리 접수" showBack />
        <p className="text-[13px] text-muted-foreground text-center py-20">불러오는 중...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header title="수리 접수" showBack />

      <div className="max-w-[480px] mx-auto px-5 pb-10">
        {/* 안내 배너 */}
        <div className="pt-6 pb-4">
          <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3.5">
            <div className="shrink-0 w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="#4ECDC4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-bold text-primary">수리 접수</p>
              <p className="text-[12px] text-primary/70 mt-0.5">고장/수리가 필요한 장비를 접수해주세요</p>
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
                    onBlur={() => {
                      setTimeout(() => {
                        if (filteredStores.length > 0 && !selectedStore) {
                          setSelectedStore(filteredStores[0])
                          setStoreSearch(filteredStores[0].name)
                        }
                      }, 150)
                    }}
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
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 직원 선택 */}
            <div>
              <label className="text-[13px] font-bold text-foreground mb-2 block">접수자</label>
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
                    onBlur={() => {
                      setTimeout(() => {
                        if (filteredStaff.length > 0 && !selectedStaff) {
                          setSelectedStaff(filteredStaff[0])
                          setStaffSearch(filteredStaff[0].name)
                        }
                      }, 150)
                    }}
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
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 증상 입력 */}
            <div>
              <label className="text-[13px] font-bold text-foreground mb-2 block">증상</label>
              <textarea
                value={symptom}
                onChange={e => setSymptom(e.target.value)}
                placeholder="어떤 장비가 어떻게 고장났는지 적어주세요"
                rows={3}
                className="flex w-full rounded-xl border border-input bg-background px-4 py-3 text-[14px] shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            {/* 사진/동영상 첨부 */}
            <div>
              <label className="text-[13px] font-bold text-foreground mb-2 block">
                사진/동영상 첨부 <span className="font-normal text-muted-foreground">(사진 {photos.length}/5, 동영상 {video ? 1 : 0}/1)</span>
              </label>

              <div className="flex gap-2 flex-wrap">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border/40">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-[11px]"
                    >
                      &times;
                    </button>
                  </div>
                ))}

                {videoPreview && (
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border/40 bg-black">
                    <video src={videoPreview} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M3 1.5L10.5 6L3 10.5V1.5Z" fill="#333" />
                        </svg>
                      </div>
                    </div>
                    <button
                      onClick={removeVideo}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-[11px]"
                    >
                      &times;
                    </button>
                  </div>
                )}

                {photos.length < 5 && (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                    <span className="text-[10px] text-muted-foreground mt-1">사진</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}

                {!video && (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-border/60 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                      <polygon points="23 7 16 12 23 17 23 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="1" y="5" width="15" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-[10px] text-muted-foreground mt-1">동영상</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* 저장 버튼 */}
            <button
              onClick={handleSubmit}
              disabled={saving || !selectedStore || !selectedStaff || !symptom.trim()}
              className="w-full h-12 rounded-2xl bg-primary text-white font-bold text-[15px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '접수 중...' : '수리 접수하기'}
            </button>

            {saved && (
              <div className="flex items-center gap-2 justify-center text-[13px] font-semibold text-emerald-600">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                접수 완료
              </div>
            )}
          </CardContent>
        </Card>

        {/* 최근 접수 내역 */}
        {recentRecords.length > 0 && (
          <div>
            <p className="text-[16px] font-bold text-foreground mb-3">최근 접수 내역</p>
            <div className="space-y-2">
              {recentRecords.map(r => (
                <Card key={r.id} className="rounded-xl border-border/40 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {r.photo_urls?.length > 0 ? (
                        <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden">
                          <img src={r.photo_urls[0]} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-primary">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-bold truncate">{r.stores?.name || '-'}</p>
                          <span className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColor[r.status]}`}>
                            {statusLabel[r.status]}
                          </span>
                        </div>
                        <p className="text-[13px] text-foreground/80 mt-0.5 line-clamp-1">{r.symptom}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[12px] text-muted-foreground">{r.reporter_name}</span>
                          <span className="text-[12px] text-muted-foreground">|</span>
                          <span className="text-[12px] text-muted-foreground font-mono">
                            {new Date(r.created_at).toLocaleDateString('ko-KR')}
                          </span>
                          {r.photo_urls?.length > 0 && (
                            <>
                              <span className="text-[12px] text-muted-foreground">|</span>
                              <span className="text-[11px] text-primary font-semibold">
                                사진 {r.photo_urls.length}장
                              </span>
                            </>
                          )}
                          {r.video_url && (
                            <>
                              <span className="text-[12px] text-muted-foreground">|</span>
                              <span className="text-[11px] text-primary font-semibold">
                                동영상 1개
                              </span>
                            </>
                          )}
                        </div>
                      </div>
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
