import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.PUBLIC_DATA_API_KEY ?? "";
const BASE = "https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1";

// 분양정보: 매일 갱신 → 1시간 캐시
export const revalidate = 3600;

export async function GET(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "API 키가 설정되지 않았습니다. PUBLIC_DATA_API_KEY 환경변수를 확인하세요." },
      { status: 500 }
    );
  }

  const { searchParams } = req.nextUrl;
  const page     = searchParams.get("page")     ?? "1";
  const perPage  = searchParams.get("perPage")  ?? "20";
  const region   = searchParams.get("region")   ?? "";
  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo   = searchParams.get("dateTo")   ?? "";

  const params = new URLSearchParams({ serviceKey: API_KEY, page, perPage });
  if (region)   params.append("cond[SUBSCRPT_AREA_CODE_NM::EQ]", region);
  if (dateFrom) params.append("cond[RCRIT_PBLANC_DE::GTE]", dateFrom);
  if (dateTo)   params.append("cond[RCRIT_PBLANC_DE::LTE]", dateTo);

  const url = `${BASE}/getAPTLttotPblancDetail?${params}`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json(
        { error: `공공API 오류: HTTP ${res.status}` },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: `네트워크 오류: ${String(e)}` },
      { status: 500 }
    );
  }
}
