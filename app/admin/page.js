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
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">관리자 - 로그인 정보</h1>

        {/* 추가 폼 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">새 로그인 정보 추가</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Input
                value={newId}
                onChange={e => setNewId(e.target.value)}
                placeholder="아이디..."
                className="flex-1 min-w-[120px]"
              />
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="이름..."
                className="flex-1 min-w-[120px]"
              />
              <Input
                value={newBranch}
                onChange={e => setNewBranch(e.target.value)}
                placeholder="직영..."
                className="w-[120px]"
              />
              <Button onClick={addItem}>추가</Button>
            </div>
          </CardContent>
        </Card>

        {/* 검색 */}
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="이름 또는 아이디 검색..."
        />

        {/* 지역 필터 */}
        <div className="flex gap-2 flex-wrap">
          {branches.map(b => (
            <Badge
              key={b}
              variant={branchFilter === b ? 'default' : 'secondary'}
              className="cursor-pointer text-xs px-3 py-1"
              onClick={() => setBranchFilter(b)}
            >
              {b}
            </Badge>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          {loading ? '로딩 중...' : `${filtered.length}명`}
        </p>

        {/* 테이블 */}
        <Card>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">아이디</TableHead>
                    <TableHead>이름</TableHead>
                    <TableHead className="w-[100px]">직영</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(l => (
                    <TableRow key={l.id}>
                      <TableCell className="font-mono text-sm text-muted-foreground">{l.employee_id}</TableCell>
                      <TableCell className="font-medium">{l.name}</TableCell>
                      <TableCell>
                        {l.branch && <Badge variant="outline">{l.branch}</Badge>}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteItem(l.id)}
                        >
                          삭제
                        </Button>
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
