# Direct Wiki - 직영점 대응 위키

## 프로젝트 개요
하카코리아 직영점 대응 위키. POS 장애대응 가이드 + 관리자 페이지(로그인 정보 관리).

## 기술 스택
- **Framework**: Next.js (App Router)
- **UI**: shadcn/ui + Tailwind CSS v4
- **DB**: Supabase (project: store-check / `byfjmrkjtgixkhhajdkp`)
- **Hosting**: Vercel (https://direct-wiki.vercel.app)

## 디자인 기준
- **새로운 UI 컴포넌트는 반드시 shadcn/ui 컴포넌트를 사용할 것**
- shadcn 컴포넌트 추가: `npx shadcn@latest add [component-name]`
- shadcn 컴포넌트 위치: `components/ui/`
- 유틸리티: `lib/utils.js` (cn 함수)
- 스타일링은 Tailwind CSS 클래스 사용 (inline style 지양)
- 기존 가이드 페이지(/)는 레거시 inline style로 작성됨 - 점진적으로 shadcn/Tailwind로 전환

## 커스텀 CSS 변수 (globals.css)
기존 가이드 페이지용 변수는 `--app-` prefix 사용 (shadcn 변수와 충돌 방지):
- `--app-bg`, `--app-card`, `--app-text`, `--app-text-sub`, `--app-text-muted`
- `--app-border`, `--app-blue`, `--app-green`, `--app-orange`, `--app-red`
- `--app-radius`, `--app-shadow`, `--app-shadow-lg`

## 프로젝트 구조
```
app/
  page.js          # 메인 가이드 페이지 (/)
  admin/page.js    # 관리자 페이지 (/admin) - 로그인 정보 CRUD
  layout.js        # 루트 레이아웃
  globals.css      # 글로벌 스타일 (shadcn + 커스텀 변수)
components/ui/     # shadcn/ui 컴포넌트
lib/
  guideData.js     # 가이드 데이터 (카테고리, 스텝, 이미지 경로)
  supabase.js      # Supabase 클라이언트
  utils.js         # cn() 유틸리티
public/images/     # 가이드 스텝 이미지
```

## Supabase 테이블
- `login_info`: id(bigserial), employee_id(text), name(text), branch(text), created_at(timestamptz)
  - RLS 활성화, public read/insert/delete 정책 적용됨

## 환경변수
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 주의사항
- 가이드 데이터 수정은 `lib/guideData.js`에서
- 이미지는 `public/images/` 하위에 카테고리별 폴더로 관리
- admin 페이지는 별도 인증 없음 (URL 직접 접근)
