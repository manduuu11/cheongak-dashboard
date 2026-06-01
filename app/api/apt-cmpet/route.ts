import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.PUBLIC_DATA_API_KEY ?? "";
const BASE = "https://api.odcloud.kr/api/ApplyhomeInfoCmpetRtSvc/v1";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page          = searchParams.get("page")    ?? "1";
  const perPage       = searchParams.get("perPage") ?? "50";
  const houseManageNo = searchParams.get("no")      ?? "";

  const params = new URLSearchParams({ serviceKey: API_KEY, page, perPage });
  if (houseManageNo) params.append("cond[HOUSE_MANAGE_NO::EQ]", houseManageNo);

  const url = `${BASE}/getAPTLttotPblancCmpet?${params}`;
  try {
    const res  = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
