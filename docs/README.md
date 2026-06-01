# API 기술문서

이 폴더에는 한국부동산원 청약홈 OpenAPI 기술문서를 보관합니다.

## 문서 목록

아래 3개 docx 파일을 공공데이터포털에서 다운로드하여 이 폴더에 저장하세요.

| 파일명 | API | 다운로드 |
|---|---|---|
| `기술문서_청약홈 분양정보 조회 서비스.docx` | ApplyhomeInfoDetailSvc | [링크](https://www.data.go.kr/data/15098547/openapi.do) |
| `기술문서_청약홈 청약접수 경쟁률 및 특별공급 신청현황 조회 서비스.docx` | ApplyhomeInfoCmpetRtSvc | [링크](https://www.data.go.kr/data/15098905/openapi.do) |
| `기술문서_청약홈 청약 신청·당첨자 정보 조회 서비스.docx` | ApplyhomeStatSvc | [링크](https://www.data.go.kr/data/15110812/openapi.do) |

## 주요 엔드포인트 요약

### 분양정보 (ApplyhomeInfoDetailSvc)
- `GET /getAPTLttotPblancDetail` — APT 분양정보 상세조회
  - 주요 응답: `HOUSE_NM`, `SUBSCRPT_AREA_CODE_NM`, `TOT_SUPLY_HSHLDCO`, `RCEPT_BGNDE`, `RCEPT_ENDDE`, `PRZWNER_PRESNATN_DE`

### 경쟁률 (ApplyhomeInfoCmpetRtSvc)
- `GET /getAPTLttotPblancCmpet` — APT 주택형별 경쟁률
  - 주요 응답: `HOUSE_TY`, `SUPLY_HSHLDCO`, `REQ_CNT`, `CMPET_RATE`

### 신청·당첨자 통계 (ApplyhomeStatSvc)
- `GET /getAPTCmpetrtAreaStat` — 지역별 경쟁률
- `GET /getAPTReqstAreaStat` — 지역별 신청자
- `GET /getAPTPrzwnerAreaStat` — 지역별 당첨자
  - 공통 응답: `SUBSCRPT_AREA_CODE_NM`, `AGE_30`, `AGE_40`, `AGE_50`, `AGE_60`, `STAT_DE`
