# 청약 인사이트 대시보드

한국부동산원 청약홈 공공 OpenAPI 3종을 연동하여 청약 라이프사이클(공고 → 접수 → 당첨)을 시각화하는 Next.js 풀스택 앱입니다.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/manduuu11/cheongak-dashboard&env=PUBLIC_DATA_API_KEY&envDescription=공공데이터포털%20일반%20인증키(Decoded)를%20입력하세요&envLink=https://www.data.go.kr/ugs/selectPublicDataDetailView.do)

---

## 주요 기능

| 탭 | 내용 |
|---|---|
| **분양정보** | 전국 아파트 단지 목록 · 접수중/예정/마감 상태 · D-day · 주택형별 경쟁률 |
| **경쟁률** | 지역별 일반/특별공급 경쟁률 통계 |
| **신청자** | 지역별 연령대(30~60대) 신청자 현황 |
| **당첨통계** | 지역별 연령대 당첨자 현황 |

---

## 사전 준비

1. **공공데이터포털 회원가입 후 API 3종 활용신청** (무료, 자동승인)
   - [청약홈 분양정보 조회 서비스](https://www.data.go.kr/data/15098547/openapi.do)
   - [청약접수 경쟁률 및 특별공급 신청현황 조회 서비스](https://www.data.go.kr/data/15098905/openapi.do)
   - [청약 신청·당첨자 정보 조회 서비스](https://www.data.go.kr/data/15110812/openapi.do)

2. **인증키 발급** — 마이페이지 → 인증키 발급현황 → **일반 인증키 (Decoding)** 복사

---

## 로컬 실행

```bash
# 1. 저장소 클론
git clone https://github.com/manduuu11/cheongak-dashboard.git
cd cheongak-dashboard

# 2. 패키지 설치
npm install

# 3. 환경변수 설정
cp .env.example .env.local
# .env.local 열어서 PUBLIC_DATA_API_KEY에 인증키 입력

# 4. 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## Vercel 배포

1. 위의 **Deploy with Vercel** 버튼 클릭
2. GitHub 연동 후 Import
3. Environment Variables에 아래 값 입력:

| Key | Value |
|---|---|
| `PUBLIC_DATA_API_KEY` | 공공데이터포털 일반 인증키 (Decoding 버전) |

4. **Deploy** 클릭 → 완료

> ⚠️ Encoding 버전(`%2F`, `%2B` 등 포함)이 아닌 **Decoding 버전** (`/`, `+` 포함)을 입력해야 합니다.

---

## 환경변수

| 변수명 | 필수 | 설명 |
|---|---|---|
| `PUBLIC_DATA_API_KEY` | ✅ | 공공데이터포털 일반 인증키 (Decoding) |

---

## API 출처

| 서비스명 | 제공기관 | 갱신주기 |
|---|---|---|
| 청약홈 분양정보 조회 서비스 (`ApplyhomeInfoDetailSvc`) | 한국부동산원 | 매일 |
| 청약접수 경쟁률 및 특별공급 (`ApplyhomeInfoCmpetRtSvc`) | 한국부동산원 | 매일 |
| 청약 신청·당첨자 정보 조회 (`ApplyhomeStatSvc`) | 한국부동산원 | 매월 26일 |

---

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Custom CSS (Pretendard 폰트)
- **Language**: TypeScript
- **Deployment**: Vercel

---

## 프로젝트 구조

```
app/
├── page.tsx              # 메인 대시보드 (분양정보/경쟁률/신청자/당첨통계 탭)
├── layout.tsx
├── globals.css
└── api/
    ├── apt-list/         # 분양정보 API 프록시
    ├── apt-cmpet/        # 주택형별 경쟁률 API 프록시
    ├── competition/      # 지역별 경쟁률 통계 API 프록시
    ├── apt-info/         # 지역별 신청자 통계 API 프록시
    └── winners/          # 지역별 당첨자 통계 API 프록시
docs/
└── README.md             # API 기술문서 안내
```

---

데이터 출처: [공공데이터포털](https://www.data.go.kr) · 한국부동산원 청약홈
