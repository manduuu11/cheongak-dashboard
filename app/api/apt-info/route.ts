import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.PUBLIC_DATA_API_KEY ?? "";
const BASE = "https://api.odcloud.kr/api/ApplHmpgSvc/v1";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pageNo = searchParams.get("pageNo") ?? "1";
  const numOfRows = searchParams.get("numOfRows") ?? "10";
  const region = searchParams.get("region") ?? "";

  const params = new URLSearchParams({
    serviceKey: API_KEY,
    pageNo,
    numOfRows,
    type: "json",
  });
  if (region) params.set("SUBSCRPT_AREA_CODE_NM", region);

  const url = `${BASE}/getAPTLttotPblancDetail?${params}`;
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
