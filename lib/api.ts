const BASE = "https://apartment.apihub.kr";
const API_KEY = process.env.PUBLIC_DATA_API_KEY ?? "";

export async function fetchAptInfo(params: Record<string, string>) {
  const qs = new URLSearchParams({ serviceKey: API_KEY, ...params });
  const res = await fetch(
    `${BASE}/ApplHmpgSvc/getAPTLttotPblancDetail?${qs}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error(`apt-info: ${res.status}`);
  return res.json();
}

export async function fetchCompetition(params: Record<string, string>) {
  const qs = new URLSearchParams({ serviceKey: API_KEY, ...params });
  const res = await fetch(
    `${BASE}/ApplHmpgSvc/getAPTLttotPblancMdl?${qs}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error(`competition: ${res.status}`);
  return res.json();
}

export async function fetchWinners(params: Record<string, string>) {
  const qs = new URLSearchParams({ serviceKey: API_KEY, ...params });
  const res = await fetch(
    `${BASE}/ApplHmpgSvc/getAPTLttotPblancSttus?${qs}`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error(`winners: ${res.status}`);
  return res.json();
}
