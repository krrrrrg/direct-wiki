# Direct Wiki - 직영점 대응 위키

## 프로젝트 개요
하카코리아 직영점 대응 위키. 직영점 매니저들이 POS 문제를 스스로 해결할 수 있도록 돕는 가이드 앱.
대상 사용자는 IT에 익숙하지 않은 매장 매니저분들 — **쉽고 큰 글씨, 단순한 UI**가 핵심.

### 주요 기능
1. **메인 페이지 (/)** — 통합 검색 + 장애대응 가이드 + POS 정보 조회
   - 통합 검색: 하나의 검색창에서 가이드/매장/직원 동시 검색
   - 가이드: 카테고리별 단계별 이미지 포함 장애대응 가이드
   - POS 매장 정보: 매장명 → 매장코드 조회
   - POS 직원 정보: 이름 → 사번 조회
2. **관리자 페이지 (/admin)** — 탭 구조
   - 매장 체크: 프로젝트 생성 → 매장별 체크/현황 확인 (store-check 기능 통합)
   - 로그인 정보: 직원 사번/이름/지점 CRUD

## 기술 스택
- **Framework**: Next.js (App Router, JavaScript)
- **UI**: shadcn/ui + Tailwind CSS v4
- **DB**: Supabase (project: store-check / `byfjmrkjtgixkhhajdkp`)
- **Hosting**: Vercel (https://direct-wiki.vercel.app) — GitHub push 시 자동 배포
- **Repo**: https://github.com/krrrrrg/direct-wiki

## 디자인 기준
- **컨셉**: "UI의 세련됨은 토스, 컬러는 하카" — 상세 규칙은 `DESIGN_RULES.md` 참조
- **Primary 컬러**: 하카 틸/민트 (`oklch(0.79 0.115 175)` ~ `#4ECDC4`)
- **배경**: 토스 스타일 연한 회색 (`#f7f8fa`)
- **여백**: 토스 스타일로 넉넉하게 (섹션 간 32-40px, 카드 패딩 20-24px)
- **카드**: rounded-2xl, 미세한 그림자, 얇은 보더
- **버튼/뱃지**: 하카 스타일 pill (rounded-full) — filled 틸 또는 outlined 틸
- **아이콘**: SVG 라인 아이콘으로 통일 (이모지 사용 X)
- **컬러 통일**: 주황/빨강/파랑 등 다른 색 사용 X, 전부 틸(primary) 톤으로
- **모바일 우선**: max-width 480px (메인), 672px (어드민)
- **글씨**: 나이 있는 분들도 쉽게 볼 수 있도록 충분히 크게
- shadcn 컴포넌트 추가: `npx shadcn@latest add [component-name]`
- shadcn 컴포넌트 위치: `components/ui/`
- 스타일링은 Tailwind CSS 클래스 사용 (inline style 지양)

## 프로젝트 구조
```
app/
  page.js            # 메인 페이지 (/) — 통합 검색, 가이드, POS 정보 조회
  admin/page.js      # 관리자 페이지 (/admin) — 매장 체크 + 로그인 정보 (탭)
  layout.js          # 루트 레이아웃 (메타데이터, OG, 파비콘, PWA manifest)
  globals.css        # 글로벌 스타일 (하카 틸 primary 컬러)
components/ui/       # shadcn/ui 컴포넌트
lib/
  guideData.js       # 가이드 데이터 (카테고리, 스텝, 이미지 경로)
  supabase.js        # Supabase 클라이언트
  utils.js           # cn() 유틸리티
public/
  images/            # 가이드 스텝 이미지 + 로고 + 히어로 이미지
    _새가이드/        # 새 가이드 사진 임시 보관 폴더
  favicon.ico, apple-icon.png, icon-192.png, icon-512.png, og-image.png
  manifest.json      # PWA manifest
DESIGN_RULES.md      # 디자인 상세 규칙
GUIDE_EDITING.md     # 가이드 콘텐츠 추가/편집 방법
```

## Supabase 테이블
- `stores`: id(uuid), name(text), code(text), region(text) — 139개 매장
- `projects`: id(uuid), title(text), created_at — 체크 프로젝트
- `checks`: id(uuid), store_id(uuid), project_id(uuid), checked_at — 매장 체크 기록
- `login_info`: id(bigserial), employee_id(text), name(text), branch(text) — 348명 직원 사번
  - RLS 활성화, public read/insert/delete 정책 적용됨
  - stores, projects, checks는 RLS 비활성

## 환경변수
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 가이드 콘텐츠 추가
- 상세 방법은 `GUIDE_EDITING.md` 참조
- 사진을 `public/images/_새가이드/`에 넣거나 대화에서 직접 제공
- `lib/guideData.js`에 데이터 추가
- 새 카테고리 추가 시 `app/page.js`의 `CATEGORY_ICONS`에 SVG 아이콘도 추가

## 작업 시 검증 절차
1. **변경 전 기존 코드 읽기** — 수정할 파일을 반드시 먼저 읽고, 기존 로직이 깨지지 않도록 확인
2. **빌드 확인** — 코드 변경 후 반드시 `npm run build` 성공 확인
3. **Supabase 쿼리 테스트** — DB 스키마 변경 시 실제 데이터로 쿼리 동작 확인
4. **커밋 단위 작게** — 기능별로 나눠서 커밋, 문제 발생 시 롤백 용이하게

## 주의사항
- admin 페이지는 별도 인증 없음 (URL 직접 접근)
- 이미지는 `public/images/` 하위에 카테고리별 폴더로 관리
- 모든 UI 변경 시 하카 틸 컬러 + 토스 감성 유지할 것
- 다른 색상(주황, 빨강, 파랑) 사용하지 말 것 — 전부 primary(틸) 톤으로 통일
