'use client'

import { use, useEffect } from 'react'
import { GUIDE_DATA } from '../../../lib/guideData'
import { supabase } from '../../../lib/supabase'
import { Header, Footer } from '../../../components/shared'
import { Card, CardContent } from '@/components/ui/card'
import { notFound } from 'next/navigation'

function findGuide(guideId) {
  for (const cat of GUIDE_DATA.categories) {
    const guide = cat.guides.find(g => g.id === guideId)
    if (guide) return { cat, guide }
  }
  return null
}

export default function GuidePage({ params }) {
  const { id } = use(params)
  const result = findGuide(id)

  useEffect(() => {
    if (result) {
      supabase.rpc('increment_guide_view', { p_guide_id: result.guide.id })
    }
  }, [result])

  if (!result) return notFound()

  const { guide } = result

  return (
    <main className="min-h-screen bg-background">
      <Header title={guide.title} showBack />
      <div className="max-w-[480px] mx-auto px-5 pb-10">
        <div className="pt-8">
          <h2 className="text-[22px] font-extrabold tracking-tight leading-tight mb-3">{guide.title}</h2>
          <span className="inline-block border border-primary text-primary text-[13px] font-semibold rounded-full px-4 py-1.5">
            {guide.symptom}
          </span>
          {guide.shortcut && (
            <Card className="mt-5 rounded-2xl border-primary/20 bg-primary/5">
              <CardContent className="py-4 text-center">
                <p className="text-[11px] text-muted-foreground mb-1 font-medium">단축키</p>
                <p className="text-[20px] font-extrabold tracking-[0.15em] text-foreground">{guide.shortcut}</p>
              </CardContent>
            </Card>
          )}

          {/* Steps */}
          <div className="mt-8 space-y-5">
            {guide.steps.map((step, i) => (
              <div key={i} className="relative pl-14">
                {i < guide.steps.length - 1 && (
                  <div className="absolute left-[21px] top-12 bottom-0 w-0.5 bg-border" />
                )}
                <div className="absolute left-0 top-0 w-[42px] h-[42px] rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-[14px] font-extrabold shadow-sm">
                  {i + 1}
                </div>
                <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
                  <CardContent className="p-5">
                    <p className="font-bold text-[15px] mb-1.5">{step.action}</p>
                    <p className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-line">{step.detail}</p>
                  </CardContent>
                  {step.image && (
                    <img src={step.image} alt={step.action} className="w-full max-h-[360px] object-contain bg-muted/50 border-t" />
                  )}
                </Card>
              </div>
            ))}
          </div>

          {guide.note && (
            <div className="mt-6 mb-8 rounded-2xl bg-primary/8 border border-primary/20 px-5 py-4 text-center">
              <p className="text-[13px] font-semibold text-foreground/70 leading-relaxed whitespace-pre-line">
                {guide.note}
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}
