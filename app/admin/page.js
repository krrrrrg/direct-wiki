'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
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
  const [tab, setTab] = useState('check') // 'check' | 'login'

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b px-5">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 py-3.5">
            <img src="/images/logo.png" alt="HAKA" className="shrink-0 w-6 h-6" />
            <h1 className="text-[17px] font-bold tracking-tight">관리자</h1>
          </div>
          <div className="flex gap-1 -mb-px">
            <button
              className={`text-[14px] font-semibold px-4 py-2.5 border-b-2 transition-colors ${
                tab === 'check'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setTab('check')}
            >
              매장 체크
            </button>
            <button
              className={`text-[14px] font-semibold px-4 py-2.5 border-b-2 transition-colors ${
                tab === 'login'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setTab('login')}
            >
              로그인 정보
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-6">
        {tab === 'check' && <StoreCheckTab />}
        {tab === 'login' && <LoginInfoTab />}
      </div>
    </main>
  )
}

// ==================== 매장 체크 탭 ====================
function StoreCheckTab() {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [stores, setStores] = useState([])
  const [checks, setChecks] = useState([])
  const [regionFilter, setRegionFilter] = useState('전체')
  const [newProjectTitle, setNewProjectTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

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
    } else {
      await supabase.from('checks').insert({ store_id: store.id, project_id: selectedProject.id })
    }
    await fetchChecks(selectedProject.id)
  }

  const checkedStoreIds = new Set(checks.map(c => c.store_id))
  const regions = ['전체', ...Array.from(new Set(stores.map(s => s.region).filter(Boolean))).sort()]
  const filteredStores = regionFilter === '전체' ? stores : stores.filter(s => s.region === regionFilter)
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
              className="flex-1 h-11 text-[14px] rounded-xl"
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

          {/* Store List */}
          <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                {filteredStores.map(store => {
                  const isChecked = checkedStoreIds.has(store.id)
                  return (
                    <div
                      key={store.id}
                      className={`flex items-center gap-3 px-4 py-3 border-b border-border/30 cursor-pointer transition-colors ${
                        isChecked ? 'bg-primary/5' : 'hover:bg-secondary/50'
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
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono shrink-0">{store.code}</span>
                      {store.region && (
                        <span className="text-[10px] text-muted-foreground shrink-0">{store.region}</span>
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
              className="flex-1 min-w-[100px] h-11 text-[14px] rounded-xl"
            />
            <Input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="이름"
              className="flex-1 min-w-[100px] h-11 text-[14px] rounded-xl"
            />
            <Input
              value={newBranch}
              onChange={e => setNewBranch(e.target.value)}
              placeholder="지점"
              className="w-[100px] h-11 text-[14px] rounded-xl"
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
