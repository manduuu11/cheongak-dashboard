import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.PUBLIC_DATA_API_KEY ?? "";
const BASE = "https://api.odcloud.kr/api/ApplyhomeStatSvc/v1";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pageNo = searchParams.get("pageNo") ?? "1";
  const numOfRows = searchParams.get("numOfRows") ?? "20";
  const statDe = searchParams.get("statDe") ?? "";

  const params = new URLSearchParams({
    serviceKey: API_KEY,
    pageNo,
    numOfRows,
    type: "json",
  });
  if (statDe) params.set("cond[STAT_DE::EQ]", statDe);

  const url = `${BASE}/getAPTPrzwnerAreaStat?${params}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
