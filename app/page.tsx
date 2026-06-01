"use client";

// force-dynamic은 "use client" + useEffect 기반 fetch에서 불필요 — 제거
import { useState, useEffect, useCallback } from "react";

// ── 타입 ─────────────────────────────────────
interface AptItem {
  HOUSE_MANAGE_NO: string;
  PBLANC_NO: string;
  HOUSE_NM: string;
  SUBSCRPT_AREA_CODE_NM: string;
  HSSPLY_ADRES: string;
  TOT_SUPLY_HSHLDCO: string;
  RCRIT_PBLANC_DE: string;
  RCEPT_BGNDE: string;
  RCEPT_ENDDE: string;
  SPSPLY_RCEPT_BGNDE: string;
  PRZWNER_PRESNATN_DE: string;
  CNSTRCT_ENTRPS_NM: string;
  HOUSE_DTL_SECD_NM: string;
  PBLANC_URL: string;
}

interface CmpetItem {
  HOUSE_TY: string;
  SUPLY_HSHLDCO: string;
  REQ_CNT: string;
  CMPET_RATE: string;
  RESIDE_SECD: string;
  RESIDE_SENM: string;
  SUBSCRPT_RANK_CODE: number;
}

interface CompItem {
  SUBSCRPT_AREA_CODE_NM: string;
  SUBSCRPT_AREA_CODE: string;
  SUPLY_CMPET_RATE: string;
  SPSPLY_CMPET_RATE: string;
  SUPLY_HSHLDCO: string;
  SUPLY_REQ_CNT: string;
  SPSPLY_HSHLDCO: string;
  SPSPLY_REQ_CNT: string;
  STAT_DE: string;
}

interface AgeItem {
  SUBSCRPT_AREA_CODE_NM: string;
  AGE_30: string;
  AGE_40: string;
  AGE_50: string;
  AGE_60: string;
  STAT_DE: string;
}

type Tab = "분양정보" | "경쟁률" | "신청자" | "당첨통계";

// ── 유틸 ─────────────────────────────────────
function fmtStatDe(s: string) {
  if (!s) return "";
  return `${s.slice(0, 4)}년 ${parseInt(s.slice(4))}월`;
}

function fmtDate(s: string) {
  if (!s || s.length < 8) return s ?? "-";
  return `${s.slice(0, 4)}.${s.slice(4, 6)}.${s.slice(6, 8)}`;
}

function getStatus(apt: AptItem): { label: string; cls: string } {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const begin = apt.RCEPT_BGNDE?.replace(/-/g, "") ?? "";
  const end   = apt.RCEPT_ENDDE?.replace(/-/g, "") ?? "";
  if (!begin) return { label: "정보없음", cls: "closed" };
  if (today < begin) return { label: "접수예정", cls: "soon" };
  if (today <= end)  return { label: "접수중",   cls: "live" };
  return { label: "접수마감", cls: "closed" };
}

function getDday(apt: AptItem) {
  const today = new Date(); today.setHours(0,0,0,0);
  const begin = apt.RCEPT_BGNDE ? new Date(apt.RCEPT_BGNDE) : null;
  const end   = apt.RCEPT_ENDDE ? new Date(apt.RCEPT_ENDDE) : null;
  if (!begin || !end) return null;
  if (today < begin) {
    const diff = Math.ceil((begin.getTime() - today.getTime()) / 86400000);
    return { text: `D-${diff}`, urgent: diff <= 3 };
  }
  if (today <= end) return { text: "D-DAY", urgent: true };
  return null;
}

function getHeat(rate: number) {
  if (rate >= 30) return { label: "초고경쟁", color: "var(--heat-1)", bg: "var(--heat-1-bg)" };
  if (rate >= 10) return { label: "고경쟁",   color: "var(--heat-2)", bg: "var(--heat-2-bg)" };
  if (rate >= 3)  return { label: "중경쟁",   color: "var(--heat-3)", bg: "var(--heat-3-bg)" };
  if (rate >= 1)  return { label: "저경쟁",   color: "var(--heat-4)", bg: "var(--heat-4-bg)" };
  return           { label: "미달",           color: "var(--heat-5)", bg: "var(--heat-5-bg)" };
}

// ── 분양정보 카드 ────────────────────────────
function AptCard({ apt, onSelect }: { apt: AptItem; onSelect: () => void }) {
  const status = getStatus(apt);
  const dday   = getDday(apt);
  return (
    <button className="ccard" onClick={onSelect}>
      <div className="ccard-head">
        <div className="ccard-badges">
          <span className={`status-badge ${status.cls}`}>
            {status.cls === "live" && <span className="live-dot" />}
            {status.label}
          </span>
          {dday && (
            <span className={`dday${dday.urgent ? " urgent" : ""}`}>{dday.text}</span>
          )}
        </div>
      </div>
      <div className="ccard-title">
        <h3>{apt.HOUSE_NM}</h3>
        <div className="ccard-meta">
          {apt.SUBSCRPT_AREA_CODE_NM} · {apt.CNSTRCT_ENTRPS_NM || apt.HOUSE_DTL_SECD_NM}
        </div>
      </div>
      <div style={{ fontSize: 13, color: "var(--weak)", fontWeight: 600, lineHeight: 1.6 }}>
        <div>📍 {apt.HSSPLY_ADRES?.slice(0, 30) ?? "-"}</div>
        <div>🏠 총 {Number(apt.TOT_SUPLY_HSHLDCO || 0).toLocaleString()}세대</div>
      </div>
      <div className="ccard-foot">
        <div className="cc-stat">
          <span>청약접수</span>
          <b>{fmtDate(apt.RCEPT_BGNDE?.replace(/-/g,"")) || "-"}</b>
        </div>
        <div className="cc-stat">
          <span>접수종료</span>
          <b>{fmtDate(apt.RCEPT_ENDDE?.replace(/-/g,"")) || "-"}</b>
        </div>
        <div className="cc-stat">
          <span>당첨발표</span>
          <b>{fmtDate(apt.PRZWNER_PRESNATN_DE?.replace(/-/g,"")) || "-"}</b>
        </div>
      </div>
    </button>
  );
}

