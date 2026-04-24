'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { GUIDE_DATA } from '../../lib/guideData'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
export default function AdminPage() {
  const [tab, setTab] = useState('check') // 'check' | 'login' | 'cash' | 'views' | 'search' | 'notice' | 'size' | 'sitemap'

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b px-5">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 py-3.5">
            <img src="/images/logo.png" alt="HAKA" className="shrink-0 w-6 h-6" />
            <h1 className="text-[17px] font-bold tracking-tight">관리자</h1>
          </div>
          <div className="flex gap-1 -mb-px overflow-x-auto">
            <button
              className={`text-[14px] font-semibold px-4 py-2.5 border-b-2 transition-colors shrink-0 ${
                tab === 'check'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setTab('check')}
            >
              매장 체크
            </button>
            <button
              className={`text-[14px] font-semibold px-4 py-2.5 border-b-2 transition-colors shrink-0 ${
                tab === 'login'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setTab('login')}
            >
              로그인 정보
            </button>
            <button
              className={`text-[14px] font-semibold px-4 py-2.5 border-b-2 transition-colors shrink-0 ${
                tab === 'cash'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setTab('cash')}
            >
              현금 수거
            </button>
            <button
              className={`text-[14px] font-semibold px-4 py-2.5 border-b-2 transition-colors shrink-0 ${
                tab === 'views'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setTab('views')}
            >
              조회수
            </button>
            <button
              className={`text-[14px] font-semibold px-4 py-2.5 border-b-2 transition-colors shrink-0 ${
                tab === 'search'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setTab('search')}
            >
              검색 로그
            </button>
            <button
              className={`text-[14px] font-semibold px-4 py-2.5 border-b-2 transition-colors shrink-0 ${
                tab === 'notice'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setTab('notice')}
            >
              공지사항
            </button>
            <button
              className={`text-[14px] font-semibold px-4 py-2.5 border-b-2 transition-colors shrink-0 ${
                tab === 'size'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setTab('size')}
            >
              사이즈 설문
            </button>
            <button
              className={`text-[14px] font-semibold px-4 py-2.5 border-b-2 transition-colors shrink-0 ${
                tab === 'sitemap'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setTab('sitemap')}
            >
              사이트맵
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6">
        {tab === 'check' && <StoreCheckTab />}
        {tab === 'login' && <LoginInfoTab />}
        {tab === 'cash' && <CashCollectionTab />}
        {tab === 'views' && <GuideViewsTab />}
        {tab === 'search' && <SearchLogTab />}
        {tab === 'notice' && <NoticeManageTab />}
        {tab === 'size' && <SizeSurveyTab />}
        {tab === 'sitemap' && <SitemapTab />}
      </div>
    </main>
  )
}

// ==================== 공지사항 관리 탭 ====================
function NoticeManageTab() {
  const [notices, setNotices] = useState([])
  const [title, setTitle] = useState('')
  const [guideId, setGuideId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 모든 가이드 목록 (카테고리 > 가이드) 평탄화
  const allGuides = GUIDE_DATA.categories.flatMap(cat =>
    cat.guides.map(g => ({
      id: g.id,
      title: g.title,
      category: cat.title,
    }))
  )

  const fetchNotices = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false })
    setNotices(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchNotices()
  }, [fetchNotices])

  async function saveNotice() {
    if (!title.trim()) return
    setSaving(true)

    // 새 공지 먼저 삽입
    const { error } = await supabase.from('notices').insert({
      title: title.trim(),
      guide_id: guideId || null,
      is_active: true,
    })

    if (error) {
      setSaving(false)
      alert('공지 등록에 실패했습니다.')
      return
    }

    // 성공 후 기존 활성 공지를 비활성화 (방금 넣은 건 제외)
    const { data: latest } = await supabase
      .from('notices')
      .select('id')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)

    if (latest?.length > 0) {
      await supabase
        .from('notices')
        .update({ is_active: false })
        .eq('is_active', true)
        .neq('id', latest[0].id)
    }

    setTitle('')
    setGuideId('')
    setSaving(false)
    fetchNotices()
  }

  async function deactivateNotice(id) {
    if (!confirm('이 공지를 비활성화할까요?')) return
    await supabase.from('notices').update({ is_active: false }).eq('id', id)
    fetchNotices()
  }

  // 가이드 id → 제목 매핑
  const guideMap = {}
  for (const g of allGuides) {
    guideMap[g.id] = g
  }

  function formatTime(ts) {
    const d = new Date(ts)
    const month = d.getMonth() + 1
    const day = d.getDate()
    const h = d.getHours().toString().padStart(2, '0')
    const m = d.getMinutes().toString().padStart(2, '0')
    return `${month}/${day} ${h}:${m}`
  }

  const activeNotices = notices.filter(n => n.is_active)
  const inactiveNotices = notices.filter(n => !n.is_active)

  if (loading) return <p className="text-[13px] text-muted-foreground text-center py-10">불러오는 중...</p>

  return (
    <div className="space-y-5">
      {/* 새 공지 등록 */}
      <Card className="rounded-2xl border-border/40 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-[15px] font-bold">새 공지사항 등록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="공지 제목을 입력하세요"
            className="h-11 text-[16px] rounded-xl"
            onKeyDown={e => e.key === 'Enter' && saveNotice()}
          />
          <select
            value={guideId}
            onChange={e => setGuideId(e.target.value)}
            className="w-full h-11 text-[16px] rounded-xl border border-input bg-background px-3 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">연결할 가이드 선택 (선택사항)</option>
            {GUIDE_DATA.categories.map(cat => (
              <optgroup key={cat.id} label={cat.title}>
                {cat.guides.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="flex justify-end">
            <button
              onClick={saveNotice}
              disabled={saving || !title.trim()}
              className="h-11 px-6 rounded-full bg-primary text-white font-bold text-[14px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '저장 중...' : '공지 등록'}
            </button>
          </div>
          <p className="text-[12px] text-muted-foreground">
            새 공지를 등록하면 기존 활성 공지는 자동으로 비활성화됩니다.
          </p>
        </CardContent>
      </Card>

      {/* 현재 활성 공지 */}
      <Card className="rounded-2xl border-border/40 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-[15px] font-bold flex items-center gap-2">
            현재 활성 공지
            <Badge className="text-[11px] rounded-md font-bold bg-primary/10 text-primary border-primary/30" variant="outline">
              {activeNotices.length}건
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeNotices.length === 0 ? (
            <p className="text-[13px] text-muted-foreground text-center py-6">활성화된 공지가 없습니다</p>
          ) : (
            <div className="space-y-3">
              {activeNotices.map(n => (
                <div key={n.id} className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold">{n.title}</p>
                    {n.guide_id && guideMap[n.guide_id] && (
                      <p className="text-[12px] text-primary/70 mt-1">
                        연결: {guideMap[n.guide_id].category} &gt; {guideMap[n.guide_id].title}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-1">{formatTime(n.created_at)}</p>
                  </div>
                  <button
                    onClick={() => deactivateNotice(n.id)}
                    className="text-[12px] font-semibold border border-primary/30 text-primary rounded-full px-3 py-1 hover:bg-primary/5 transition-colors shrink-0"
                  >
                    비활성화
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 지난 공지 목록 */}
      {inactiveNotices.length > 0 && (
        <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px] font-bold">지난 공지</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[12px] font-bold text-muted-foreground h-11">제목</TableHead>
                    <TableHead className="w-[120px] text-[12px] font-bold text-muted-foreground h-11">연결 가이드</TableHead>
                    <TableHead className="w-[90px] text-[12px] font-bold text-muted-foreground h-11 text-right">등록일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inactiveNotices.map(n => (
                    <TableRow key={n.id} className="h-11">
                      <TableCell className="text-[13px] text-muted-foreground">{n.title}</TableCell>
                      <TableCell>
                        {n.guide_id && guideMap[n.guide_id] ? (
                          <Badge variant="outline" className="text-[11px] rounded-md font-medium">
                            {guideMap[n.guide_id].title}
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-[12px] text-muted-foreground font-mono">
                        {formatTime(n.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ==================== 현금 수거 탭 ====================
function CashCollectionTab() {
  const [stores, setStores] = useState([])
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [regionFilter, setRegionFilter] = useState('전체')
  const [showFilter, setShowFilter] = useState('all') // 'all' | 'done' | 'missing'

  // 월 선택 (기본: 지난달)
  const now = new Date()
  const defaultYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
  const defaultMonth = now.getMonth() === 0 ? 12 : now.getMonth()
  const [selectedMonth, setSelectedMonth] = useState(`${defaultYear}-${String(defaultMonth).padStart(2, '0')}`)

  const selectedLabel = (() => {
    const [y, m] = selectedMonth.split('-')
    return `${y}년 ${parseInt(m)}월`
  })()

  // 최근 12개월 옵션 생성
  const monthOptions = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - 1 - i, 1)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = `${d.getFullYear()}년 ${d.getMonth() + 1}월`
    monthOptions.push({ value: val, label })
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [storeRes, collRes] = await Promise.all([
      supabase.from('stores').select('*').order('region, name'),
      supabase.from('cash_collections')
        .select('*, stores(name, code, region)')
        .eq('target_month', selectedMonth)
        .order('created_at', { ascending: false }),
    ])
    setStores(storeRes.data || [])
    setCollections(collRes.data || [])
    setLoading(false)
  }, [selectedMonth])

  useEffect(() => { fetchData() }, [fetchData])

  async function deleteRecord(id) {
    if (!confirm('이 수거 기록을 삭제할까요?')) return
    const { error } = await supabase.from('cash_collections').delete().eq('id', id)
    if (error) {
      alert('삭제에 실패했습니다.')
      return
    }
    fetchData()
  }

  const collectedStoreIds = new Set(collections.map(c => c.store_id))
  const regions = ['전체', ...Array.from(new Set(stores.map(s => s.region).filter(Boolean))).sort()]

  const filteredStores = stores.filter(s => {
    const matchRegion = regionFilter === '전체' || s.region === regionFilter
    if (!matchRegion) return false
    if (showFilter === 'done') return collectedStoreIds.has(s.id)
    if (showFilter === 'missing') return !collectedStoreIds.has(s.id)
    return true
  })

  const totalStores = stores.filter(s => regionFilter === '전체' || s.region === regionFilter).length
  const doneCount = filteredStores.filter(s => collectedStoreIds.has(s.id)).length
  const missingCount = totalStores - stores.filter(s => (regionFilter === '전체' || s.region === regionFilter) && collectedStoreIds.has(s.id)).length
  const progress = totalStores > 0 ? Math.round((stores.filter(s => (regionFilter === '전체' || s.region === regionFilter) && collectedStoreIds.has(s.id)).length / totalStores) * 100) : 0

  if (loading) return <p className="text-[13px] text-muted-foreground text-center py-10">불러오는 중...</p>

  return (
    <div className="space-y-5">
      {/* 월 선택 */}
      <div>
        <p className="text-[16px] font-bold mb-3">{selectedLabel} 현금 수거 현황</p>
        <div className="flex gap-2 flex-wrap">
          {monthOptions.map(opt => (
            <button
              key={opt.value}
              className={`text-[12px] px-4 py-1.5 rounded-full font-semibold transition-colors ${
                selectedMonth === opt.value
                  ? 'bg-primary text-white'
                  : 'border border-primary/30 text-primary hover:bg-primary/5'
              }`}
              onClick={() => setSelectedMonth(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 진행률 */}
      <Card className="rounded-2xl border-border/40 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[15px] font-bold">수거 완료</p>
            <span className="text-[14px] font-bold text-primary">
              {stores.filter(s => (regionFilter === '전체' || s.region === regionFilter) && collectedStoreIds.has(s.id)).length}/{totalStores}
            </span>
          </div>
          <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[12px] text-muted-foreground mt-2">{progress}% 완료</p>
        </CardContent>
      </Card>

      {/* 지역 필터 */}
      <div className="flex gap-2 flex-wrap">
        {regions.map(r => (
          <button
            key={r}
            className={`text-[12px] px-4 py-1.5 rounded-full font-semibold transition-colors ${
              regionFilter === r
                ? 'bg-primary text-white'
                : 'border border-primary/30 text-primary hover:bg-primary/5'
            }`}
            onClick={() => setRegionFilter(r)}
          >
            {r}
          </button>
        ))}
      </div>

      {/* 상태 필터 */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: '전체' },
          { key: 'missing', label: `미수거 ${missingCount}` },
          { key: 'done', label: `완료 ${doneCount}` },
        ].map(f => (
          <button
            key={f.key}
            className={`text-[12px] px-4 py-1.5 rounded-full font-semibold transition-colors ${
              showFilter === f.key
                ? f.key === 'missing' ? 'bg-red-500 text-white' : 'bg-primary text-white'
                : f.key === 'missing' ? 'border border-red-300 text-red-500 hover:bg-red-50' : 'border border-primary/30 text-primary hover:bg-primary/5'
            }`}
            onClick={() => setShowFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 매장 리스트 */}
      <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            {filteredStores.length === 0 ? (
              <p className="text-[13px] text-muted-foreground text-center py-10">해당 조건의 매장이 없습니다</p>
            ) : (
              filteredStores.map(store => {
                const record = collections.find(c => c.store_id === store.id)
                const isDone = !!record
                return (
                  <div key={store.id} className={`border-b border-border/30 px-4 py-3 ${isDone ? 'bg-primary/5' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
                        isDone ? 'bg-primary border-primary' : 'border-red-300 bg-red-50'
                      }`}>
                        {isDone ? (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5H8" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[14px] font-medium truncate ${isDone ? 'text-muted-foreground' : 'text-foreground font-bold'}`}>
                          {store.name}
                        </p>
                        {isDone && record && (
                          <p className="text-[12px] text-muted-foreground mt-0.5">
                            {record.worker_name} · {record.collection_date}
                          </p>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono shrink-0">{store.code}</span>
                      {store.region && (
                        <Badge variant="outline" className="text-[10px] rounded-md font-medium shrink-0">{store.region}</Badge>
                      )}
                      {isDone && (
                        <button
                          onClick={() => deleteRecord(record.id)}
                          className="text-[11px] font-semibold text-red-400 hover:text-red-600 shrink-0 transition-colors"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== 매장 체크 탭 ====================
function StoreCheckTab() {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [stores, setStores] = useState([])
  const [checks, setChecks] = useState([])
  const [regionFilter, setRegionFilter] = useState('전체')
  const [storeSearch, setStoreSearch] = useState('')
  const [newProjectTitle, setNewProjectTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingNote, setEditingNote] = useState(null) // store.id being edited
  const [noteText, setNoteText] = useState('')

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    setProjects(data || [])
    return data || []
  }, [])

  // Fetch stores
  const fetchStores = useCallback(async () => {
    const { data } = await supabase.from('stores').select('*').order('region, name')
    setStores(data || [])
  }, [])

  // Fetch checks for selected project
  const fetchChecks = useCallback(async (projectId) => {
    if (!projectId) { setChecks([]); return }
    const { data } = await supabase.from('checks').select('*').eq('project_id', projectId)
    setChecks(data || [])
  }, [])

  useEffect(() => {
    async function init() {
      setLoading(true)
      const [projs] = await Promise.all([fetchProjects(), fetchStores()])
      if (projs.length > 0) {
        setSelectedProject(projs[0])
        await fetchChecks(projs[0].id)
      }
      setLoading(false)
    }
    init()
  }, [fetchProjects, fetchStores, fetchChecks])

  async function selectProject(proj) {
    setSelectedProject(proj)
    await fetchChecks(proj.id)
  }

  async function createProject() {
    if (!newProjectTitle.trim()) return
    const { data } = await supabase.from('projects').insert({ title: newProjectTitle.trim() }).select().single()
    setNewProjectTitle('')
    setShowCreateForm(false)
    await fetchProjects()
    if (data) selectProject(data)
  }

  async function deleteProject(proj) {
    if (!confirm(`"${proj.title}" 프로젝트를 삭제할까요? 체크 기록도 모두 삭제됩니다.`)) return
    await supabase.from('checks').delete().eq('project_id', proj.id)
    await supabase.from('projects').delete().eq('id', proj.id)
    const projs = await fetchProjects()
    if (projs.length > 0) {
      setSelectedProject(projs[0])
      await fetchChecks(projs[0].id)
    } else {
      setSelectedProject(null)
      setChecks([])
    }
  }

  async function toggleCheck(store) {
    if (!selectedProject) return
    const existing = checks.find(c => c.store_id === store.id)
    if (existing) {
      await supabase.from('checks').delete().eq('id', existing.id)
      setEditingNote(null)
    } else {
      await supabase.from('checks').insert({ store_id: store.id, project_id: selectedProject.id })
    }
    await fetchChecks(selectedProject.id)
  }

  function openNoteEditor(store, e) {
    e.stopPropagation()
    const check = checks.find(c => c.store_id === store.id)
    setEditingNote(store.id)
    setNoteText(check?.note || '')
  }

  async function saveNote(store) {
    const check = checks.find(c => c.store_id === store.id)
    if (!check) return
    await supabase.from('checks').update({ note: noteText.trim() || null }).eq('id', check.id)
    setEditingNote(null)
    setNoteText('')
    await fetchChecks(selectedProject.id)
  }

  const checkMap = new Map(checks.map(c => [c.store_id, c]))
  const checkedStoreIds = new Set(checks.map(c => c.store_id))
  const regions = ['전체', ...Array.from(new Set(stores.map(s => s.region).filter(Boolean))).sort()]
  const filteredStores = stores.filter(s => {
    const matchRegion = regionFilter === '전체' || s.region === regionFilter
    const matchSearch = !storeSearch.trim() || s.name.includes(storeSearch) || s.code.includes(storeSearch)
    return matchRegion && matchSearch
  })
  const checkedCount = filteredStores.filter(s => checkedStoreIds.has(s.id)).length
  const totalCount = filteredStores.length
  const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0

  if (loading) return <p className="text-[13px] text-muted-foreground text-center py-10">불러오는 중...</p>

  return (
    <div className="space-y-5">
      {/* Project Selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[16px] font-bold">프로젝트</p>
          <button
            className="text-[13px] font-semibold border border-primary/30 text-primary rounded-full px-4 py-1.5 hover:bg-primary/5 transition-colors"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? '취소' : '+ 새 프로젝트'}
          </button>
        </div>

        {showCreateForm && (
          <div className="flex gap-2.5 mb-3">
            <Input
              value={newProjectTitle}
              onChange={e => setNewProjectTitle(e.target.value)}
              placeholder="프로젝트 제목 (예: 3월 9일 중간 정산)"
              className="flex-1 h-11 text-[16px] rounded-xl"
              onKeyDown={e => e.key === 'Enter' && createProject()}
            />
            <button
              onClick={createProject}
              className="h-11 px-5 rounded-full bg-primary text-white font-bold text-[14px] hover:opacity-90 transition-opacity shrink-0"
            >
              생성
            </button>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {projects.map(p => (
            <div key={p.id} className="flex items-center gap-1">
              <button
                className={`text-[12px] px-4 py-1.5 rounded-full font-semibold transition-colors ${
                  selectedProject?.id === p.id
                    ? 'bg-primary text-white'
                    : 'border border-primary/30 text-primary hover:bg-primary/5'
                }`}
                onClick={() => selectProject(p)}
              >
                {p.title}
              </button>
              <button
                className="text-muted-foreground hover:text-foreground text-[11px] transition-colors"
                onClick={() => deleteProject(p)}
                title="삭제"
              >
                &times;
              </button>
            </div>
          ))}
          {projects.length === 0 && !showCreateForm && (
            <p className="text-[13px] text-muted-foreground">프로젝트가 없습니다. 새 프로젝트를 만들어주세요.</p>
          )}
        </div>
      </div>

      {selectedProject && (
        <>
          {/* Progress */}
          <Card className="rounded-2xl border-border/40 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[15px] font-bold">{selectedProject.title}</p>
                <span className="text-[14px] font-bold text-primary">{checkedCount}/{totalCount}</span>
              </div>
              <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[12px] text-muted-foreground mt-2">{progress}% 완료</p>
            </CardContent>
          </Card>

          {/* Region Filter */}
          <div className="flex gap-2 flex-wrap">
            {regions.map(r => (
              <button
                key={r}
                className={`text-[12px] px-4 py-1.5 rounded-full font-semibold transition-colors ${
                  regionFilter === r
                    ? 'bg-primary text-white'
                    : 'border border-primary/30 text-primary hover:bg-primary/5'
                }`}
                onClick={() => setRegionFilter(r)}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Store Search */}
          <Input
            value={storeSearch}
            onChange={e => setStoreSearch(e.target.value)}
            placeholder="매장명 또는 매장코드 검색"
            className="h-[44px] text-[14px] rounded-2xl bg-card border-border/60 px-5 shadow-sm"
          />

          {/* Store List */}
          <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                {filteredStores.map(store => {
                  const isChecked = checkedStoreIds.has(store.id)
                  const check = checkMap.get(store.id)
                  const isEditing = editingNote === store.id
                  return (
                    <div key={store.id} className={`border-b border-border/30 ${isChecked ? 'bg-primary/5' : ''}`}>
                      <div
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                          !isChecked ? 'hover:bg-secondary/50' : ''
                        }`}
                        onClick={() => toggleCheck(store)}
                      >
                        <div className={`shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-primary border-primary' : 'border-border'
                        }`}>
                          {isChecked && (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[14px] font-medium truncate ${isChecked ? 'text-muted-foreground' : ''}`}>
                            {store.name}
                          </p>
                          {check?.note && !isEditing && (
                            <p className="text-[12px] text-primary/70 mt-0.5 truncate">{check.note}</p>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground font-mono shrink-0">{store.code}</span>
                        {isChecked && (
                          <button
                            className="text-[11px] font-semibold text-primary/60 hover:text-primary shrink-0 transition-colors"
                            onClick={(e) => openNoteEditor(store, e)}
                          >
                            {check?.note ? '수정' : '비고'}
                          </button>
                        )}
                      </div>
                      {isEditing && (
                        <div className="px-4 pb-3 flex gap-2" onClick={e => e.stopPropagation()}>
                          <Input
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            placeholder="비고 입력"
                            className="flex-1 h-9 text-[13px] rounded-lg"
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && saveNote(store)}
                          />
                          <button
                            onClick={() => saveNote(store)}
                            className="h-9 px-4 rounded-full bg-primary text-white text-[12px] font-bold hover:opacity-90 transition-opacity shrink-0"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setEditingNote(null)}
                            className="h-9 px-3 rounded-full border border-primary/30 text-primary text-[12px] font-semibold hover:bg-primary/5 transition-colors shrink-0"
                          >
                            취소
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

// ==================== 로그인 정보 탭 ====================
function LoginInfoTab() {
  const [loginInfos, setLoginInfos] = useState([])
  const [search, setSearch] = useState('')
  const [branchFilter, setBranchFilter] = useState('전체')
  const [newId, setNewId] = useState('')
  const [newName, setNewName] = useState('')
  const [newBranch, setNewBranch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    const { data } = await supabase.from('login_info').select('*').order('employee_id')
    setLoginInfos(data || [])
    setLoading(false)
  }

  async function addItem() {
    if (!newId.trim() || !newName.trim()) return
    const duplicate = loginInfos.find(l => l.employee_id === newId.trim())
    if (duplicate) {
      alert(`이미 등록된 사번입니다. (${duplicate.name})`)
      return
    }
    await supabase.from('login_info').insert({
      employee_id: newId.trim(),
      name: newName.trim(),
      branch: newBranch.trim() || null
    })
    setNewId('')
    setNewName('')
    setNewBranch('')
    fetchData()
  }

  async function deleteItem(id) {
    if (!confirm('삭제할까요?')) return
    await supabase.from('login_info').delete().eq('id', id)
    fetchData()
  }

  const branches = ['전체', ...Array.from(new Set(loginInfos.map(l => l.branch).filter(Boolean))).sort()]
  const filtered = loginInfos.filter(l => {
    const matchBranch = branchFilter === '전체' || l.branch === branchFilter
    const matchSearch = !search || l.name.includes(search) || l.employee_id.includes(search)
    return matchBranch && matchSearch
  })

  return (
    <div className="space-y-5">
      {/* Add Form */}
      <Card className="rounded-2xl border-border/40 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-[15px] font-bold">새 로그인 정보 추가</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2.5 flex-wrap">
            <Input
              value={newId}
              onChange={e => setNewId(e.target.value)}
              placeholder="아이디"
              className="flex-1 min-w-[100px] h-11 text-[16px] rounded-xl"
            />
            <Input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="이름"
              className="flex-1 min-w-[100px] h-11 text-[16px] rounded-xl"
            />
            <Input
              value={newBranch}
              onChange={e => setNewBranch(e.target.value)}
              placeholder="지점"
              className="w-[100px] h-11 text-[16px] rounded-xl"
            />
            <button
              onClick={addItem}
              className="h-11 px-6 rounded-full bg-primary text-white font-bold text-[14px] hover:opacity-90 transition-opacity"
            >
              추가
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="이름 또는 아이디 검색"
        className="h-[48px] text-[15px] rounded-2xl bg-card border-border/60 px-5 shadow-sm"
      />

      {/* Branch Filter */}
      <div className="flex gap-2 flex-wrap">
        {branches.map(b => (
          <button
            key={b}
            className={`text-[12px] px-4 py-1.5 rounded-full font-semibold transition-colors ${
              branchFilter === b
                ? 'bg-primary text-white'
                : 'border border-primary/30 text-primary hover:bg-primary/5'
            }`}
            onClick={() => setBranchFilter(b)}
          >
            {b}
          </button>
        ))}
      </div>

      <p className="text-[13px] text-muted-foreground font-medium">
        {loading ? '불러오는 중...' : `총 ${filtered.length}명`}
      </p>

      {/* Table */}
      <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[140px] text-[12px] font-bold text-muted-foreground h-11">아이디</TableHead>
                  <TableHead className="text-[12px] font-bold text-muted-foreground h-11">이름</TableHead>
                  <TableHead className="w-[100px] text-[12px] font-bold text-muted-foreground h-11">지점</TableHead>
                  <TableHead className="w-[60px] h-11"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(l => (
                  <TableRow key={l.id} className="h-12">
                    <TableCell className="font-mono text-[13px] text-muted-foreground">{l.employee_id}</TableCell>
                    <TableCell className="font-semibold text-[14px]">{l.name}</TableCell>
                    <TableCell>
                      {l.branch && <Badge variant="outline" className="text-[11px] rounded-md font-medium">{l.branch}</Badge>}
                    </TableCell>
                    <TableCell>
                      <button
                        className="text-[12px] font-semibold border border-primary/30 text-primary rounded-full px-3 py-1 hover:bg-primary/5 transition-colors"
                        onClick={() => deleteItem(l.id)}
                      >
                        삭제
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== 조회수 탭 ====================
function GuideViewsTab() {
  const [views, setViews] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalViews, setTotalViews] = useState(0)

  // guide_id → { title, category } 매핑
  const guideMap = {}
  for (const cat of GUIDE_DATA.categories) {
    for (const g of cat.guides) {
      guideMap[g.id] = { title: g.title, category: cat.title }
    }
  }

  useEffect(() => {
    async function fetchViews() {
      setLoading(true)
      const { data } = await supabase
        .from('guide_views')
        .select('guide_id, view_count, updated_at')
        .order('view_count', { ascending: false })
      const list = (data || []).map(row => ({
        ...row,
        title: guideMap[row.guide_id]?.title || row.guide_id,
        category: guideMap[row.guide_id]?.category || '-',
      }))
      setViews(list)
      setTotalViews(list.reduce((sum, r) => sum + (r.view_count || 0), 0))
      setLoading(false)
    }
    fetchViews()
  }, [])

  if (loading) return <p className="text-[13px] text-muted-foreground text-center py-10">불러오는 중...</p>

  return (
    <div className="space-y-5">
      {/* Summary */}
      <Card className="rounded-2xl border-border/40 shadow-sm">
        <CardContent className="p-5 flex items-center justify-between">
          <p className="text-[15px] font-bold">전체 조회수</p>
          <span className="text-[20px] font-extrabold text-primary">{totalViews.toLocaleString()}</span>
        </CardContent>
      </Card>

      {/* Ranking */}
      <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40px] text-[12px] font-bold text-muted-foreground h-11 text-center">#</TableHead>
                <TableHead className="text-[12px] font-bold text-muted-foreground h-11">가이드</TableHead>
                <TableHead className="w-[90px] text-[12px] font-bold text-muted-foreground h-11">카테고리</TableHead>
                <TableHead className="w-[70px] text-[12px] font-bold text-muted-foreground h-11 text-right">조회수</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {views.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-[13px] text-muted-foreground py-10">
                    아직 조회 기록이 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                views.map((v, i) => (
                  <TableRow key={v.guide_id} className="h-12">
                    <TableCell className="text-center text-[13px] font-bold text-muted-foreground">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-semibold text-[14px]">{v.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px] rounded-md font-medium">{v.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-[14px] font-bold text-primary">{v.view_count.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== 검색 로그 탭 ====================
function SearchLogTab() {
  const [logs, setLogs] = useState([])
  const [topQueries, setTopQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true)
      // 최근 검색 로그 50건
      const { data } = await supabase
        .from('search_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      setLogs(data || [])

      // 전체 건수
      const { count } = await supabase
        .from('search_logs')
        .select('*', { count: 'exact', head: true })
      setTotalCount(count || 0)

      // 인기 검색어 (DB에서 집계)
      const { data: topData } = await supabase
        .rpc('get_top_search_queries', { limit_count: 20 })
      setTopQueries(topData || [])
      setLoading(false)
    }
    fetchLogs()
  }, [])

  function formatTime(ts) {
    const d = new Date(ts)
    const month = d.getMonth() + 1
    const day = d.getDate()
    const h = d.getHours().toString().padStart(2, '0')
    const m = d.getMinutes().toString().padStart(2, '0')
    return `${month}/${day} ${h}:${m}`
  }

  if (loading) return <p className="text-[13px] text-muted-foreground text-center py-10">불러오는 중...</p>

  return (
    <div className="space-y-5">
      {/* Summary */}
      <Card className="rounded-2xl border-border/40 shadow-sm">
        <CardContent className="p-5 flex items-center justify-between">
          <p className="text-[15px] font-bold">총 검색 수</p>
          <span className="text-[20px] font-extrabold text-primary">{totalCount.toLocaleString()}</span>
        </CardContent>
      </Card>

      {/* Top Queries */}
      <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-[15px] font-bold">인기 검색어 TOP 20</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {topQueries.length === 0 ? (
            <p className="text-[13px] text-muted-foreground text-center py-6">아직 검색 기록이 없습니다</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topQueries.map((q, i) => (
                <div key={q.query} className="flex items-center gap-1.5 border border-border/60 rounded-full px-3.5 py-1.5 bg-card">
                  <span className="text-[12px] font-bold text-primary">{i + 1}</span>
                  <span className="text-[13px] font-medium">{q.query}</span>
                  <Badge variant="outline" className="text-[10px] rounded-md font-bold">{q.count}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-[15px] font-bold">최근 검색 기록</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[12px] font-bold text-muted-foreground h-11">검색어</TableHead>
                  <TableHead className="w-[60px] text-[12px] font-bold text-muted-foreground h-11 text-center">결과</TableHead>
                  <TableHead className="w-[90px] text-[12px] font-bold text-muted-foreground h-11 text-right">시간</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map(l => (
                  <TableRow key={l.id} className="h-11">
                    <TableCell className="font-semibold text-[14px]">{l.query}</TableCell>
                    <TableCell className="text-center">
                      <span className={`text-[11px] font-bold ${l.has_results ? 'text-primary' : 'text-muted-foreground'}`}>
                        {l.has_results ? '있음' : '없음'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-[12px] text-muted-foreground font-mono">{formatTime(l.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== 사이트맵 탭 ====================
function SitemapTab() {
  const sitePages = [
    {
      section: '메인',
      pages: [
        { path: '/', name: '홈 (통합 검색 + 가이드)', desc: '검색, 카테고리별 가이드, POS 정보 조회' },
      ]
    },
    {
      section: '가이드',
      pages: GUIDE_DATA.categories.flatMap(cat =>
        [
          { path: `/category/${cat.id}`, name: cat.title, desc: cat.desc, isCategory: true },
          ...cat.guides.map(g => ({
            path: `/guide/${g.id}`,
            name: g.title,
            desc: g.symptom,
          }))
        ]
      )
    },
    {
      section: 'POS 정보',
      pages: [
        { path: '/info/store', name: '매장 정보 조회', desc: '매장명 → 매장코드 조회' },
        { path: '/info/staff', name: '직원 정보 조회', desc: '이름 → 사번 조회' },
      ]
    },
    {
      section: '업무 도구',
      pages: [
        { path: '/cash-collection', name: '현금 수거 기록', desc: '밸류엑스 현금 수거 기록 입력' },
        { path: '/repair-request', name: '수리 요청', desc: '장비 수리 요청 접수' },
        { path: '/repair-confirm', name: '수리 현황', desc: '수리 요청 상태 확인 및 내보내기' },
        { path: '/device-survey', name: '기기 설문', desc: '기기 설문 제출' },
        { path: '/device-survey-result', name: '기기 설문 결과', desc: '기기 설문 결과 확인' },
      ]
    },
    {
      section: '관리자',
      pages: [
        { path: '/admin', name: '관리자 대시보드', desc: '매장 체크, 로그인 정보, 현금 수거, 조회수, 검색 로그, 공지사항, 사이트맵' },
      ]
    },
  ]

  const totalPages = sitePages.reduce((sum, s) => sum + s.pages.length, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold">사이트맵</h2>
        <Badge variant="secondary" className="text-[12px]">총 {totalPages}개 페이지</Badge>
      </div>

      {sitePages.map(section => (
        <Card key={section.section}>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-[14px] font-bold text-primary">{section.section}</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="space-y-1">
              {section.pages.map(page => (
                <a
                  key={page.path}
                  href={page.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50 group ${
                    page.isCategory ? 'mt-2 first:mt-0' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[13px] font-semibold truncate ${page.isCategory ? 'text-foreground' : 'text-foreground/80'}`}>
                        {!page.isCategory && <span className="text-muted-foreground mr-1.5">└</span>}
                        {page.name}
                      </span>
                    </div>
                    {page.desc && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{page.desc}</p>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground/60 shrink-0 mt-0.5 group-hover:text-primary transition-colors">
                    {page.path}
                  </span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ==================== 사이즈 설문 탭 ====================
function SizeSurveyTab() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | pending | done | diff
  const [copied, setCopied] = useState('')

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: surveys }, { data: stores }, { data: specs }, { data: submissions }] = await Promise.all([
        supabase.from('signage_surveys').select('id, store_id, submitted_at, submitted_by_name'),
        supabase.from('stores').select('id, name, region'),
        supabase.from('signage_specs').select('id, store_id'),
        supabase.from('signage_submissions').select('survey_id, status'),
      ])

      const storeById = new Map((stores || []).map(s => [s.id, s]))
      const specsByStore = new Map()
      for (const sp of specs || []) {
        if (!specsByStore.has(sp.store_id)) specsByStore.set(sp.store_id, 0)
        specsByStore.set(sp.store_id, specsByStore.get(sp.store_id) + 1)
      }
      const counts = {}
      for (const s of submissions || []) {
        if (!counts[s.survey_id]) counts[s.survey_id] = { match: 0, modified: 0, removed: 0, added: 0 }
        counts[s.survey_id][s.status] = (counts[s.survey_id][s.status] || 0) + 1
      }

      const result = (surveys || []).map(sv => {
        const store = storeById.get(sv.store_id) || {}
        const c = counts[sv.id] || { match: 0, modified: 0, removed: 0, added: 0 }
        return {
          surveyId: sv.id,
          storeId: sv.store_id,
          storeName: store.name || '-',
          region: store.region || '-',
          hqCount: specsByStore.get(sv.store_id) || 0,
          submittedAt: sv.submitted_at,
          submitter: sv.submitted_by_name,
          ...c,
          hasDiff: (c.modified || 0) + (c.removed || 0) + (c.added || 0) > 0,
        }
      })

      result.sort((a, b) => (a.region || '').localeCompare(b.region || '') || a.storeName.localeCompare(b.storeName))
      setRows(result)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = rows.filter(r => {
    if (filter === 'pending') return !r.submittedAt
    if (filter === 'done') return !!r.submittedAt
    if (filter === 'diff') return r.hasDiff
    return true
  })

  async function copyOne(row) {
    const url = `${origin}/size-survey/${row.surveyId}`
    await navigator.clipboard.writeText(url)
    setCopied(row.surveyId)
    setTimeout(() => setCopied(''), 1500)
  }

  async function copyIndexLink() {
    await navigator.clipboard.writeText(`${origin}/size-survey`)
    setCopied('index')
    setTimeout(() => setCopied(''), 1500)
  }

  async function copyAllTsv() {
    const tsv = filtered.map(r => `${r.storeName}\t${origin}/size-survey/${r.surveyId}`).join('\n')
    await navigator.clipboard.writeText(tsv)
    setCopied('all')
    setTimeout(() => setCopied(''), 1500)
  }

  async function exportCsv() {
    const [{ data: stores }, { data: specs }, { data: surveys }, { data: subs }] = await Promise.all([
      supabase.from('stores').select('id, name, region'),
      supabase.from('signage_specs').select('*'),
      supabase.from('signage_surveys').select('id, store_id, submitted_at, submitted_by_name'),
      supabase.from('signage_submissions').select('*'),
    ])

    const storeById = new Map((stores || []).map(s => [s.id, s]))
    const specById = new Map((specs || []).map(s => [s.id, s]))
    const specsByStore = new Map()
    for (const sp of specs || []) {
      if (!specsByStore.has(sp.store_id)) specsByStore.set(sp.store_id, [])
      specsByStore.get(sp.store_id).push(sp)
    }
    const surveyById = new Map((surveys || []).map(s => [s.id, s]))
    const subsBySurvey = new Map()
    for (const s of subs || []) {
      if (!subsBySurvey.has(s.survey_id)) subsBySurvey.set(s.survey_id, [])
      subsBySurvey.get(s.survey_id).push(s)
    }

    const header = ['지역', '매장명', '제출여부', '제출자', '제출일', '항목유형', '가로(본사)', '세로(본사)', '수량(본사)', '상태', '가로(측정)', '세로(측정)', '수량(측정)', '발주가로', '발주세로', '발주수량', '메모']
    const lines = [header.join(',')]

    for (const sv of surveys || []) {
      const store = storeById.get(sv.store_id)
      if (!store) continue
      const submissionsForSurvey = subsBySurvey.get(sv.id) || []
      const subBySpec = new Map()
      const addedSubs = []
      for (const s of submissionsForSurvey) {
        if (s.spec_id) subBySpec.set(s.spec_id, s)
        else if (s.status === 'added') addedSubs.push(s)
      }

      const specsForStore = specsByStore.get(sv.store_id) || []
      for (const spec of specsForStore) {
        const sub = subBySpec.get(spec.id)
        const status = sub?.status || '미제출'
        const orderW = status === 'removed' ? '' : (status === 'modified' ? sub?.measured_width : spec.width)
        const orderH = status === 'removed' ? '' : (status === 'modified' ? sub?.measured_height : spec.height)
        const orderQ = status === 'removed' ? '' : (status === 'modified' ? sub?.measured_qty : spec.qty)
        lines.push([
          store.region || '',
          store.name || '',
          sv.submitted_at ? '제출완료' : '미제출',
          sv.submitted_by_name || '',
          sv.submitted_at ? new Date(sv.submitted_at).toLocaleString('ko-KR') : '',
          spec.item_type,
          spec.width, spec.height, spec.qty,
          status,
          sub?.measured_width ?? '',
          sub?.measured_height ?? '',
          sub?.measured_qty ?? '',
          orderW ?? '', orderH ?? '', orderQ ?? '',
          (sub?.note || '').replace(/"/g, '""'),
        ].map(v => {
          const s = String(v ?? '')
          return /[,"\n]/.test(s) ? `"${s}"` : s
        }).join(','))
      }

      for (const add of addedSubs) {
        lines.push([
          store.region || '',
          store.name || '',
          sv.submitted_at ? '제출완료' : '미제출',
          sv.submitted_by_name || '',
          sv.submitted_at ? new Date(sv.submitted_at).toLocaleString('ko-KR') : '',
          '사이드광고(추가)', '', '', '',
          'added',
          add.measured_width ?? '',
          add.measured_height ?? '',
          add.measured_qty ?? '',
          add.measured_width ?? '', add.measured_height ?? '', add.measured_qty ?? '',
          (add.note || '').replace(/"/g, '""'),
        ].map(v => {
          const s = String(v ?? '')
          return /[,"\n]/.test(s) ? `"${s}"` : s
        }).join(','))
      }
    }

    const csv = '\uFEFF' + lines.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `사이즈설문_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="text-center py-10 text-muted-foreground text-sm">불러오는 중…</div>

  const stats = {
    all: rows.length,
    done: rows.filter(r => r.submittedAt).length,
    pending: rows.filter(r => !r.submittedAt).length,
    diff: rows.filter(r => r.hasDiff).length,
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: `전체 ${stats.all}` },
          { key: 'pending', label: `미제출 ${stats.pending}` },
          { key: 'done', label: `제출완료 ${stats.done}` },
          { key: 'diff', label: `불일치 ${stats.diff}` },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-[13px] font-bold px-3 py-1.5 rounded-full border transition-colors ${filter === f.key ? 'bg-primary text-white border-primary' : 'bg-card text-foreground border-border hover:bg-secondary'}`}
          >
            {f.label}
          </button>
        ))}
        <div className="flex-1" />
        <a
          href="/size-survey?review=1"
          target="_blank"
          rel="noreferrer"
          className="text-[13px] font-bold px-3 py-1.5 rounded-full border-2 border-primary text-primary hover:bg-primary/10"
        >
          검토 모드 열기
        </a>
        <button
          onClick={copyIndexLink}
          className="text-[13px] font-bold px-3 py-1.5 rounded-full bg-primary text-white hover:bg-primary/90"
        >
          {copied === 'index' ? '복사됨' : '공유 링크 복사'}
        </button>
        <button
          onClick={copyAllTsv}
          className="text-[13px] font-bold px-3 py-1.5 rounded-full border border-border hover:bg-secondary"
        >
          {copied === 'all' ? '복사됨' : '매장별 링크(TSV)'}
        </button>
        <button
          onClick={exportCsv}
          className="text-[13px] font-bold px-3 py-1.5 rounded-full border border-primary text-primary hover:bg-primary/10"
        >
          CSV 내보내기
        </button>
      </div>

      <Card className="border-border/40 rounded-2xl">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">지역</TableHead>
                <TableHead className="text-xs">매장</TableHead>
                <TableHead className="text-xs text-center">본사</TableHead>
                <TableHead className="text-xs text-center">동일</TableHead>
                <TableHead className="text-xs text-center">수정</TableHead>
                <TableHead className="text-xs text-center">없음</TableHead>
                <TableHead className="text-xs text-center">추가</TableHead>
                <TableHead className="text-xs">제출</TableHead>
                <TableHead className="text-xs text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(row => (
                <TableRow key={row.surveyId}>
                  <TableCell className="text-xs text-muted-foreground">{row.region}</TableCell>
                  <TableCell className="text-sm font-semibold">
                    <a href={`/admin/size-survey/${row.storeId}`} className="hover:text-primary">{row.storeName}</a>
                  </TableCell>
                  <TableCell className="text-xs text-center">{row.hqCount}</TableCell>
                  <TableCell className="text-xs text-center">{row.match || ''}</TableCell>
                  <TableCell className="text-xs text-center text-primary font-bold">{row.modified || ''}</TableCell>
                  <TableCell className="text-xs text-center text-destructive font-bold">{row.removed || ''}</TableCell>
                  <TableCell className="text-xs text-center text-primary font-bold">{row.added || ''}</TableCell>
                  <TableCell className="text-xs">
                    {row.submittedAt ? (
                      <span className="inline-block bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                        {new Date(row.submittedAt).toLocaleDateString('ko-KR')}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">미제출</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      onClick={() => copyOne(row)}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      {copied === row.surveyId ? '복사됨' : '링크복사'}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
