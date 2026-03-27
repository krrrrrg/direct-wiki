'use client'

import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from 'recharts'

const fmt = (n) => new Intl.NumberFormat('ko-KR').format(n)
const tooltipFmt = (v) => fmt(v) + '원'
const yFmt = (v) => {
  if (v >= 100000000) return (v / 100000000).toFixed(0) + '억'
  if (v >= 10000) return (v / 10000).toFixed(0) + '만'
  return ''
}

export default function StoreChart({ storeName, tab, chartData }) {
  const dataLen = chartData.length
  const xInterval = dataLen <= 7 ? 0 : dataLen <= 14 ? 1 : dataLen <= 31 ? 3 : Math.floor(dataLen / 8)
  const chartH = 140

  return (
    <div className="px-4 py-3 bg-primary/3 border-t border-border/20">
      <div style={{ height: chartH }}>
        <ResponsiveContainer width="100%" height="100%">
          {tab === 'daily' ? (
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#8b95a1' }} interval={xInterval} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#8b95a1' }} tickFormatter={yFmt} width={35} axisLine={false} tickLine={false} tickCount={3} />
              <Tooltip formatter={tooltipFmt} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #f0f0f4' }} />
              <Area type="monotone" dataKey="amount" stroke="#4ECDC4" strokeWidth={2} fill="url(#colorAmount)" dot={false} activeDot={{ r: 4, fill: '#4ECDC4' }} />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8b95a1' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#8b95a1' }} tickFormatter={yFmt} width={35} axisLine={false} tickLine={false} tickCount={3} />
              <Tooltip formatter={tooltipFmt} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #f0f0f4' }} />
              <Bar dataKey="총액" fill="#4ECDC4" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
