import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.PUBLIC_DATA_API_KEY ?? "";
const BASE = "https://api.odcloud.kr/api/ApplHmpgSvc/v1";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pageNo = searchParams.get("pageNo") ?? "1";
  const numOfRows = searchParams.get("numOfRows") ?? "10";
  const pblancNo = searchParams.get("pblancNo") ?? "";

  const params = new URLSearchParams({
    serviceKey: API_KEY,
    pageNo,
    numOfRows,
    type: "json",
  });
  if (pblancNo) params.set("PBLANC_NO", pblancNo);

  const url = `${BASE}/getAPTLttotPblancSttus?${params}`;
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
