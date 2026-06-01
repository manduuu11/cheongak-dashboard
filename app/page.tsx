"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";

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

function getHeat(rate: number) {
  if (rate >= 30) return { label: "초고경쟁", color: "var(--heat-1)", bg: "var(--heat-1-bg)" };
  if (rate >= 10) return { label: "고경쟁", color: "var(--heat-2)", bg: "var(--heat-2-bg)" };
  if (rate >= 3)  return { label: "중경쟁", color: "var(--heat-3)", bg: "var(--heat-3-bg)" };
  if (rate >= 1)  return { label: "저경쟁", color: "var(--heat-4)", bg: "var(--heat-4-bg)" };
  return { label: "미달", color: "var(--heat-5)", bg: "var(--heat-5-bg)" };
}

function fmtStatDe(s: string) {
  if (!s) return "";
  return `${s.slice(0, 4)}년 ${parseInt(s.slice(4))}월`;
}

// ── 지역 카드 ──────────────────────────────────
function RegionCard({ item, reqst, onSelect }: {
  item: CompItem;
  reqst?: AgeItem;
  onSelect: () => void;
}) {
  const rate = parseFloat(item.SUPLY_CMPET_RATE) || 0;
  const heat = getHeat(rate);
  const totalAge = reqst
    ? (parseInt(reqst.AGE_30) || 0) + (parseInt(reqst.AGE_40) || 0) +
      (parseInt(reqst.AGE_50) || 0) + (parseInt(reqst.AGE_60) || 0)
    : 0;

  return (
    <button className="ccard" onClick={onSelect}>
      <div className="ccard-head">
        <div className="ccard-badges">
          <span className="heat-badge" style={{ color: heat.color, background: heat.bg }}>
            {heat.label}
          </span>
        </div>
      </div>
      <div className="ccard-title">
        <h3>{item.SUBSCRPT_AREA_CODE_NM}</h3>
        <div className="ccard-meta">
          일반공급 {Number(item.SUPLY_HSHLDCO).toLocaleString()}세대 · 특공 {Number(item.SPSPLY_HSHLDCO).toLocaleString()}세대
        </div>
      </div>
      <div className="ccard-hero">
        <div className="ccard-comp">
          <span className="cc-comp-num">{rate.toFixed(1)}</span>
          <span className="cc-comp-unit">:1</span>
          <span className="cc-comp-lbl">일반공급 경쟁률</span>
        </div>
      </div>
      <div className="ccard-foot">
        <div className="cc-stat">
          <span>일반 신청</span>
          <b>{Number(item.SUPLY_REQ_CNT).toLocaleString()}건</b>
        </div>
        <div className="cc-stat">
          <span>특공 신청</span>
          <b>{Number(item.SPSPLY_REQ_CNT).toLocaleString()}건</b>
        </div>
        {totalAge > 0 && (
          <div className="cc-stat">
            <span>청약 신청자</span>
            <b>{totalAge.toLocaleString()}명</b>
          </div>
        )}
      </div>
    </button>
  );
}

