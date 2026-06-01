import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.PUBLIC_DATA_API_KEY ?? "";
const BASE = "https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page      = searchParams.get("page")     ?? "1";
  const perPage   = searchParams.get("perPage")  ?? "20";
  const region    = searchParams.get("region")   ?? "";
  const dateFrom  = searchParams.get("dateFrom") ?? "";
  const dateTo    = searchParams.get("dateTo")   ?? "";

  const params = new URLSearchParams({ serviceKey: API_KEY, page, perPage });
  if (region)   params.append("cond[SUBSCRPT_AREA_CODE_NM::EQ]",       region);
  if (dateFrom) params.append("cond[RCRIT_PBLANC_DE::GTE]",  dateFrom);
  if (dateTo)   params.append("cond[RCRIT_PBLANC_DE::LTE]",  dateTo);

  const url = `${BASE}/getAPTLttotPblancDetail?${params}`;
  try {
    const res  = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
