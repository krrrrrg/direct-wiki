# Design Rules - 직영점 대응 위키

## 컨셉
**"UI의 세련됨은 토스, 컬러는 하카"**

## 컬러 시스템

### Primary (하카 틸/민트)
- `--primary`: `#4ECDC4` (틸 민트 - CTA, 강조)
- `--primary-hover`: `#3dbdb4`
- `--primary-light`: `#e8faf8` (연한 배경, 뱃지)

### Neutral
- `--background`: `#f7f8fa` (토스 스타일 연한 회색 배경)
- `--card`: `#ffffff`
- `--foreground`: `#191f28` (본문 텍스트)
- `--muted-foreground`: `#8b95a1` (서브 텍스트)
- `--border`: `#f0f0f4`

### Semantic
- `--destructive`: `#f04452` (삭제, 경고)
- `--orange`: `#ff8a3d` (주의, 노트)
- `--blue`: `#3182f6` (정보, 링크)

## 타이포그래피
- 페이지 타이틀: 24-28px, font-extrabold
- 섹션 타이틀: 18-20px, font-bold
- 카드 타이틀: 15-16px, font-bold
- 본문: 14-15px, font-normal
- 캡션/뱃지: 12-13px
- 행간: leading-relaxed (1.625)
- 한글 최적화: tracking-tight on headings

## 여백 (토스 스타일 - 넉넉하게)
- 페이지 좌우 패딩: 20px (모바일)
- 섹션 간 간격: 32-40px
- 카드 내부 패딩: 20-24px
- 카드 간 간격: 12-16px
- 히어로 상하 패딩: 48-56px

## 카드 & 컴포넌트
- 카드 border-radius: 16px (rounded-2xl)
- 카드 그림자: `0 2px 8px rgba(0,0,0,0.04)`
- 카드 border: 1px solid `#f0f0f4` (거의 안 보이는 수준)
- 버튼 border-radius: 12px (rounded-xl)
- 뱃지 border-radius: 8px
- Input border-radius: 12px, height: 48-52px

## 모바일 우선
- max-width: 480px (컨텐츠 영역)
- 터치 타겟: 최소 44px
- 카드 그리드: 2열 (모바일), gap 12-16px
- 스크롤 영역은 -webkit-overflow-scrolling: touch

## 애니메이션
- transition: 150ms ease
- hover 시 카드: shadow 약간 증가 + translateY(-1px)
- 페이지 전환: 없음 (SPA 느낌 유지)
