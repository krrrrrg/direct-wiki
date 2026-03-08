import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '직영점 대응 위키'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4ECDC4 0%, #3dbdb4 50%, #2d9e97 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 120,
            height: 120,
            borderRadius: 30,
            background: 'white',
            marginBottom: 40,
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          }}
        >
          <span style={{ fontSize: 60, fontWeight: 900, color: '#4ECDC4' }}>H</span>
        </div>
        <span
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-1px',
          }}
        >
          직영점 대응 위키
        </span>
        <span
          style={{
            fontSize: 24,
            color: 'rgba(255,255,255,0.8)',
            marginTop: 16,
          }}
        >
          하카코리아 POS 장애대응 가이드
        </span>
      </div>
    ),
    { ...size }
  )
}
