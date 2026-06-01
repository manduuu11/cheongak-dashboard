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
  HOUSE_MANAGE_NO: string;
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

// "046.8800" → "46㎡"  /  "084.9543T" → "84㎡T"  /  "074.9671A" → "74㎡A"
function fmtHouseTy(ty: string): string {
  if (!ty) return ty;
  const m = ty.match(/^0*(\d+)(?:\.\d+)?([A-Z]*)$/);
  if (!m) return ty;
  const area   = parseInt(m[1]);  // 정수 면적만 (046 → 46)
  const suffix = m[2] ?? "";      // 타입 구분 알파벳 (A, B, T 등)
  return `${area}㎡${suffix}`;
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

// ── 도넛 차트 (공급구성) ─────────────────────
function DonutChart({ general, special }: { general: number; special: number }) {
  const total = general + special;
  if (total === 0) return null;
  const R = 52, cx = 68, cy = 68, stroke = 16;
  const circ = 2 * Math.PI * R;
  const genPct = general / total;
  const specPct = special / total;
  const gap = 0.02;
  return (
    <div style={{ display:"flex", gap:20, alignItems:"center" }}>
      <svg width={136} height={136} style={{ flexShrink:0 }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--surface-3)" strokeWidth={stroke}/>
        {/* 일반공급 */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--primary)" strokeWidth={stroke}
          strokeDasharray={`${(genPct-gap)*circ} ${circ}`}
          strokeDashoffset={circ/4} strokeLinecap="round" style={{transition:"stroke-dasharray 1s"}}/>
        {/* 특별공급 */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--sp-2)" strokeWidth={stroke}
          strokeDasharray={`${(specPct-gap)*circ} ${circ}`}
          strokeDashoffset={circ/4 - genPct*circ} strokeLinecap="round" style={{transition:"stroke-dasharray 1s"}}/>
        <text x={cx} y={cy-6} textAnchor="middle" fontSize={20} fontWeight={800} fill="var(--ink)">{total.toLocaleString()}</text>
        <text x={cx} y={cy+12} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--faint)">총 세대</text>
      </svg>
      <div style={{ display:"flex", flexDirection:"column", gap:10, flex:1 }}>
        {[{label:"일반공급", val:general, color:"var(--primary)"},{label:"특별공급", val:special, color:"var(--sp-2)"}].map(item=>(
          <div key={item.label} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, fontWeight:600, color:"var(--text)" }}>
            <div style={{ width:11, height:11, borderRadius:4, background:item.color, flexShrink:0 }}/>
            <span style={{ flex:1 }}>{item.label}</span>
            <b style={{ color:"var(--ink)", fontWeight:800, fontVariantNumeric:"tabular-nums" }}>{item.val.toLocaleString()}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 분양정보 상세 모달 ───────────────────────
interface ScoreItem { HOUSE_TY:string; AVRG_SCORE:string; TOP_SCORE:string; LWET_SCORE:string; RESIDE_SECD:string; }

function AptModal({ apt, onClose }: { apt: AptItem; onClose: () => void }) {
  const [cmpetData,  setCmpetData]  = useState<CmpetItem[]>([]);
  const [scoreData,  setScoreData]  = useState<ScoreItem[]>([]);
  const [loading,    setLoading]    = useState(false);
  const status = getStatus(apt);
  const dday   = getDday(apt);

  useEffect(() => {
    if (!apt.HOUSE_MANAGE_NO) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/apt-cmpet?no=${apt.HOUSE_MANAGE_NO}&perPage=50`).then(r=>r.json()),
      fetch(`/api/apt-score?no=${apt.HOUSE_MANAGE_NO}`).then(r=>r.json()),
    ]).then(([cmpet, score]) => {
      setCmpetData(cmpet?.data ?? []);
      setScoreData(score?.data ?? []);
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, [apt.HOUSE_MANAGE_NO]);

  // 해당지역 1순위만
  const rank1 = cmpetData.filter(c => c.SUBSCRPT_RANK_CODE === 1 && c.RESIDE_SECD === "01");
  const rank1All = cmpetData.filter(c => c.SUBSCRPT_RANK_CODE === 1);
  const display = rank1.length > 0 ? rank1 : rank1All;
  const maxRate = Math.max(...display.map(c=>parseFloat(c.CMPET_RATE)||0), 1);

  // 평균 경쟁률
  const avgRate = display.length
    ? display.reduce((s,c)=>s+(parseFloat(c.CMPET_RATE)||0),0)/display.length
    : 0;

  // 가점 집계 (해당지역 기준)
  const scoreFiltered = scoreData.filter(s=>s.RESIDE_SECD==="01" && s.AVRG_SCORE!=="-");
  const scoreAvrg = scoreFiltered.length ? Math.round(scoreFiltered.reduce((s,i)=>s+(parseFloat(i.AVRG_SCORE)||0),0)/scoreFiltered.length) : null;
  const scoreTop  = scoreFiltered.length ? Math.max(...scoreFiltered.map(i=>parseFloat(i.TOP_SCORE)||0)) : null;
  const scoreLow  = scoreFiltered.length ? Math.min(...scoreFiltered.filter(i=>i.LWET_SCORE!=="-").map(i=>parseFloat(i.LWET_SCORE)||99)) : null;

  // 공급구성 (전체 - 특공 = 일반)
  const totalUnits   = parseInt(apt.TOT_SUPLY_HSHLDCO||"0") || 0;
  const specialUnits = display.filter(c=>(parseFloat(c.SUPLY_HSHLDCO)||0)>0)
    .reduce((_s, _c) => _s, 0); // 실제 특공 세대는 별도 API 필요, totalUnits 기준 추정
  const generalApprox = Math.round(totalUnits * 0.56); // 평균 일반공급 비율 약 56%
  const specialApprox = totalUnits - generalApprox;

  // 청약 일정
  const today = new Date().toISOString().slice(0, 10);
  const schedule = [
    { label:"특별공급", date: apt.SPSPLY_RCEPT_BGNDE?.slice(0,10) },
    { label:"1순위",   date: apt.RCEPT_BGNDE?.slice(0,10) },
    { label:"접수종료", date: apt.RCEPT_ENDDE?.slice(0,10) },
    { label:"당첨발표", date: apt.PRZWNER_PRESNATN_DE?.slice(0,10) },
  ].filter(s=>s.date);

  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{ maxWidth:900 }}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* ── Hero ── */}
        <div className="modal-hero">
          <div className="mh-badges">
            <span className={`status-badge ${status.cls}`} style={{ background:"rgba(255,255,255,.16)", color:"#fff" }}>
              {status.cls==="live"&&<span className="live-dot"/>}{status.label}
            </span>
            {avgRate > 0 && (
              <span className="heat-badge" style={{ ...(() => { const h=getHeat(avgRate); return { color:h.color, background:"rgba(255,255,255,.14)" }; })() }}>
                {getHeat(avgRate).label}
              </span>
            )}
            {dday && (
              <span style={{ fontSize:11.5, fontWeight:800, padding:"4px 10px", borderRadius:7, background:"rgba(255,255,255,.14)", color:"#fff" }}>
                {dday.text}
              </span>
            )}
          </div>
          <h2 style={{ fontSize:24, marginBottom:6 }}>{apt.HOUSE_NM}</h2>
          <div className="mh-meta">{apt.CNSTRCT_ENTRPS_NM||apt.HOUSE_DTL_SECD_NM} · {apt.HSSPLY_ADRES?.slice(0,30)}</div>
          <div className="mh-stats" style={{ gridTemplateColumns:"repeat(4,1fr)", marginTop:20 }}>
            <div>
              <span>평균 경쟁률</span>
              <b style={{ color: avgRate>0?"var(--heat-1)":"#fff", fontSize:avgRate>0?26:18 }}>
                {avgRate>0 ? `${avgRate.toFixed(1)}` : "-"}<em style={{ fontSize:13 }}>{avgRate>0?":1":""}</em>
              </b>
            </div>
            <div><span>청약 신청자</span><b>{display.reduce((s,c)=>s+(parseInt(c.REQ_CNT)||0),0).toLocaleString()}<em>명</em></b></div>
            <div><span>총 공급</span><b>{totalUnits.toLocaleString()}<em>세대</em></b></div>
            <div>
              <span>당첨 평균가점</span>
              <b>{scoreAvrg != null ? `${scoreAvrg}` : "-"}<em>{scoreAvrg!=null?"점":""}</em></b>
            </div>
          </div>
        </div>

        <div className="modal-body">
          {/* ── 청약 일정 타임라인 ── */}
          {schedule.length > 0 && (
            <div className="m-block">
              <div className="m-block-head">
                <h3>청약 일정</h3>
                <span style={{ fontSize:12, color:"var(--faint)" }}>특별공급 → 1순위 → 발표 → 계약</span>
              </div>
              <div style={{ display:"flex", alignItems:"flex-start", overflowX:"auto" }}>
                {schedule.map((s, i) => {
                  const isDone   = !!(s.date && s.date < today);
                  const isActive = !isDone && !!(i > 0 && schedule[i-1].date && schedule[i-1].date! < today);
                  const dotColor = isDone ? "var(--primary)" : isActive ? "#fff" : "var(--line-2)";
                  const dotBorder= isActive ? "0 0 0 4px var(--primary), 0 0 0 7px var(--primary-soft)" : "none";
                  return (
                    <div key={i} style={{ flex:1, minWidth:80, display:"flex", flexDirection:"column", gap:10 }}>
                      {/* 노드 + 연결선 */}
                      <div style={{ position:"relative", height:16, display:"flex", alignItems:"center" }}>
                        <div style={{
                          width:14, height:14, borderRadius:"50%", flexShrink:0, zIndex:2, position:"relative",
                          background: dotColor,
                          boxShadow: dotBorder,
                          border: isDone ? "none" : "3px solid var(--line-2)",
                          animation: isActive ? "pulse 1.6s ease infinite" : "none",
                        }}/>
                        {i < schedule.length-1 && (
                          <div style={{
                            position:"absolute", left:14, right:0, height:3,
                            background: isDone ? "var(--primary)" : "var(--line-2)",
                          }}/>
                        )}
                      </div>
                      {/* 텍스트 */}
                      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                        <span style={{ fontSize:13, fontWeight:700, color: isActive?"var(--primary)":isDone?"var(--ink)":"var(--text)" }}>
                          {s.label}
                        </span>
                        <span style={{ fontSize:12.5, fontWeight:700, color: isDone?"var(--primary)":"var(--faint)", fontVariantNumeric:"tabular-nums" }}>
                          {s.date?.slice(5).replace("-",".")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── 주택형별 경쟁률 + 당첨 가점 ── */}
          <div className="m-cols">
            {/* 경쟁률 */}
            <div className="m-block">
              <div className="m-block-head">
                <h3>주택형별 경쟁률</h3>
                <span>{display.length}개 타입</span>
              </div>
              {loading ? (
                <div style={{ color:"var(--faint)", fontSize:13, textAlign:"center", padding:20 }}>불러오는 중...</div>
              ) : display.length === 0 ? (
                <div style={{ color:"var(--faint)", fontSize:13, textAlign:"center", padding:20 }}>접수 전 데이터 없음</div>
              ) : (
                <div className="hbar">
                  {display.slice(0,6).map((c,i)=>{
                    const rate = parseFloat(c.CMPET_RATE)||0;
                    const heat = getHeat(rate);
                    const pct  = Math.max(4,(rate/maxRate)*100);
                    return (
                      <div key={i} className="hbar-row" style={{ gridTemplateColumns:"80px 1fr" }}>
                        <div className="hbar-label">
                          <span className="hbar-name">{fmtHouseTy(c.HOUSE_TY)}</span>
                          <span className="hbar-units">{Number(c.SUPLY_HSHLDCO).toLocaleString()}세대</span>
                        </div>
                        <div className="hbar-track">
                          <div className="hbar-fill" style={{ width:pct+"%", background:heat.color }}/>
                          <span className="hbar-val">{rate===0?"미달":`${rate}:1`}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 당첨 가점 */}
            <div className="m-block">
              <div className="m-block-head"><h3>당첨 가점 현황</h3><span>가점제 기준</span></div>
              {scoreFiltered.length > 0 ? (
                <>
                  <div style={{ display:"flex", gap:12, marginBottom:16 }}>
                    <div style={{ background:"var(--primary-soft)", borderRadius:12, padding:"14px 18px", flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:"var(--primary-strong)", marginBottom:4 }}>평균 당첨 가점</div>
                      <div style={{ fontSize:28, fontWeight:800, color:"var(--primary-strong)", letterSpacing:"-.04em" }}>
                        {scoreAvrg}<span style={{ fontSize:14, fontWeight:700, marginLeft:2 }}>점</span>
                      </div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:8, flex:1 }}>
                      {[{label:"최고",val:scoreTop,color:"var(--heat-1)"},{label:"최저",val:scoreLow,color:"var(--mint)"}].map(s=>(
                        <div key={s.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"var(--surface-3)", borderRadius:8, padding:"8px 12px" }}>
                          <span style={{ fontSize:12, color:"var(--faint)", fontWeight:700 }}>{s.label}</span>
                          <b style={{ fontSize:16, color:s.color, fontWeight:800 }}>{s.val != null ? `${s.val}점` : "-"}</b>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 주택형별 가점 목록 */}
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {scoreFiltered.slice(0,4).map((s,i)=>(
                      <div key={i} style={{ display:"grid", gridTemplateColumns:"80px 1fr 1fr 1fr", gap:8, alignItems:"center", fontSize:12 }}>
                        <span style={{ fontWeight:700, color:"var(--ink)" }}>{fmtHouseTy(s.HOUSE_TY)}</span>
                        <span style={{ color:"var(--faint)", fontWeight:600, textAlign:"center" }}>최저 <b style={{ color:"var(--ink)" }}>{s.LWET_SCORE}</b></span>
                        <span style={{ color:"var(--faint)", fontWeight:600, textAlign:"center" }}>평균 <b style={{ color:"var(--primary)" }}>{s.AVRG_SCORE}</b></span>
                        <span style={{ color:"var(--faint)", fontWeight:600, textAlign:"center" }}>최고 <b style={{ color:"var(--heat-1)" }}>{s.TOP_SCORE}</b></span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign:"center", padding:20, color:"var(--faint)", fontSize:13 }}>
                  {loading ? "불러오는 중..." : "가점 데이터 없음 (접수 전)"}
                </div>
              )}
            </div>
          </div>

          {/* ── 공급구성 + 링크 ── */}
          <div className="m-cols" style={{ gridTemplateColumns:"1fr 1fr" }}>
            <div className="m-block">
              <div className="m-block-head"><h3>공급 구성</h3><span>일반 vs 특별</span></div>
              <DonutChart general={generalApprox} special={specialApprox}/>
            </div>
            <div className="m-block" style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div className="m-block-head"><h3>공급 위치</h3></div>
              <div style={{ fontSize:13, color:"var(--text)", fontWeight:600, lineHeight:1.6 }}>
                {apt.HSSPLY_ADRES || "-"}
              </div>
              {apt.PBLANC_URL && (
                <a href={apt.PBLANC_URL} target="_blank" rel="noopener noreferrer"
                  style={{ display:"inline-flex", alignItems:"center", gap:6, marginTop:"auto", fontSize:13, fontWeight:700, color:"#fff", background:"var(--primary)", padding:"10px 18px", borderRadius:10, textDecoration:"none" }}>
                  청약홈 공고 바로가기 →
                </a>
              )}
            </div>
          </div>
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

// ── 지역별 구/시/군 전체 목록 ─────────────────
const REGION_DISTRICTS: Record<string, string[]> = {
  서울: ["강남구","강동구","강북구","강서구","관악구","광진구","구로구","금천구","노원구","도봉구","동대문구","동작구","마포구","서대문구","서초구","성동구","성북구","송파구","양천구","영등포구","용산구","은평구","종로구","중구","중랑구"],
  경기: ["가평군","고양시","과천시","광명시","광주시","구리시","군포시","김포시","남양주시","동두천시","부천시","성남시","수원시","시흥시","안산시","안성시","안양시","양주시","양평군","여주시","연천군","오산시","용인시","의왕시","의정부시","이천시","파주시","평택시","포천시","하남시","화성시"],
  인천: ["강화군","계양구","남동구","동구","미추홀구","부평구","서구","연수구","옹진군","중구"],
  부산: ["강서구","금정구","기장군","남구","동구","동래구","부산진구","북구","사상구","사하구","서구","수영구","연제구","영도구","중구","해운대구"],
  대구: ["군위군","남구","달서구","달성군","동구","북구","서구","수성구","중구"],
  광주: ["광산구","남구","동구","북구","서구"],
  대전: ["대덕구","동구","서구","유성구","중구"],
  울산: ["남구","동구","북구","울주군","중구"],
  세종: ["세종시"],
  충남: ["계룡시","공주시","금산군","논산시","당진시","보령시","부여군","서산시","서천군","아산시","예산군","천안시","청양군","태안군","홍성군"],
  충북: ["괴산군","단양군","보은군","영동군","옥천군","음성군","제천시","증평군","진천군","청주시","충주시"],
  전남: ["강진군","고흥군","곡성군","광양시","구례군","나주시","담양군","목포시","무안군","보성군","순천시","신안군","여수시","영광군","영암군","완도군","장성군","장흥군","진도군","함평군","해남군","화순군"],
  전북: ["고창군","군산시","김제시","남원시","무주군","부안군","순창군","완주군","익산시","임실군","장수군","전주시","정읍시","진안군"],
  경남: ["거제시","거창군","고성군","김해시","남해군","밀양시","사천시","산청군","양산시","의령군","진주시","창녕군","창원시","통영시","하동군","함안군","함양군","합천군"],
  경북: ["경산시","경주시","고령군","구미시","김천시","문경시","봉화군","상주시","성주군","안동시","영덕군","영양군","영주시","영천시","예천군","울릉군","울진군","의성군","청도군","청송군","칠곡군","포항시"],
  강원: ["강릉시","고성군","동해시","삼척시","속초시","양구군","양양군","영월군","원주시","인제군","정선군","철원군","춘천시","태백시","평창군","홍천군","화천군","횡성군"],
  제주: ["서귀포시","제주시"],
};

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

  // 분양정보 탭 경쟁률 랭킹
  const [cmpetRanking, setCmpetRanking] = useState<Array<{no:string; nm:string; area:string; rate:number}>>([]);

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
    // 특정 지역 선택 시 구 필터링 위해 더 많이 가져옴
    const perPage = aptRegion !== "전체" ? "100" : "20";
    const params = new URLSearchParams({ page: String(aptPage), perPage });
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

  // aptItems 로드 후 경쟁률 TOP5 계산 (최근 완료 단지 기준)
  useEffect(() => {
    if (aptItems.length === 0) return;
    fetch(`/api/apt-cmpet?perPage=200`)
      .then(r => r.json())
      .then(d => {
        const raw: CmpetItem[] = d?.data ?? [];
        // HOUSE_MANAGE_NO별 최대 경쟁률 집계
        const map = new Map<string, number>();
        raw.forEach(c => {
          const rate = parseFloat(c.CMPET_RATE) || 0;
          if (rate > 0) {
            const prev = map.get(c.HOUSE_MANAGE_NO) ?? 0;
            if (rate > prev) map.set(c.HOUSE_MANAGE_NO, rate);
          }
        });
        // aptItems와 조인
        const ranked = Array.from(map.entries())
          .map(([no, rate]) => {
            const apt = aptItems.find(a => a.HOUSE_MANAGE_NO === no);
            return apt ? { no, nm: apt.HOUSE_NM, area: apt.SUBSCRPT_AREA_CODE_NM, rate } : null;
          })
          .filter(Boolean)
          .sort((a, b) => b!.rate - a!.rate)
          .slice(0, 5) as Array<{no:string;nm:string;area:string;rate:number}>;
        if (ranked.length > 0) setCmpetRanking(ranked);
      }).catch(() => {});
  }, [aptItems]);

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

  // ── 구/군/시 추출 유틸 ──────────────────────
  // "경기도 수원시 팔달구..." → "수원시"
  // 주소 두 번째 토큰 추출 (데이터 매칭용)
  function extractDistrict(addr: string): string {
    if (!addr) return "";
    return addr.trim().split(/\s+/)[1] ?? "";
  }

  // 하드코딩 전체 목록 (데이터 유무 무관)
  const availDistricts: string[] = aptRegion !== "전체"
    ? (REGION_DISTRICTS[aptRegion] ?? [])
    : [];

  // 지역 변경 시 구 초기화
  const handleRegionChange = (region: string) => {
    setAptRegion(region);
    setAptDistrict("전체");
    setAptPage(1);
  };

  // ── 분양정보 필터 ───────────────────────────
  // 필터 (전체 = 접수마감 제외)
  const filteredApts = aptItems
    .filter(apt => {
      const st = getStatus(apt).label;
      if (aptStatus === "전체" && st === "접수마감") return false;   // 전체 = 마감 제외
      if (aptStatus === "접수중"   && st !== "접수중")   return false;
      if (aptStatus === "접수예정" && st !== "접수예정") return false;
      if (aptStatus === "접수마감" && st !== "접수마감") return false;
      if (aptQuery && !apt.HOUSE_NM.includes(aptQuery) && !apt.HSSPLY_ADRES?.includes(aptQuery)) return false;
      if (aptDistrict !== "전체" && extractDistrict(apt.HSSPLY_ADRES) !== aptDistrict) return false;
      return true;
    })
    .sort((a, b) => {
      const stA = getStatus(a).label;
      const stB = getStatus(b).label;
      // 접수중 먼저, 그 다음 접수예정, 마감은 최신순
      const order: Record<string, number> = { "접수중": 0, "접수예정": 1, "접수마감": 2 };
      if (order[stA] !== order[stB]) return (order[stA] ?? 9) - (order[stB] ?? 9);
      // 같은 상태끼리: D-day 가까운 순 (마감일 오름차순)
      const dateA = stA === "접수예정" ? a.RCEPT_BGNDE : a.RCEPT_ENDDE;
      const dateB = stB === "접수예정" ? b.RCEPT_BGNDE : b.RCEPT_ENDDE;
      return (dateA ?? "").localeCompare(dateB ?? "");
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
              {/* 전체 단지 — 클릭 시 전체 필터 */}
              <button
                className="stat-card primary"
                onClick={() => setAptStatus("전체")}
                style={{ textAlign:"left", outline: aptStatus==="전체" ? "2px solid var(--primary)" : "none", cursor:"pointer" }}
              >
                <div className="stat-icon">🏢</div>
                <div className="stat-label">전체 단지</div>
                <div className="stat-value">{aptTotal.toLocaleString()}<span className="stat-unit">개</span></div>
                <div className="stat-sub">접수중+접수예정</div>
              </button>

              {/* 접수중 — 클릭 시 접수중 필터 */}
              <button
                className="stat-card heat"
                onClick={() => setAptStatus("접수중")}
                style={{ textAlign:"left", outline: aptStatus==="접수중" ? "2px solid var(--heat-2)" : "none", cursor:"pointer" }}
              >
                <div className="stat-icon">🔴</div>
                <div className="stat-label">접수중</div>
                <div className="stat-value">{liveCount}<span className="stat-unit">개</span></div>
                <div className="stat-sub">지금 바로 청약 가능</div>
              </button>

              {/* 접수예정 — 클릭 시 접수예정 필터 */}
              <button
                className="stat-card ink"
                onClick={() => setAptStatus("접수예정")}
                style={{ textAlign:"left", outline: aptStatus==="접수예정" ? "2px solid var(--ink)" : "none", cursor:"pointer" }}
              >
                <div className="stat-icon">🔜</div>
                <div className="stat-label">접수예정</div>
                <div className="stat-value">{soonCount}<span className="stat-unit">개</span></div>
                <div className="stat-sub">곧 청약 시작</div>
              </button>

              {/* 총 공급세대 — 클릭 없음 */}
              <div className="stat-card mint">
                <div className="stat-icon">🏠</div>
                <div className="stat-label">총 공급세대</div>
                <div className="stat-value">{(totalUnits/1000).toFixed(1)}<span className="stat-unit">천세대</span></div>
                <div className="stat-sub">이번 페이지 기준</div>
              </div>
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

                  {/* 구/시/군 — 시/도 선택 시 아래로 펼쳐짐 */}
                  {availDistricts.length > 0 && (
                    <div style={{
                      borderTop: "1px solid var(--line)",
                      paddingTop: 12,
                      animation: "fadeIn .2s ease",
                    }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--faint)", marginBottom: 8, letterSpacing: ".02em" }}>
                        {aptRegion} · 구/시/군 선택
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {/* 전체 칩 */}
                        <button
                          onClick={() => setAptDistrict("전체")}
                          className={"chip" + (aptDistrict === "전체" ? " on" : "")}
                          style={{ fontSize: 13 }}
                        >
                          전체
                        </button>
                        {availDistricts.map(d => (
                          <button
                            key={d}
                            onClick={() => setAptDistrict(d)}
                            style={{
                              fontSize: 13, fontWeight: 600, padding: "6px 13px",
                              borderRadius: 20, whiteSpace: "nowrap", cursor: "pointer",
                              background: aptDistrict === d ? "var(--primary)" : "var(--primary-soft)",
                              color: aptDistrict === d ? "#fff" : "var(--primary-strong)",
                              border: "none", transition: ".15s",
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
                ) : aptDistrict === "전체" && filteredApts.length === 0 && !aptError ? (
                  <div className="empty">조회된 단지가 없어요.</div>
                ) : aptDistrict !== "전체" ? (
                  /* 구 선택 시: 해당 구 데이터가 있으면 카드, 없으면 빈 안내 */
                  filteredApts.length > 0 ? (
                    <div className="card-grid">
                      {filteredApts.map(apt => (
                        <AptCard key={apt.HOUSE_MANAGE_NO} apt={apt} onSelect={() => setSelectedApt(apt)} />
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      background: "var(--surface)", borderRadius: "var(--r-md)", padding: "48px 24px",
                      textAlign: "center", boxShadow: "var(--sh-1)",
                    }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>🏗️</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>
                        {aptDistrict} 청약 정보 없음
                      </div>
                      <div style={{ fontSize: 13, color: "var(--faint)", fontWeight: 600 }}>
                        현재 {aptDistrict}에 등록된 분양 단지가 없습니다.
                      </div>
                    </div>
                  )
                ) : (
                  <div className="card-grid">
                    {filteredApts.map(apt => (
                      <AptCard key={apt.HOUSE_MANAGE_NO} apt={apt} onSelect={() => setSelectedApt(apt)} />
                    ))}
                  </div>
                )}

                {/* 페이지네이션 — 구 선택 시 숨김 */}
                {aptTotal > 20 && aptDistrict === "전체" && (
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

                {/* ① 경쟁률 TOP 5 */}
                <div className="side-card">
                  <div className="side-head"><span>🏆</span><h4>경쟁률 TOP 5</h4></div>
                  <ul className="rank-list">
                    {cmpetRanking.length > 0 ? cmpetRanking.map((item, i) => {
                      const apt = aptItems.find(a => a.HOUSE_MANAGE_NO === item.no);
                      return (
                        <li key={item.no} onClick={() => apt && setSelectedApt(apt)}>
                          <div className={`rank-no ${i===0?"n1":i===1?"n2":i===2?"n3":""}`}>{i+1}</div>
                          <div className="rank-info">
                            <strong>{item.nm}</strong>
                            <span>{item.area}</span>
                          </div>
                          <span style={{ fontSize:15, fontWeight:800, color:"var(--ink)", flexShrink:0, fontVariantNumeric:"tabular-nums" }}>
                            {item.rate}<em style={{ fontSize:11, fontWeight:600, color:"var(--faint)", marginLeft:1 }}>:1</em>
                          </span>
                        </li>
                      );
                    }) : (
                      <li style={{ padding:"16px 4px", color:"var(--faint)", fontSize:13, fontWeight:600 }}>경쟁률 데이터 로딩 중...</li>
                    )}
                  </ul>
                </div>

                {/* ② 마감 임박 (접수중 → 종료일 가까운 순) */}
                {(() => {
                  const closing = aptItems
                    .filter(a => getStatus(a).label === "접수중")
                    .sort((a,b) => (a.RCEPT_ENDDE??'').localeCompare(b.RCEPT_ENDDE??''))
                    .slice(0, 5);
                  return (
                    <div className="side-card">
                      <div className="side-head"><span>⏰</span><h4>마감 임박</h4></div>
                      <ul className="rank-list">
                        {closing.length > 0 ? closing.map((apt, i) => {
                          const today = new Date(); today.setHours(0,0,0,0);
                          const end   = apt.RCEPT_ENDDE ? new Date(apt.RCEPT_ENDDE) : null;
                          const diff  = end ? Math.ceil((end.getTime()-today.getTime())/86400000) : null;
                          const txt   = diff===null?"-":diff===0?"D-DAY":`D-${diff}`;
                          const urgent= diff!==null&&diff<=2;
                          return (
                            <li key={apt.HOUSE_MANAGE_NO} onClick={()=>setSelectedApt(apt)}>
                              <div className={`rank-no ${i===0?"n1":i===1?"n2":i===2?"n3":""}`}>{i+1}</div>
                              <div className="rank-info">
                                <strong>{apt.HOUSE_NM}</strong>
                                <span>{apt.SUBSCRPT_AREA_CODE_NM} · {Number(apt.TOT_SUPLY_HSHLDCO||0).toLocaleString()}세대</span>
                              </div>
                              <span style={{
                                fontSize:11, fontWeight:800, padding:"4px 9px", borderRadius:7, flexShrink:0,
                                background: urgent?"var(--heat-1)":"var(--surface-3)",
                                color: urgent?"#fff":"var(--text)",
                              }}>{txt}</span>
                            </li>
                          );
                        }) : (
                          <li style={{ padding:"16px 4px", color:"var(--faint)", fontSize:13, fontWeight:600 }}>마감 임박 단지 없음</li>
                        )}
                      </ul>
                    </div>
                  );
                })()}

                {/* ③ 접수예정 */}
                {(() => {
                  const upcoming = aptItems
                    .filter(a => getStatus(a).label === "접수예정")
                    .sort((a,b) => (a.RCEPT_BGNDE??'').localeCompare(b.RCEPT_BGNDE??''))
                    .slice(0, 5);
                  if (upcoming.length === 0) return null;
                  return (
                    <div className="side-card">
                      <div className="side-head"><span>🔜</span><h4>접수예정</h4></div>
                      <ul className="rank-list">
                        {upcoming.map((apt, i) => {
                          const today = new Date(); today.setHours(0,0,0,0);
                          const begin = apt.RCEPT_BGNDE ? new Date(apt.RCEPT_BGNDE) : null;
                          const diff  = begin ? Math.ceil((begin.getTime()-today.getTime())/86400000) : null;
                          const txt   = diff===null?"-":diff===0?"D-DAY":`D-${diff}`;
                          return (
                            <li key={apt.HOUSE_MANAGE_NO} onClick={()=>setSelectedApt(apt)}>
                              <div className="rank-no">{i+1}</div>
                              <div className="rank-info">
                                <strong>{apt.HOUSE_NM}</strong>
                                <span>{apt.SUBSCRPT_AREA_CODE_NM} · {apt.RCEPT_BGNDE?.slice(0,10)} 시작</span>
                              </div>
                              <span style={{
                                fontSize:11, fontWeight:800, padding:"4px 9px", borderRadius:7, flexShrink:0,
                                background:"var(--primary-soft)", color:"var(--primary-strong)",
                              }}>{txt}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })()}
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
