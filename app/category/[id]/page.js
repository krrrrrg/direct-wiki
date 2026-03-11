'use client'

import { use, useState, useEffect, useCallback } from 'react'
import { GUIDE_DATA } from '../../../lib/guideData'
import { supabase } from '../../../lib/supabase'
import { Header, GuideItem, Footer } from '../../../components/shared'
import { notFound } from 'next/navigation'

export default function CategoryPage({ params }) {
  const { id } = use(params)
  const cat = GUIDE_DATA.categories.find(c => c.id === id)
  const [guideViews, setGuideViews] = useState({})

  const fetchGuideViews = useCallback(async () => {
    const { data } = await supabase.from('guide_views').select('guide_id, view_count')
    if (data) {
      const map = {}
      for (const row of data) map[row.guide_id] = row.view_count
      setGuideViews(map)
    }
  }, [])

  useEffect(() => { fetchGuideViews() }, [fetchGuideViews])

  if (!cat) return notFound()

  return (
    <main className="min-h-screen bg-background">
      <Header title={cat.title} showBack />
      <div className="max-w-[480px] mx-auto px-5 pb-10">
        <div className="pt-6">
          {cat.notice && (
            <div className="rounded-2xl bg-primary/8 border border-primary/15 px-5 py-4 mb-5">
              <p className="text-[13px] text-foreground/70 leading-relaxed">
                {cat.notice}
              </p>
            </div>
          )}
          <div className="space-y-2.5">
            {cat.guides.map(g => (
              <GuideItem
                key={g.id}
                cat={cat}
                guide={g}
                viewCount={guideViews[g.id] || 0}
                href={`/guide/${g.id}`}
              />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
