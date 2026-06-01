import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.PUBLIC_DATA_API_KEY ?? "";
const BASE = "https://api.odcloud.kr/api/ApplyhomeStatSvc/v1";

export const revalidate = 21600;

export async function GET(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "API 키가 설정되지 않았습니다. PUBLIC_DATA_API_KEY 환경변수를 확인하세요." },
      { status: 500 }
    );
  }

  const { searchParams } = req.nextUrl;
  const pageNo    = searchParams.get("pageNo")    ?? "1";
  const numOfRows = searchParams.get("numOfRows") ?? "20";
  const statDe    = searchParams.get("statDe")    ?? "";

  const params = new URLSearchParams({ serviceKey: API_KEY, pageNo, numOfRows, type: "json" });
  if (statDe) params.set("cond[STAT_DE::EQ]", statDe);

  const url = `${BASE}/getAPTPrzwnerAreaStat?${params}`;
  try {
    const res = await fetch(url, { next: { revalidate: 21600 } });
    if (!res.ok) {
      return NextResponse.json({ error: `공공API 오류: HTTP ${res.status}` }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: `네트워크 오류: ${String(e)}` }, { status: 500 });
  }
}
