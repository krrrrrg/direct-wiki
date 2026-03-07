'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

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
    <main style={{ minHeight: '100vh', background: '#111827', color: 'white', padding: 24 }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>관리자 - 로그인 정보</h1>

        {/* 추가 폼 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            value={newId}
            onChange={e => setNewId(e.target.value)}
            placeholder="아이디..."
            style={inputStyle}
          />
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="이름..."
            style={inputStyle}
          />
          <input
            value={newBranch}
            onChange={e => setNewBranch(e.target.value)}
            placeholder="직영..."
            style={{ ...inputStyle, maxWidth: 120 }}
          />
          <button onClick={addItem} style={btnStyle}>추가</button>
        </div>

        {/* 검색 */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="이름 또는 아이디 검색..."
          style={{ ...inputStyle, width: '100%', marginBottom: 12 }}
        />

        {/* 지역 필터 */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {branches.map(b => (
            <button
              key={b}
              onClick={() => setBranchFilter(b)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: 'none',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                background: branchFilter === b ? '#3b82f6' : '#374151',
                color: branchFilter === b ? 'white' : '#9ca3af',
              }}
            >
              {b}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 12 }}>
          {loading ? '로딩 중...' : `${filtered.length}명`}
        </div>

        {/* 목록 */}
        <div style={{ maxHeight: 600, overflowY: 'auto' }}>
          {filtered.map(l => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1f2937', borderRadius: 8, padding: '10px 16px', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ color: '#9ca3af', fontSize: 13, fontFamily: 'monospace', width: 100 }}>{l.employee_id}</span>
                <span style={{ fontSize: 14 }}>{l.name}</span>
                {l.branch && <span style={{ color: '#6b7280', fontSize: 13 }}>{l.branch}</span>}
              </div>
              <button onClick={() => deleteItem(l.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13 }}>삭제</button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

const inputStyle = {
  background: '#374151',
  border: '1px solid #4b5563',
  borderRadius: 8,
  padding: '8px 14px',
  color: 'white',
  fontSize: 14,
  outline: 'none',
  flex: 1,
  minWidth: 0,
}

const btnStyle = {
  background: '#22c55e',
  border: 'none',
  borderRadius: 8,
  padding: '8px 20px',
  color: 'white',
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 14,
  whiteSpace: 'nowrap',
}