// ── 분양정보 상세 모달 ───────────────────────
function AptModal({ apt, onClose }: { apt: AptItem; onClose: () => void }) {
  const [cmpetData, setCmpetData] = useState<CmpetItem[]>([]);
  const [cmpetLoading, setCmpetLoading] = useState(false);
  const status = getStatus(apt);

  useEffect(() => {
    if (!apt.HOUSE_MANAGE_NO) return;
    setCmpetLoading(true);
    fetch(`/api/apt-cmpet?no=${apt.HOUSE_MANAGE_NO}&perPage=50`)
      .then(r => r.json())
      .then(d => setCmpetData(d?.data ?? []))
      .catch(() => setCmpetData([]))
      .finally(() => setCmpetLoading(false));
  }, [apt.HOUSE_MANAGE_NO]);

  // 주택형별 1순위 데이터만
  const rank1 = cmpetData.filter(c => c.SUBSCRPT_RANK_CODE === 1);
  const maxRate = Math.max(...rank1.map(c => parseFloat(c.CMPET_RATE) || 0), 1);

  const schedule = [
    { label: "특별공급", date: apt.SPSPLY_RCEPT_BGNDE },
    { label: "청약접수", date: apt.RCEPT_BGNDE },
    { label: "접수종료", date: apt.RCEPT_ENDDE },
    { label: "당첨발표", date: apt.PRZWNER_PRESNATN_DE },
  ].filter(s => s.date);

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Hero */}
        <div className="modal-hero">
          <div className="mh-badges">
            <span className={`status-badge ${status.cls}`} style={{ background: "rgba(255,255,255,.16)", color: "#fff" }}>
              {status.label}
            </span>
          </div>
          <h2>{apt.HOUSE_NM}</h2>
          <div className="mh-meta">{apt.SUBSCRPT_AREA_CODE_NM} · {apt.CNSTRCT_ENTRPS_NM || apt.HOUSE_DTL_SECD_NM}</div>
          <div className="mh-stats">
            <div><span>총 공급세대</span><b>{Number(apt.TOT_SUPLY_HSHLDCO||0).toLocaleString()}<em>세대</em></b></div>
            <div><span>청약접수</span><b style={{fontSize:16}}>{apt.RCEPT_BGNDE?.slice(0,10) || "-"}</b></div>
            <div><span>접수종료</span><b style={{fontSize:16}}>{apt.RCEPT_ENDDE?.slice(0,10) || "-"}</b></div>
            <div><span>당첨발표</span><b style={{fontSize:16}}>{apt.PRZWNER_PRESNATN_DE?.slice(0,10) || "-"}</b></div>
          </div>
        </div>

        <div className="modal-body">
          {/* 공급 위치 */}
          <div className="m-block">
            <div className="m-block-head"><h3>📍 공급 위치</h3></div>
            <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 600 }}>{apt.HSSPLY_ADRES || "-"}</div>
            {apt.PBLANC_URL && (
              <a href={apt.PBLANC_URL} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-block", marginTop: 12, fontSize: 13, color: "var(--primary)", fontWeight: 700, textDecoration: "underline" }}>
                청약홈 공고 바로가기 →
              </a>
            )}
          </div>

          {/* 주택형별 경쟁률 */}
          <div className="m-block">
            <div className="m-block-head">
              <h3>주택형별 경쟁률 (1순위)</h3>
              <span>{rank1.length}개 주택형</span>
            </div>
            {cmpetLoading ? (
              <div style={{ textAlign: "center", color: "var(--faint)", padding: 20 }}>불러오는 중...</div>
            ) : rank1.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--faint)", padding: 20 }}>경쟁률 데이터 없음 (접수 전)</div>
            ) : (
              <div className="hbar">
                {rank1.map((c, i) => {
                  const rate = parseFloat(c.CMPET_RATE) || 0;
                  const heat = getHeat(rate);
                  const pct  = Math.max(4, (rate / maxRate) * 100);
                  return (
                    <div className="hbar-row" key={i} style={{ gridTemplateColumns: "88px 1fr" }}>
                      <div className="hbar-label">
                        <span className="hbar-name">{c.HOUSE_TY}</span>
                        <span className="hbar-units">{Number(c.SUPLY_HSHLDCO).toLocaleString()}세대</span>
                      </div>
                      <div className="hbar-track">
                        <div className="hbar-fill" style={{ width: pct + "%", background: heat.color }} />
                        <span className="hbar-val">
                          {rate === 0 ? "미달" : `${rate}배`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 일정 */}
          {schedule.length > 0 && (
            <div className="m-block">
              <div className="m-block-head"><h3>청약 일정</h3></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {schedule.map((s, i) => {
                  const today = new Date().toISOString().slice(0, 10);
                  const isPast = s.date && s.date < today;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                        background: isPast ? "var(--primary)" : "var(--line-2)"
                      }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", width: 80 }}>{s.label}</span>
                      <span style={{ fontSize: 13, color: isPast ? "var(--ink)" : "var(--faint)", fontWeight: 600 }}>
                        {s.date?.slice(0, 10) || "-"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 지역 카드 (경쟁률 탭) ────────────────────
function RegionCard({ item, reqst, onSelect }: { item: CompItem; reqst?: AgeItem; onSelect: () => void }) {
  const rate = parseFloat(item.SUPLY_CMPET_RATE) || 0;
  const heat = getHeat(rate);
  const totalAge = reqst
    ? (parseInt(reqst.AGE_30)||0)+(parseInt(reqst.AGE_40)||0)+(parseInt(reqst.AGE_50)||0)+(parseInt(reqst.AGE_60)||0)
    : 0;
  return (
    <button className="ccard" onClick={onSelect}>
      <div className="ccard-head">
        <div className="ccard-badges">
          <span className="heat-badge" style={{ color: heat.color, background: heat.bg }}>{heat.label}</span>
        </div>
      </div>
      <div className="ccard-title">
        <h3>{item.SUBSCRPT_AREA_CODE_NM}</h3>
        <div className="ccard-meta">일반 {Number(item.SUPLY_HSHLDCO).toLocaleString()}세대 · 특공 {Number(item.SPSPLY_HSHLDCO).toLocaleString()}세대</div>
      </div>
      <div className="ccard-hero">
        <div className="ccard-comp">
          <span className="cc-comp-num">{rate.toFixed(1)}</span>
          <span className="cc-comp-unit">:1</span>
          <span className="cc-comp-lbl">일반공급 경쟁률</span>
        </div>
      </div>
      <div className="ccard-foot">
        <div className="cc-stat"><span>일반 신청</span><b>{Number(item.SUPLY_REQ_CNT).toLocaleString()}건</b></div>
        <div className="cc-stat"><span>특공 신청</span><b>{Number(item.SPSPLY_REQ_CNT).toLocaleString()}건</b></div>
        {totalAge > 0 && <div className="cc-stat"><span>신청자 합계</span><b>{totalAge.toLocaleString()}명</b></div>}
      </div>
    </button>
  );
}

// ── 지역 상세 모달 ───────────────────────────
function RegionModal({ item, reqst, winner, onClose }: { item: CompItem; reqst?: AgeItem; winner?: AgeItem; onClose: () => void }) {
  const rate = parseFloat(item.SUPLY_CMPET_RATE) || 0;
  const spsplyRate = parseFloat(item.SPSPLY_CMPET_RATE) || 0;
  const heat = getHeat(rate);
  const ageLabels = ["30대", "40대", "50대", "60대↑"];
  const reqstData = reqst ? [parseInt(reqst.AGE_30)||0,parseInt(reqst.AGE_40)||0,parseInt(reqst.AGE_50)||0,parseInt(reqst.AGE_60)||0] : [];
  const winnerData = winner ? [parseInt(winner.AGE_30)||0,parseInt(winner.AGE_40)||0,parseInt(winner.AGE_50)||0,parseInt(winner.AGE_60)||0] : [];
  const maxR = Math.max(...reqstData, 1);
  const maxW = Math.max(...winnerData, 1);

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-hero">
          <div className="mh-badges">
            <span className="heat-badge" style={{ color: heat.color, background: "rgba(255,255,255,.16)" }}>{heat.label}</span>
          </div>
          <h2>{item.SUBSCRPT_AREA_CODE_NM} 청약 현황</h2>
          <div className="mh-meta">{fmtStatDe(item.STAT_DE)} 기준</div>
          <div className="mh-stats">
            <div><span>일반공급 경쟁률</span><b>{rate.toFixed(1)}<em>:1</em></b></div>
            <div><span>특공 경쟁률</span><b>{spsplyRate.toFixed(1)}<em>:1</em></b></div>
            <div><span>일반공급 세대</span><b>{Number(item.SUPLY_HSHLDCO).toLocaleString()}<em>세대</em></b></div>
            <div><span>특공 세대</span><b>{Number(item.SPSPLY_HSHLDCO).toLocaleString()}<em>세대</em></b></div>
          </div>
        </div>
        <div className="modal-body">
          <div className="m-block">
            <div className="m-block-head"><h3>일반 vs 특별공급 경쟁률</h3></div>
            <div className="hbar">
              {[{ name: "일반공급", val: rate, units: Number(item.SUPLY_HSHLDCO) },
                { name: "특별공급", val: spsplyRate, units: Number(item.SPSPLY_HSHLDCO) }].map(d => (
                <div className="hbar-row" key={d.name}>
                  <div className="hbar-label">
                    <span className="hbar-name">{d.name}</span>
                    <span className="hbar-units">{d.units.toLocaleString()}세대</span>
                  </div>
                  <div className="hbar-track">
                    <div className="hbar-fill" style={{ width: Math.max(4,(d.val/Math.max(rate,spsplyRate,1))*100)+"%", background:"var(--primary)" }} />
                    <span className="hbar-val">{d.val.toFixed(1)}<em>배</em></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {reqstData.length > 0 && (
            <div className="m-cols">
              <div className="m-block">
                <div className="m-block-head"><h3>연령별 신청자</h3></div>
                <div className="hbar">
                  {ageLabels.map((lbl, i) => (
                    <div className="hbar-row" key={lbl}>
                      <div className="hbar-label"><span className="hbar-name">{lbl}</span></div>
                      <div className="hbar-track">
                        <div className="hbar-fill" style={{ width: Math.max(4,(reqstData[i]/maxR)*100)+"%", background:"var(--sp-1)" }} />
                        <span className="hbar-val">{reqstData[i].toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {winnerData.length > 0 && (
                <div className="m-block">
                  <div className="m-block-head"><h3>연령별 당첨자</h3></div>
                  <div className="hbar">
                    {ageLabels.map((lbl, i) => (
                      <div className="hbar-row" key={lbl}>
                        <div className="hbar-label"><span className="hbar-name">{lbl}</span></div>
                        <div className="hbar-track">
                          <div className="hbar-fill" style={{ width: Math.max(4,(winnerData[i]/maxW)*100)+"%", background:"var(--mint)" }} />
                          <span className="hbar-val">{winnerData[i].toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 연령 카드 ────────────────────────────────
const AGE_COLORS = ["var(--sp-1)","var(--sp-3)","var(--sp-4)","var(--sp-5)"];
function AgeCard({ item, accent }: { item: AgeItem; accent: string }) {
  const ages = [
    { label:"30대", val:parseInt(item.AGE_30)||0 },
    { label:"40대", val:parseInt(item.AGE_40)||0 },
    { label:"50대", val:parseInt(item.AGE_50)||0 },
    { label:"60대↑", val:parseInt(item.AGE_60)||0 },
  ];
  const total = ages.reduce((s,a) => s+a.val, 0);
  const max   = Math.max(...ages.map(a=>a.val), 1);
  const topAge = ages.reduce((a,b) => a.val>=b.val?a:b);
  return (
    <div className="ccard" style={{ cursor:"default" }}>
      <div className="ccard-title">
        <h3>{item.SUBSCRPT_AREA_CODE_NM}</h3>
        <div className="ccard-meta">합계 {total.toLocaleString()}명</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {ages.map((a,i) => (
          <div key={a.label} style={{ display:"grid", gridTemplateColumns:"44px 1fr", gap:10, alignItems:"center" }}>
            <span style={{ fontSize:13, fontWeight:700, color:"var(--ink)" }}>{a.label}</span>
            <div style={{ position:"relative", height:26, background:"var(--surface-3)", borderRadius:7 }}>
              <div style={{ height:"100%", width:Math.max(4,(a.val/max)*100)+"%", borderRadius:7, background:AGE_COLORS[i], transition:"width 0.8s cubic-bezier(.22,1,.36,1)" }} />
              <span style={{ position:"absolute", right:9, top:"50%", transform:"translateY(-50%)", fontSize:12, fontWeight:800, color:"var(--ink)" }}>{a.val.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="ccard-foot" style={{ borderTop:"1px solid var(--line)", paddingTop:12 }}>
        <div className="cc-stat"><span>최다 연령</span><b style={{ color:accent }}>{topAge.label}</b></div>
        <div className="cc-stat"><span>최다 인원</span><b>{topAge.val.toLocaleString()}명</b></div>
        <div className="cc-stat"><span>전체</span><b>{total.toLocaleString()}명</b></div>
      </div>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────
const STATUS_OPTS = ["전체","접수중","접수예정","접수마감"];
const REGIONS = ["전체","서울","경기","인천","부산","대구","광주","대전","울산","세종","충남","충북","전남","전북","경남","경북","강원","제주"];

export default function Home() {
  const [tab, setTab] = useState<Tab>("분양정보");

  // 분양정보 상태
  const [aptItems,     setAptItems]     = useState<AptItem[]>([]);
  const [aptLoading,   setAptLoading]   = useState(false);
  const [aptError,     setAptError]     = useState("");
  const [aptPage,      setAptPage]      = useState(1);
  const [aptTotal,     setAptTotal]     = useState(0);
  const [aptRegion,    setAptRegion]    = useState("전체");  // 시/도
  const [aptDistrict,  setAptDistrict]  = useState("전체");  // 구/군
  const [aptStatus,    setAptStatus]    = useState("전체");
  const [aptQuery,     setAptQuery]     = useState("");
  const [selectedApt,  setSelectedApt]  = useState<AptItem | null>(null);

  // 통계 상태
  const [statDe,       setStatDe]       = useState("");
  const [availMonths,  setAvailMonths]  = useState<string[]>([]);
  const [compItems,    setCompItems]    = useState<CompItem[]>([]);
  const [reqstItems,   setReqstItems]   = useState<AgeItem[]>([]);
  const [winnerItems,  setWinnerItems]  = useState<AgeItem[]>([]);
  const [statLoading,  setStatLoading]  = useState(false);
  const [statError,    setStatError]    = useState("");
  const [selectedRegion, setSelectedRegion] = useState<CompItem | null>(null);
  const [regionFilter, setRegionFilter] = useState("전체");

  // ESC 키
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSelectedApt(null); setSelectedRegion(null); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  // ── 분양정보 로드 ───────────────────────────
  const loadAptData = useCallback(() => {
    if (tab !== "분양정보") return;
    setAptError("");
    setAptLoading(true);
    const params = new URLSearchParams({ page: String(aptPage), perPage: "20" });
    if (aptRegion !== "전체") params.set("region", aptRegion);
    fetch(`/api/apt-list?${params}`)
      .then(async r => {
        const d = await r.json();
        if (!r.ok || d?.error) throw new Error(d?.error ?? `HTTP ${r.status}`);
        setAptItems(d?.data ?? []);
        setAptTotal(d?.totalCount ?? 0);
      })
      .catch(e => setAptError(String(e)))
      .finally(() => setAptLoading(false));
  }, [tab, aptPage, aptRegion]);

  useEffect(() => { loadAptData(); }, [loadAptData]);

  // ── 통계 초기 연월 로드 ─────────────────────
  useEffect(() => {
    fetch("/api/competition?numOfRows=100")
      .then(r => r.json())
      .then(d => {
        const items: CompItem[] = d?.data ?? [];
        const months = Array.from(new Set(items.map(i => i.STAT_DE))).sort().reverse();
        setAvailMonths(months as string[]);
        if (months.length > 0) setStatDe(months[0] as string);
      });
  }, []);

  // ── 통계 데이터 로드 ────────────────────────
  const loadStatData = useCallback(() => {
    if (!statDe || tab === "분양정보") return;
    setStatError("");
    setStatLoading(true);
    const qs = `statDe=${statDe}&numOfRows=20`;
    Promise.all([
      fetch(`/api/competition?${qs}`).then(r => r.json()),
      fetch(`/api/apt-info?${qs}`).then(r => r.json()),
      fetch(`/api/winners?${qs}`).then(r => r.json()),
    ]).then(([comp, reqst, winner]) => {
      if (comp?.error || reqst?.error || winner?.error)
        throw new Error(comp?.error ?? reqst?.error ?? winner?.error);
      setCompItems(comp?.data ?? []);
      setReqstItems(reqst?.data ?? []);
      setWinnerItems(winner?.data ?? []);
    }).catch(e => setStatError(String(e)))
      .finally(() => setStatLoading(false));
  }, [statDe, tab]);

  useEffect(() => { loadStatData(); }, [loadStatData]);

  // ── 구/군 추출 유틸 ────────────────────────
  // "서울특별시 강남구 개포동..." → "강남구"
  function extractDistrict(addr: string): string {
    if (!addr) return "";
    const match = addr.match(/(\S+[구군])/);
    return match ? match[1] : "";
  }

  // 현재 로드된 데이터에서 구 목록 추출
  const availDistricts = aptRegion !== "전체"
    ? ["전체", ...Array.from(new Set(
        aptItems.map(a => extractDistrict(a.HSSPLY_ADRES)).filter(Boolean)
      )).sort()]
    : [];

  // 지역 변경 시 구 초기화
  const handleRegionChange = (region: string) => {
    setAptRegion(region);
    setAptDistrict("전체");
    setAptPage(1);
  };

  // ── 분양정보 필터 ───────────────────────────
  const filteredApts = aptItems.filter(apt => {
    const st = getStatus(apt).label;
    if (aptStatus !== "전체" && st !== aptStatus) return false;
    if (aptQuery && !apt.HOUSE_NM.includes(aptQuery) && !apt.HSSPLY_ADRES?.includes(aptQuery)) return false;
    if (aptDistrict !== "전체" && extractDistrict(apt.HSSPLY_ADRES) !== aptDistrict) return false;
    return true;
  });

  // ── 통계 요약 ───────────────────────────────
  const totalReqst  = compItems.reduce((s,i) => s+(parseInt(i.SUPLY_REQ_CNT)||0), 0);
  const totalSuply  = compItems.reduce((s,i) => s+(parseInt(i.SUPLY_HSHLDCO)||0), 0);
  const avgComp     = compItems.length ? compItems.reduce((s,i) => s+(parseFloat(i.SUPLY_CMPET_RATE)||0), 0) / compItems.length : 0;
  const topCompItem = compItems.length ? compItems.reduce((a,b) => (parseFloat(a.SUPLY_CMPET_RATE)||0) >= (parseFloat(b.SUPLY_CMPET_RATE)||0) ? a : b) : null;
  const ranking     = compItems.slice().sort((a,b) => (parseFloat(b.SUPLY_CMPET_RATE)||0)-(parseFloat(a.SUPLY_CMPET_RATE)||0)).slice(0,5);
  const totalReqstAge  = reqstItems.reduce((s,i) => s+(parseInt(i.AGE_30)||0)+(parseInt(i.AGE_40)||0)+(parseInt(i.AGE_50)||0)+(parseInt(i.AGE_60)||0), 0);
  const totalWinnerAge = winnerItems.reduce((s,i) => s+(parseInt(i.AGE_30)||0)+(parseInt(i.AGE_40)||0)+(parseInt(i.AGE_50)||0)+(parseInt(i.AGE_60)||0), 0);

  function topAgeLabel(items: AgeItem[]) {
    const s = { "30대":0,"40대":0,"50대":0,"60대↑":0 };
    items.forEach(i => { s["30대"]+=(parseInt(i.AGE_30)||0); s["40대"]+=(parseInt(i.AGE_40)||0); s["50대"]+=(parseInt(i.AGE_50)||0); s["60대↑"]+=(parseInt(i.AGE_60)||0); });
    return Object.entries(s).reduce((a,b)=>a[1]>=b[1]?a:b)[0];
  }

  const activeStatItems = tab==="경쟁률" ? compItems : tab==="신청자" ? reqstItems : winnerItems;
  const statRegions = ["전체",...Array.from(new Set(activeStatItems.map(i=>i.SUBSCRPT_AREA_CODE_NM)))];
  const filteredStat = regionFilter==="전체" ? activeStatItems : activeStatItems.filter(i=>i.SUBSCRPT_AREA_CODE_NM===regionFilter);
  const getReqst  = (nm:string) => reqstItems.find(r=>r.SUBSCRPT_AREA_CODE_NM===nm);
  const getWinner = (nm:string) => winnerItems.find(r=>r.SUBSCRPT_AREA_CODE_NM===nm);
  const ageRanking = (items:AgeItem[]) => items.slice().sort((a,b)=>{
    const sum=(i:AgeItem)=>(parseInt(i.AGE_30)||0)+(parseInt(i.AGE_40)||0)+(parseInt(i.AGE_50)||0)+(parseInt(i.AGE_60)||0);
    return sum(b)-sum(a);
  }).slice(0,5);

  // 분양정보 요약
  const liveCount    = aptItems.filter(a => getStatus(a).label === "접수중").length;
  const soonCount    = aptItems.filter(a => getStatus(a).label === "접수예정").length;
  const totalUnits   = aptItems.reduce((s,a) => s+(parseInt(a.TOT_SUPLY_HSHLDCO)||0), 0);

  return (
    <>
      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-mark"><span /></div>
            <div className="brand-text">
              <strong>청약 인사이트</strong>
              <em>Cheongyak Insight</em>
            </div>
          </div>
          <nav className="topnav">
            {(["분양정보","경쟁률","신청자","당첨통계"] as Tab[]).map(t => (
              <a key={t} className={tab===t?"active":""} onClick={() => { setTab(t); setRegionFilter("전체"); }}>
                {t}
              </a>
            ))}
          </nav>
          <div className="topbar-right">
            {tab === "분양정보"
              ? <span className="period-pill">실시간 분양정보</span>
              : <span className="period-pill">{fmtStatDe(statDe)}</span>
            }
            <div className="avatar">청</div>
          </div>
        </div>
      </header>

      <main className="container">

        {/* ── 분양정보 탭 ── */}
        {tab === "분양정보" && (
          <>
            <section className="headline">
              <div className="headline-eyebrow">실시간 청약 인사이트 · 분양정보</div>
              <h1 className="headline-title">
                전국 <b>{aptTotal.toLocaleString()}개</b> 단지 중<br />
                <span className="hl-accent">{liveCount}개</span>가 지금 접수중이에요
              </h1>
            </section>

            <section className="summary">
              <div className="stat-card primary"><div className="stat-icon">🏢</div><div className="stat-label">전체 단지</div><div className="stat-value">{aptTotal.toLocaleString()}<span className="stat-unit">개</span></div><div className="stat-sub">조회된 분양단지</div></div>
              <div className="stat-card heat"><div className="stat-icon">🔴</div><div className="stat-label">접수중</div><div className="stat-value">{liveCount}<span className="stat-unit">개</span></div><div className="stat-sub">지금 바로 청약 가능</div></div>
              <div className="stat-card ink"><div className="stat-icon">🔜</div><div className="stat-label">접수예정</div><div className="stat-value">{soonCount}<span className="stat-unit">개</span></div><div className="stat-sub">곧 청약 시작</div></div>
              <div className="stat-card mint"><div className="stat-icon">🏠</div><div className="stat-label">총 공급세대</div><div className="stat-value">{(totalUnits/1000).toFixed(1)}<span className="stat-unit">천세대</span></div><div className="stat-sub">이번 페이지 기준</div></div>
            </section>

            <div className="layout">
              <div className="col-main">
                {/* 필터바 */}
                <div className="filterbar">
                  <div style={{ display:"flex", alignItems:"center", gap:9, background:"var(--surface-3)", borderRadius:11, padding:"0 13px", height:44, border:"1.5px solid transparent" }}>
                    <span style={{ color:"var(--faint)", fontSize:17 }}>🔍</span>
                    <input
                      value={aptQuery}
                      onChange={e => setAptQuery(e.target.value)}
                      placeholder="단지명·주소 검색"
                      style={{ flex:1, border:"none", outline:"none", background:"none", fontSize:15, fontWeight:500, color:"var(--ink)" }}
                    />
                    {aptQuery && <button onClick={() => setAptQuery("")} style={{ color:"var(--faint)", fontSize:20 }}>×</button>}
                  </div>
                  {/* 시/도 */}
                  <div className="filter-chips">
                    {REGIONS.map(r => (
                      <button key={r} className={"chip"+(aptRegion===r?" on":"")} onClick={() => handleRegionChange(r)}>{r}</button>
                    ))}
                  </div>

                  {/* 구/군 — 시/도 선택 시만 표시 */}
                  {availDistricts.length > 1 && (
                    <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"nowrap", overflowX:"auto", paddingBottom:2 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:"var(--faint)", flexShrink:0 }}>구·군</span>
                      <div style={{ display:"flex", gap:6, flexWrap:"nowrap" }}>
                        {availDistricts.map(d => (
                          <button
                            key={d}
                            onClick={() => setAptDistrict(d)}
                            style={{
                              fontSize: 12.5, fontWeight: 600, padding: "5px 11px",
                              borderRadius: 20, whiteSpace: "nowrap", cursor: "pointer",
                              background: aptDistrict === d ? "var(--primary)" : "var(--primary-soft)",
                              color: aptDistrict === d ? "#fff" : "var(--primary-strong)",
                              border: "none", transition: ".15s",
                              flexShrink: 0,
                            }}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="filter-row">
                    <div style={{ display:"flex", background:"var(--surface-3)", borderRadius:10, padding:3 }}>
                      {STATUS_OPTS.map(s => (
                        <button key={s} style={{
                          fontSize:13.5, fontWeight:600, color: aptStatus===s?"var(--ink)":"var(--text)",
                          padding:"7px 14px", borderRadius:8, background: aptStatus===s?"#fff":"transparent",
                          boxShadow: aptStatus===s?"var(--sh-1)":"none", transition:".15s"
                        }} onClick={() => setAptStatus(s)}>{s}</button>
                      ))}
                    </div>
                    <div className="result-count">
                      <b>{filteredApts.length}</b>개 단지
                      {aptDistrict !== "전체" && <span style={{ color:"var(--primary)", marginLeft:6 }}>· {aptDistrict}</span>}
                    </div>
                  </div>
                </div>

                {/* 에러 배너 */}
                {aptError && (
                  <div style={{ background:"var(--heat-1-bg)", border:"1px solid var(--heat-1)", borderRadius:"var(--r-md)", padding:"14px 18px", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:14, fontWeight:600, color:"var(--heat-1)" }}>⚠️ {aptError}</span>
                    <button onClick={loadAptData} style={{ fontSize:13, fontWeight:700, color:"var(--heat-1)", padding:"6px 14px", borderRadius:8, background:"rgba(240,62,62,.12)", cursor:"pointer" }}>재시도</button>
                  </div>
                )}

                {/* 카드 그리드 */}
                {aptLoading ? (
                  <div className="empty">데이터를 불러오는 중...</div>
                ) : filteredApts.length === 0 && !aptError ? (
                  <div className="empty">조회된 단지가 없어요.</div>
                ) : (
                  <div className="card-grid">
                    {filteredApts.map(apt => (
                      <AptCard key={apt.HOUSE_MANAGE_NO} apt={apt} onSelect={() => setSelectedApt(apt)} />
                    ))}
                  </div>
                )}

                {/* 페이지네이션 */}
                {aptTotal > 20 && (
                  <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:24 }}>
                    <button className="chip" onClick={() => setAptPage(p => Math.max(1, p-1))} disabled={aptPage===1}>← 이전</button>
                    <span style={{ display:"flex", alignItems:"center", fontSize:13, fontWeight:700, color:"var(--text)", padding:"0 8px" }}>
                      {aptPage} / {Math.ceil(aptTotal/20)}
                    </span>
                    <button className="chip" onClick={() => setAptPage(p => p+1)} disabled={aptPage>=Math.ceil(aptTotal/20)}>다음 →</button>
                  </div>
                )}
              </div>

              {/* 사이드바 */}
              <aside className="col-side">
                <div className="side-card">
                  <div className="side-head"><span>🔴</span><h4>접수중 단지</h4></div>
                  <ul className="rank-list">
                    {aptItems.filter(a => getStatus(a).label === "접수중").slice(0,5).map((apt, i) => (
                      <li key={apt.HOUSE_MANAGE_NO} onClick={() => setSelectedApt(apt)}>
                        <div className={`rank-no ${i===0?"n1":i===1?"n2":i===2?"n3":""}`}>{i+1}</div>
                        <div className="rank-info">
                          <strong>{apt.HOUSE_NM}</strong>
                          <span>{apt.SUBSCRPT_AREA_CODE_NM} · {Number(apt.TOT_SUPLY_HSHLDCO||0).toLocaleString()}세대</span>
                        </div>
                      </li>
                    ))}
                    {aptItems.filter(a => getStatus(a).label === "접수중").length === 0 && (
                      <li style={{ padding:"16px 4px", color:"var(--faint)", fontSize:13, fontWeight:600 }}>접수중인 단지 없음</li>
                    )}
                  </ul>
                </div>
                <div className="side-card">
                  <div className="side-head"><span>🔜</span><h4>접수예정 단지</h4></div>
                  <ul className="rank-list">
                    {aptItems.filter(a => getStatus(a).label === "접수예정").slice(0,5).map((apt, i) => (
                      <li key={apt.HOUSE_MANAGE_NO} onClick={() => setSelectedApt(apt)}>
                        <div className="rank-no">{i+1}</div>
                        <div className="rank-info">
                          <strong>{apt.HOUSE_NM}</strong>
                          <span>{apt.RCEPT_BGNDE?.slice(0,10)} 시작</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </>
        )}

        {/* ── 경쟁률 탭 ── */}
        {tab === "경쟁률" && (
          <>
            <section className="headline">
              <div className="headline-eyebrow">{fmtStatDe(statDe)} 청약 인사이트 · 경쟁률</div>
              <h1 className="headline-title">이번 달 <b>{compItems.length}개</b> 지역에<br /><span className="hl-accent">{totalReqst.toLocaleString()}건</span>의 청약이 접수됐어요</h1>
            </section>
            <section className="summary">
              <div className="stat-card primary"><div className="stat-icon">🏢</div><div className="stat-label">조회 지역</div><div className="stat-value">{compItems.length}<span className="stat-unit">개</span></div><div className="stat-sub">전국 지역별</div></div>
              <div className="stat-card heat"><div className="stat-icon">🔥</div><div className="stat-label">평균 경쟁률</div><div className="stat-value">{avgComp.toFixed(1)}<span className="stat-unit">:1</span></div><div className="stat-sub">일반공급 기준</div></div>
              <div className="stat-card ink"><div className="stat-icon">🏠</div><div className="stat-label">총 공급 세대</div><div className="stat-value">{totalSuply.toLocaleString()}<span className="stat-unit">세대</span></div><div className="stat-sub">일반공급 합계</div></div>
              <div className="stat-card mint"><div className="stat-icon">📋</div><div className="stat-label">총 신청 건수</div><div className="stat-value">{(totalReqst/1000).toFixed(1)}<span className="stat-unit">천건</span></div><div className="stat-sub">일반공급 신청</div></div>
            </section>
            <div className="layout">
              <div className="col-main">
                <div className="filterbar">
                  <div className="filter-chips">{statRegions.map(r=><button key={r} className={"chip"+(regionFilter===r?" on":"")} onClick={()=>setRegionFilter(r)}>{r}</button>)}</div>
                  <div className="filter-row">
                    <div className="result-count"><b>{filteredStat.length}</b>개 지역 · {fmtStatDe(statDe)}</div>
                    <select style={{fontFamily:"inherit",fontSize:14,fontWeight:700,border:"none",background:"none",cursor:"pointer",color:"var(--ink)"}} value={statDe} onChange={e=>setStatDe(e.target.value)}>
                      {availMonths.map(m=><option key={m} value={m}>{fmtStatDe(m)}</option>)}
                    </select>
                  </div>
                </div>
                {statError && (
                  <div style={{ background:"var(--heat-1-bg)", border:"1px solid var(--heat-1)", borderRadius:"var(--r-md)", padding:"14px 18px", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:14, fontWeight:600, color:"var(--heat-1)" }}>⚠️ {statError}</span>
                    <button onClick={loadStatData} style={{ fontSize:13, fontWeight:700, color:"var(--heat-1)", padding:"6px 14px", borderRadius:8, background:"rgba(240,62,62,.12)", cursor:"pointer" }}>재시도</button>
                  </div>
                )}
                {statLoading ? <div className="empty">불러오는 중...</div> : filteredStat.length === 0 && !statError ? <div className="empty">조회된 지역이 없어요.</div> : (
                  <div className="card-grid">
                    {(filteredStat as CompItem[]).map(item=>(
                      <RegionCard key={item.SUBSCRPT_AREA_CODE} item={item} reqst={getReqst(item.SUBSCRPT_AREA_CODE_NM)} onSelect={()=>setSelectedRegion(item)} />
                    ))}
                  </div>
                )}
              </div>
              <aside className="col-side">
                <div className="side-card">
                  <div className="side-head"><span>🏆</span><h4>경쟁률 TOP 5</h4></div>
                  <ul className="rank-list">
                    {ranking.map((item,i)=>(
                      <li key={item.SUBSCRPT_AREA_CODE} onClick={()=>setSelectedRegion(item)}>
                        <div className={`rank-no ${i===0?"n1":i===1?"n2":i===2?"n3":""}`}>{i+1}</div>
                        <div className="rank-info"><strong>{item.SUBSCRPT_AREA_CODE_NM}</strong><span>일반 {Number(item.SUPLY_HSHLDCO).toLocaleString()}세대</span></div>
                        <div className="rank-comp">{parseFloat(item.SUPLY_CMPET_RATE).toFixed(1)}<em>배</em></div>
                      </li>
                    ))}
                  </ul>
                </div>
                {topCompItem && (
                  <div className="side-card">
                    <div className="side-head"><span>⚡</span><h4>최고 경쟁 지역</h4></div>
                    <div style={{padding:"12px 4px 8px"}}>
                      <div style={{fontSize:22,fontWeight:800,color:"var(--heat-1)"}}>{topCompItem.SUBSCRPT_AREA_CODE_NM}</div>
                      <div style={{fontSize:13,color:"var(--faint)",fontWeight:600,marginTop:4}}>경쟁률 {parseFloat(topCompItem.SUPLY_CMPET_RATE).toFixed(1)}배</div>
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </>
        )}

        {/* ── 신청자/당첨통계 탭 ── */}
        {(tab === "신청자" || tab === "당첨통계") && (
          <>
            <section className="headline">
              <div className="headline-eyebrow">{fmtStatDe(statDe)} 청약 인사이트 · {tab}</div>
              <h1 className="headline-title">
                이번 달 <b>{filteredStat.length}개</b> 지역에서<br />
                <span className="hl-accent">{tab==="신청자" ? totalReqstAge.toLocaleString() : totalWinnerAge.toLocaleString()}명</span>이 {tab==="신청자"?"청약을 신청했어요":"당첨됐어요"}
              </h1>
            </section>
            {tab === "신청자" ? (
              <section className="summary">
                <div className="stat-card primary"><div className="stat-icon">👥</div><div className="stat-label">총 신청자</div><div className="stat-value">{(totalReqstAge/10000).toFixed(1)}<span className="stat-unit">만명</span></div><div className="stat-sub">전국 합계</div></div>
                <div className="stat-card heat"><div className="stat-icon">🔝</div><div className="stat-label">최다 연령대</div><div className="stat-value" style={{fontSize:22}}>{topAgeLabel(reqstItems)}</div><div className="stat-sub">전국 기준</div></div>
                <div className="stat-card ink"><div className="stat-icon">📍</div><div className="stat-label">조회 지역</div><div className="stat-value">{reqstItems.length}<span className="stat-unit">개</span></div><div className="stat-sub">지역별 통계</div></div>
                <div className="stat-card mint"><div className="stat-icon">📊</div><div className="stat-label">평균 신청자</div><div className="stat-value">{reqstItems.length?Math.round(totalReqstAge/reqstItems.length).toLocaleString():0}<span className="stat-unit">명</span></div><div className="stat-sub">지역당 평균</div></div>
              </section>
            ) : (
              <section className="summary">
                <div className="stat-card primary"><div className="stat-icon">🏆</div><div className="stat-label">총 당첨자</div><div className="stat-value">{totalWinnerAge.toLocaleString()}<span className="stat-unit">명</span></div><div className="stat-sub">전국 합계</div></div>
                <div className="stat-card heat"><div className="stat-icon">🎯</div><div className="stat-label">최다 연령대</div><div className="stat-value" style={{fontSize:22}}>{topAgeLabel(winnerItems)}</div><div className="stat-sub">전국 기준</div></div>
                <div className="stat-card ink"><div className="stat-icon">📍</div><div className="stat-label">조회 지역</div><div className="stat-value">{winnerItems.length}<span className="stat-unit">개</span></div><div className="stat-sub">지역별 통계</div></div>
                <div className="stat-card mint"><div className="stat-icon">📈</div><div className="stat-label">평균 당첨자</div><div className="stat-value">{winnerItems.length?Math.round(totalWinnerAge/winnerItems.length).toLocaleString():0}<span className="stat-unit">명</span></div><div className="stat-sub">지역당 평균</div></div>
              </section>
            )}
            <div className="layout">
              <div className="col-main">
                <div className="filterbar">
                  <div className="filter-chips">{statRegions.map(r=><button key={r} className={"chip"+(regionFilter===r?" on":"")} onClick={()=>setRegionFilter(r)}>{r}</button>)}</div>
                  <div className="filter-row">
                    <div className="result-count"><b>{filteredStat.length}</b>개 지역</div>
                    <select style={{fontFamily:"inherit",fontSize:14,fontWeight:700,border:"none",background:"none",cursor:"pointer",color:"var(--ink)"}} value={statDe} onChange={e=>setStatDe(e.target.value)}>
                      {availMonths.map(m=><option key={m} value={m}>{fmtStatDe(m)}</option>)}
                    </select>
                  </div>
                </div>
                {statError && (
                  <div style={{ background:"var(--heat-1-bg)", border:"1px solid var(--heat-1)", borderRadius:"var(--r-md)", padding:"14px 18px", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:14, fontWeight:600, color:"var(--heat-1)" }}>⚠️ {statError}</span>
                    <button onClick={loadStatData} style={{ fontSize:13, fontWeight:700, color:"var(--heat-1)", padding:"6px 14px", borderRadius:8, background:"rgba(240,62,62,.12)", cursor:"pointer" }}>재시도</button>
                  </div>
                )}
                {statLoading ? <div className="empty">불러오는 중...</div> : filteredStat.length === 0 && !statError ? <div className="empty">조회된 지역이 없어요.</div> : (
                  <div className="card-grid">
                    {(filteredStat as AgeItem[]).map(item=>(
                      <AgeCard key={item.SUBSCRPT_AREA_CODE_NM} item={item} accent={tab==="신청자"?"var(--sp-1)":"var(--mint)"} />
                    ))}
                  </div>
                )}
              </div>
              <aside className="col-side">
                <div className="side-card">
                  <div className="side-head"><span>{tab==="신청자"?"👥":"🏆"}</span><h4>{tab==="신청자"?"신청자":"당첨자"} TOP 5</h4></div>
                  <ul className="rank-list">
                    {ageRanking(tab==="신청자"?reqstItems:winnerItems).map((item,i)=>{
                      const total=(parseInt(item.AGE_30)||0)+(parseInt(item.AGE_40)||0)+(parseInt(item.AGE_50)||0)+(parseInt(item.AGE_60)||0);
                      return (
                        <li key={item.SUBSCRPT_AREA_CODE_NM} style={{cursor:"default"}}>
                          <div className={`rank-no ${i===0?"n1":i===1?"n2":i===2?"n3":""}`}>{i+1}</div>
                          <div className="rank-info"><strong>{item.SUBSCRPT_AREA_CODE_NM}</strong><span>30대 {parseInt(item.AGE_30).toLocaleString()}명</span></div>
                          <div className="rank-comp">{total.toLocaleString()}<em>명</em></div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </aside>
            </div>
          </>
        )}

        <footer className="foot">
          <span>데이터 출처 · 한국부동산원 청약홈 · 공공데이터포털 API</span>
          <span>{tab === "분양정보" ? "실시간 갱신" : fmtStatDe(statDe) + " 기준"}</span>
        </footer>
      </main>

      {selectedApt    && <AptModal    apt={selectedApt}    onClose={()=>setSelectedApt(null)} />}
      {selectedRegion && <RegionModal item={selectedRegion} reqst={getReqst(selectedRegion.SUBSCRPT_AREA_CODE_NM)} winner={getWinner(selectedRegion.SUBSCRPT_AREA_CODE_NM)} onClose={()=>setSelectedRegion(null)} />}
    </>
  );
}
