'use client'

import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const fmt = (n) => new Intl.NumberFormat('ko-KR').format(n)
const tooltipFmt = (v) => fmt(v) + '원'

export default function StoreChart({ storeName, tab, chartData }) {
  const dataLen = chartData.length
  const xInterval = dataLen <= 7 ? 0 : dataLen <= 14 ? 1 : dataLen <= 31 ? 2 : Math.floor(dataLen / 10)
  const showDots = dataLen <= 14
  const chartH = dataLen <= 7 ? 160 : dataLen <= 31 ? 200 : 240

  return (
    <div className="px-4 py-4 bg-primary/3 border-t border-border/20">
      <p className="text-[12px] font-bold text-foreground mb-3">
        {storeName} {tab === 'daily' ? '일별 추이' : '월별 구성'} <span className="font-normal text-muted-foreground">({dataLen}건)</span>
      </p>
      <div style={{ height: chartH }}>
        <ResponsiveContainer width="100%" height="100%">
          {tab === 'daily' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f4" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={xInterval} angle={dataLen > 14 ? -45 : 0} textAnchor={dataLen > 14 ? 'end' : 'middle'} height={dataLen > 14 ? 50 : 30} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 10000 ? (v / 10000).toFixed(0) + '만' : fmt(v)} width={45} />
              <Tooltip formatter={tooltipFmt} />
              <Line type="monotone" dataKey="amount" stroke="#4ECDC4" strokeWidth={2} dot={showDots ? { r: 3 } : false} activeDot={{ r: 5 }} />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f4" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => v >= 10000 ? (v / 10000).toFixed(0) + '만' : fmt(v)} width={45} />
              <Tooltip formatter={tooltipFmt} />
              <Bar dataKey="총액" fill="#4ECDC4" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
