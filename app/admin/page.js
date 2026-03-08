'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b px-5 py-3.5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-[17px] font-bold tracking-tight">로그인 정보 관리</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8 space-y-6">
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
    </main>
  )
}