// ── 상세 모달 ──────────────────────────────────
function DetailModal({ item, reqst, winner, onClose }: {
  item: CompItem;
  reqst?: AgeItem;
  winner?: AgeItem;
  onClose: () => void;
}) {
  const rate = parseFloat(item.SUPLY_CMPET_RATE) || 0;
  const spsplyRate = parseFloat(item.SPSPLY_CMPET_RATE) || 0;
  const heat = getHeat(rate);

  const ageLabels = ["30대", "40대", "50대", "60대↑"];
  const reqstData = reqst
    ? [parseInt(reqst.AGE_30)||0, parseInt(reqst.AGE_40)||0, parseInt(reqst.AGE_50)||0, parseInt(reqst.AGE_60)||0]
    : [];
  const winnerData = winner
    ? [parseInt(winner.AGE_30)||0, parseInt(winner.AGE_40)||0, parseInt(winner.AGE_50)||0, parseInt(winner.AGE_60)||0]
    : [];
  const maxAge = Math.max(...reqstData, 1);

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* Hero */}
        <div className="modal-hero">
          <div className="mh-badges">
            <span className="heat-badge" style={{ color: heat.color, background: "rgba(255,255,255,.16)" }}>
              {heat.label}
            </span>
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

        {/* Body */}
        <div className="modal-body">
          {/* 신청/경쟁 현황 */}
          <div className="m-block">
            <div className="m-block-head">
              <h3>일반 vs 특별공급 경쟁률</h3>
            </div>
            <div className="hbar">
              {[
                { name: "일반공급", val: rate, units: Number(item.SUPLY_HSHLDCO) },
                { name: "특별공급", val: spsplyRate, units: Number(item.SPSPLY_HSHLDCO) },
              ].map((d) => {
                const max = Math.max(rate, spsplyRate, 1);
                const pct = Math.max(4, (d.val / max) * 100);
                return (
                  <div className="hbar-row" key={d.name}>
                    <div className="hbar-label">
                      <span className="hbar-name">{d.name}</span>
                      <span className="hbar-units">{d.units.toLocaleString()}세대</span>
                    </div>
                    <div className="hbar-track">
                      <div className="hbar-fill" style={{ width: pct + "%", background: "var(--primary)" }} />
                      <span className="hbar-val">{d.val.toFixed(1)}<em>배</em></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 연령별 차트 */}
          {reqstData.length > 0 && (
            <div className="m-cols">
              <div className="m-block">
                <div className="m-block-head"><h3>연령별 신청자</h3></div>
                <div className="hbar">
                  {ageLabels.map((lbl, i) => {
                    const pct = Math.max(4, (reqstData[i] / maxAge) * 100);
                    return (
                      <div className="hbar-row" key={lbl}>
                        <div className="hbar-label">
                          <span className="hbar-name">{lbl}</span>
                        </div>
                        <div className="hbar-track">
                          <div className="hbar-fill" style={{ width: pct + "%", background: "var(--sp-1)" }} />
                          <span className="hbar-val">{reqstData[i].toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {winnerData.length > 0 && (
                <div className="m-block">
                  <div className="m-block-head"><h3>연령별 당첨자</h3></div>
                  <div className="hbar">
                    {ageLabels.map((lbl, i) => {
                      const maxW = Math.max(...winnerData, 1);
                      const pct = Math.max(4, (winnerData[i] / maxW) * 100);
                      return (
                        <div className="hbar-row" key={lbl}>
                          <div className="hbar-label">
                            <span className="hbar-name">{lbl}</span>
                          </div>
                          <div className="hbar-track">
                            <div className="hbar-fill" style={{ width: pct + "%", background: "var(--mint)" }} />
                            <span className="hbar-val">{winnerData[i].toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
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

// ── 메인 ──────────────────────────────────────
export default function Home() {
  const [statDe, setStatDe] = useState("");
  const [availMonths, setAvailMonths] = useState<string[]>([]);
  const [compItems, setCompItems] = useState<CompItem[]>([]);
  const [reqstItems, setReqstItems] = useState<AgeItem[]>([]);
  const [winnerItems, setWinnerItems] = useState<AgeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<CompItem | null>(null);
  const [regionFilter, setRegionFilter] = useState("전체");

  // 최초: 가용 연월 목록 조회
  useEffect(() => {
    fetch("/api/competition?numOfRows=100")
      .then(r => r.json())
      .then(data => {
        const items: CompItem[] = data?.data ?? [];
        const months = Array.from(new Set(items.map((i: CompItem) => i.STAT_DE))).sort().reverse();
        setAvailMonths(months as string[]);
        if (months.length > 0) setStatDe(months[0] as string);
      });
  }, []);

  // statDe 변경시 데이터 로드
  useEffect(() => {
    if (!statDe) return;
    let cancelled = false;
    setLoading(true);
    const qs = `statDe=${statDe}&numOfRows=20`;
    Promise.all([
      fetch(`/api/competition?${qs}`).then(r => r.json()),
      fetch(`/api/apt-info?${qs}`).then(r => r.json()),
      fetch(`/api/winners?${qs}`).then(r => r.json()),
    ]).then(([comp, reqst, winner]) => {
      if (cancelled) return;
      setCompItems(comp?.data ?? []);
      setReqstItems(reqst?.data ?? []);
      setWinnerItems(winner?.data ?? []);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) { setCompItems([]); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [statDe]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const regions = ["전체", ...Array.from(new Set(compItems.map(i => i.SUBSCRPT_AREA_CODE_NM)))];
  const filtered = regionFilter === "전체" ? compItems : compItems.filter(i => i.SUBSCRPT_AREA_CODE_NM === regionFilter);

  // 요약
  const totalSuply = compItems.reduce((s, i) => s + (parseInt(i.SUPLY_HSHLDCO) || 0), 0);
  const totalReqst = compItems.reduce((s, i) => s + (parseInt(i.SUPLY_REQ_CNT) || 0), 0);
  const avgComp = compItems.length
    ? compItems.reduce((s, i) => s + (parseFloat(i.SUPLY_CMPET_RATE) || 0), 0) / compItems.length
    : 0;
  const topItem = compItems.length
    ? compItems.reduce((a, b) => (parseFloat(a.SUPLY_CMPET_RATE)||0) >= (parseFloat(b.SUPLY_CMPET_RATE)||0) ? a : b)
    : null;
  const ranking = compItems.slice().sort((a, b) => (parseFloat(b.SUPLY_CMPET_RATE)||0) - (parseFloat(a.SUPLY_CMPET_RATE)||0)).slice(0, 5);

  const getReqst = (nm: string) => reqstItems.find(r => r.SUBSCRPT_AREA_CODE_NM === nm);
  const getWinner = (nm: string) => winnerItems.find(r => r.SUBSCRPT_AREA_CODE_NM === nm);

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
            <a className="active">경쟁률</a>
            <a>신청자</a>
            <a>당첨통계</a>
          </nav>
          <div className="topbar-right">
            <span className="period-pill">{fmtStatDe(statDe)}</span>
            <div className="avatar">청</div>
          </div>
        </div>
      </header>

      <main className="container">
        {/* 헤드라인 */}
        <section className="headline">
          <div className="headline-eyebrow">{fmtStatDe(statDe)} 청약 인사이트</div>
          <h1 className="headline-title">
            이번 달 <b>{filtered.length}개</b> 지역에<br />
            <span className="hl-accent">{totalReqst.toLocaleString()}건</span>의 청약이 접수됐어요
          </h1>
        </section>

        {/* 요약 카드 */}
        <section className="summary">
          <div className="stat-card primary">
            <div className="stat-icon">🏢</div>
            <div className="stat-label">조회 지역</div>
            <div className="stat-value">{compItems.length}<span className="stat-unit">개</span></div>
            <div className="stat-sub">전국 지역별 통계</div>
          </div>
          <div className="stat-card heat">
            <div className="stat-icon">🔥</div>
            <div className="stat-label">평균 경쟁률</div>
            <div className="stat-value">{avgComp.toFixed(1)}<span className="stat-unit">:1</span></div>
            <div className="stat-sub">일반공급 기준</div>
          </div>
          <div className="stat-card ink">
            <div className="stat-icon">🏠</div>
            <div className="stat-label">총 공급 세대</div>
            <div className="stat-value">{(totalSuply).toLocaleString()}<span className="stat-unit">세대</span></div>
            <div className="stat-sub">일반공급 합계</div>
          </div>
          <div className="stat-card mint">
            <div className="stat-icon">📋</div>
            <div className="stat-label">총 신청 건수</div>
            <div className="stat-value">{(totalReqst / 1000).toFixed(1)}<span className="stat-unit">천건</span></div>
            <div className="stat-sub">일반공급 신청</div>
          </div>
        </section>

        {/* 본문 */}
        <div className="layout">
          <div className="col-main">
            {/* 필터 */}
            <div className="filterbar">
              <div className="filter-chips">
                {regions.map(r => (
                  <button key={r} className={"chip" + (regionFilter === r ? " on" : "")} onClick={() => setRegionFilter(r)}>
                    {r}
                  </button>
                ))}
              </div>
              <div className="filter-row">
                <div className="result-count">
                  <b>{filtered.length}</b>개 지역 · {fmtStatDe(statDe)}
                </div>
                <select
                  style={{ fontFamily: "inherit", fontSize: 14, fontWeight: 700, border: "none", background: "none", cursor: "pointer", color: "var(--ink)" }}
                  value={statDe}
                  onChange={e => setStatDe(e.target.value)}
                >
                  {availMonths.map(m => (
                    <option key={m} value={m}>{fmtStatDe(m)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 카드 그리드 */}
            {loading ? (
              <div className="empty">데이터를 불러오는 중...</div>
            ) : filtered.length === 0 ? (
              <div className="empty">조회된 지역이 없어요.</div>
            ) : (
              <div className="card-grid">
                {filtered.map(item => (
                  <RegionCard
                    key={item.SUBSCRPT_AREA_CODE}
                    item={item}
                    reqst={getReqst(item.SUBSCRPT_AREA_CODE_NM)}
                    onSelect={() => setSelected(item)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 사이드바 */}
          <aside className="col-side">
            <div className="side-card">
              <div className="side-head">
                <span>🏆</span>
                <h4>경쟁률 TOP 5</h4>
              </div>
              <ul className="rank-list">
                {ranking.map((item, i) => {
                  const rate = parseFloat(item.SUPLY_CMPET_RATE) || 0;
                  return (
                    <li key={item.SUBSCRPT_AREA_CODE} onClick={() => setSelected(item)}>
                      <div className={`rank-no ${i === 0 ? "n1" : i === 1 ? "n2" : i === 2 ? "n3" : ""}`}>{i + 1}</div>
                      <div className="rank-info">
                        <strong>{item.SUBSCRPT_AREA_CODE_NM}</strong>
                        <span>일반공급 {Number(item.SUPLY_HSHLDCO).toLocaleString()}세대</span>
                      </div>
                      <div className="rank-comp">{rate.toFixed(1)}<em>배</em></div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {topItem && (
              <div className="side-card">
                <div className="side-head">
                  <span>⚡</span>
                  <h4>최고 경쟁 지역</h4>
                </div>
                <div style={{ padding: "12px 4px 8px" }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "var(--heat-1)", letterSpacing: "-.03em" }}>
                    {topItem.SUBSCRPT_AREA_CODE_NM}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--faint)", fontWeight: 600, marginTop: 4 }}>
                    일반공급 경쟁률 {parseFloat(topItem.SUPLY_CMPET_RATE).toFixed(1)}배
                  </div>
                  <div style={{ fontSize: 13, color: "var(--faint)", fontWeight: 600, marginTop: 2 }}>
                    신청 {Number(topItem.SUPLY_REQ_CNT).toLocaleString()}건 / {Number(topItem.SUPLY_HSHLDCO).toLocaleString()}세대
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>

        <footer className="foot">
          <span>데이터 출처 · 한국부동산원 청약홈 · 공공데이터포털 API</span>
          <span>{fmtStatDe(statDe)} 기준</span>
        </footer>
      </main>

      {selected && (
        <DetailModal
          item={selected}
          reqst={getReqst(selected.SUBSCRPT_AREA_CODE_NM)}
          winner={getWinner(selected.SUBSCRPT_AREA_CODE_NM)}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
