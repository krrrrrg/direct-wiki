'use client'

import { useState } from 'react'
import { GUIDE_DATA } from '../lib/guideData'

export default function Home() {
  const [view, setView] = useState('main')
  const [selectedCat, setSelectedCat] = useState(null)
  const [selectedGuide, setSelectedGuide] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [navStack, setNavStack] = useState([])

  function showList(cat) {
    setNavStack(prev => [...prev, { view, catId: selectedCat?.id }])
    setSelectedCat(cat)
    setView('list')
  }

  function showDetail(cat, guide) {
    setNavStack(prev => [...prev, { view, catId: selectedCat?.id }])
    setSelectedCat(cat)
    setSelectedGuide(guide)
    setView('detail')
    window.scrollTo({ top: 0 })
  }

  function goBack() {
    const prev = navStack[navStack.length - 1]
    if (!prev) return
    setNavStack(navStack.slice(0, -1))
    if (prev.view === 'main') {
      setView('main')
      setSelectedCat(null)
      setSelectedGuide(null)
    } else if (prev.view === 'list') {
      const cat = GUIDE_DATA.categories.find(c => c.id === prev.catId)
      setSelectedCat(cat)
      setView('list')
      setSelectedGuide(null)
    }
  }

  const searchResults = searchQuery.trim()
    ? GUIDE_DATA.categories.flatMap(cat =>
        cat.guides.filter(g => {
          const text = [g.title, g.symptom, g.shortcut || '', ...(g.keywords || []), ...g.steps.map(s => s.action + ' ' + s.detail)].join(' ').toLowerCase()
          return text.includes(searchQuery.toLowerCase())
        }).map(g => ({ cat, guide: g }))
      )
    : []

  const headerTitle = view === 'detail' ? selectedGuide?.title : view === 'list' ? selectedCat?.title : '직영점 대응 위키'

  return (
    <main style={{ minHeight: '100vh' }}>
      <div style={{ background: 'var(--app-card)', padding: '20px 24px', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--app-border)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {view !== 'main' && (
            <button onClick={goBack} style={{ width: 36, height: 36, borderRadius: 12, border: 'none', background: 'var(--app-bg)', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              &larr;
            </button>
          )}
          <div style={{ fontSize: 18, fontWeight: 700 }}>{headerTitle}</div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px' }}>
        {view === 'main' && (
          <>
            <div style={{ padding: '32px 0 8px', textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, margin: '0 auto 16px', background: 'linear-gradient(135deg, #3182f6, #6db0ff)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, boxShadow: '0 8px 24px rgba(49,130,246,0.25)' }}>
                &#x1F6E0;&#xFE0F;
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800 }}>무엇을 도와드릴까요?</h1>
              <p style={{ fontSize: 14, color: 'var(--app-text-sub)', marginTop: 6 }}>문제 상황을 선택하거나 검색해주세요</p>
            </div>

            <div style={{ padding: '20px 0 4px', position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="증상을 입력하세요"
                style={{ width: '100%', padding: '14px 16px', border: 'none', borderRadius: 16, fontSize: 15, background: 'var(--app-card)', boxShadow: 'var(--app-shadow)', outline: 'none', color: 'var(--app-text)' }}
              />
            </div>

            {!searchQuery.trim() && (
              <>
                <div style={{ margin: '16px 0', padding: '14px 16px', background: '#f0f6ff', borderRadius: 16, fontSize: 13, color: '#3182f6', lineHeight: 1.65, display: 'flex', gap: 10 }}>
                  <div>{GUIDE_DATA.notice}</div>
                </div>

                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--app-text-sub)', padding: '20px 0 10px' }}>어떤 문제인가요?</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  {GUIDE_DATA.categories.map(cat => (
                    <div key={cat.id} onClick={() => showList(cat)} style={{ background: 'var(--app-card)', borderRadius: 'var(--app-radius)', padding: '24px 18px', cursor: 'pointer', boxShadow: 'var(--app-shadow)', textAlign: 'center' }}>
                      <div style={{ width: 56, height: 56, margin: '0 auto 12px', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, background: cat.gradient, boxShadow: '0 6px 16px rgba(0,0,0,0.08)' }}>
                        {cat.icon}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{cat.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--app-text-sub)' }}>{cat.desc}</div>
                      <div style={{ display: 'inline-block', marginTop: 8, padding: '3px 10px', background: 'var(--app-bg)', borderRadius: 8, fontSize: 11, fontWeight: 600, color: 'var(--app-text-sub)' }}>
                        {cat.guides.length}개 가이드
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {searchQuery.trim() && (
              <div style={{ paddingBottom: 20 }}>
                {searchResults.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <p style={{ color: 'var(--app-text-sub)', fontSize: 15 }}>&quot;{searchQuery}&quot; 검색 결과가 없습니다</p>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--app-text-sub)', padding: '20px 0 10px' }}>{searchResults.length}개 결과</div>
                    {searchResults.map((r, i) => (
                      <GuideItem key={i} cat={r.cat} guide={r.guide} onClick={() => showDetail(r.cat, r.guide)} />
                    ))}
                  </>
                )}
              </div>
            )}
          </>
        )}

        {view === 'list' && selectedCat && (
          <div style={{ paddingTop: 16 }}>
            {selectedCat.notice && (
              <div style={{ margin: '0 0 16px', padding: '14px 16px', background: '#f0f6ff', borderRadius: 16, fontSize: 13, color: '#3182f6', lineHeight: 1.65 }}>
                {selectedCat.notice}
              </div>
            )}
            {selectedCat.guides.map(g => (
              <GuideItem key={g.id} cat={selectedCat} guide={g} onClick={() => showDetail(selectedCat, g)} />
            ))}
          </div>
        )}

        {view === 'detail' && selectedGuide && selectedCat && (
          <div>
            <div style={{ padding: '28px 0 20px' }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>{selectedGuide.title}</h2>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#fff5eb', borderRadius: 12, fontSize: 13, color: 'var(--app-orange)', fontWeight: 600 }}>
                {selectedGuide.symptom}
              </div>
              {selectedGuide.shortcut && (
                <div style={{ marginTop: 14, padding: '12px 16px', background: 'var(--app-card)', borderRadius: 14, boxShadow: 'var(--app-shadow)', fontSize: 16, fontWeight: 800, textAlign: 'center', letterSpacing: 2 }}>
                  {selectedGuide.shortcut}
                </div>
              )}
            </div>

            <div>
              {selectedGuide.steps.map((step, i) => (
                <div key={i} style={{ position: 'relative', paddingLeft: 48, paddingBottom: 20 }}>
                  {i < selectedGuide.steps.length - 1 && (
                    <div style={{ position: 'absolute', left: 19, top: 40, bottom: 0, width: 2, background: 'var(--app-border)' }} />
                  )}
                  <div style={{ position: 'absolute', left: 0, top: 0, width: 40, height: 40, borderRadius: 14, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, background: selectedCat.gradient, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
                    {i + 1}
                  </div>
                  <div style={{ background: 'var(--app-card)', borderRadius: 'var(--app-radius)', overflow: 'hidden', boxShadow: 'var(--app-shadow)' }}>
                    <div style={{ padding: 18 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{step.action}</div>
                      <div style={{ fontSize: 13, color: 'var(--app-text-sub)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>{step.detail}</div>
                    </div>
                    {step.image && (
                      <img src={step.image} alt={step.action} style={{ width: '100%', maxHeight: 360, objectFit: 'contain', background: '#fafbfc', borderTop: '1px solid var(--app-border)', display: 'block' }} />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedGuide.note && (
              <div style={{ margin: '16px 0 24px', padding: '16px 18px', background: '#fff5eb', borderRadius: 16, fontSize: 14, fontWeight: 600, color: '#bf5600', lineHeight: 1.65 }}>
                {selectedGuide.note}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '32px 20px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#fff0f0', borderRadius: 12, fontSize: 13, fontWeight: 700, color: 'var(--app-red)', marginBottom: 12 }}>
          해결이 안 되면 본사 경영지원팀에 연락
        </div>
        <div style={{ fontSize: 12, color: 'var(--app-text-muted)' }}>하카코리아 경영지원팀 &middot; {GUIDE_DATA.lastUpdate}</div>
      </div>
    </main>
  )
}

function GuideItem({ cat, guide, onClick }) {
  return (
    <div onClick={onClick} style={{ background: 'var(--app-card)', borderRadius: 'var(--app-radius)', padding: 20, marginBottom: 10, boxShadow: 'var(--app-shadow)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ flexShrink: 0, width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: cat.gradient }}>
        {cat.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{guide.title}</div>
        <div style={{ fontSize: 13, color: 'var(--app-text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{guide.symptom}</div>
        {guide.shortcut && (
          <div style={{ display: 'inline-block', marginTop: 6, padding: '3px 8px', background: 'var(--app-bg)', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
            {guide.shortcut}
          </div>
        )}
      </div>
      <span style={{ flexShrink: 0, color: 'var(--app-text-muted)', fontSize: 16 }}>&rsaquo;</span>
    </div>
  )
}
