import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.PUBLIC_DATA_API_KEY ?? "";
const BASE = "https://api.odcloud.kr/api/ApplyhomeInfoCmpetRtSvc/v1";

export const revalidate = 3600;

export async function GET(req: NextRequest) {
  if (!API_KEY) return NextResponse.json({ error: "API 키 없음" }, { status: 500 });

  const { searchParams } = req.nextUrl;
  const no = searchParams.get("no") ?? "";

  const params = new URLSearchParams({ serviceKey: API_KEY, page: "1", perPage: "50" });
  if (no) params.append("cond[HOUSE_MANAGE_NO::EQ]", no);

  const url = `${BASE}/getAPTLttotPblancScore?${params}`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
