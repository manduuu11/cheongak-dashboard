"use client";

import { useState, useEffect, useCallback } from "react";
import SearchFilter from "@/components/SearchFilter";
import CompetitionChart from "@/components/CompetitionChart";
import CompetitionTable from "@/components/CompetitionTable";
import AgeStatChart from "@/components/AgeStatChart";
import type { CompItem } from "@/components/CompetitionChart";
import type { AgeStatItem } from "@/components/AgeStatChart";

function getDefaultStatDe() {
  const d = new Date();
  // 당월 데이터가 없을 수 있으므로 전월로 기본값 설정
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function Home() {
  const [statDe, setStatDe] = useState(getDefaultStatDe);

  const [compItems, setCompItems] = useState<CompItem[]>([]);
  const [compLoading, setCompLoading] = useState(false);

  const [reqstItems, setReqstItems] = useState<AgeStatItem[]>([]);
  const [reqstLoading, setReqstLoading] = useState(false);

  const [winnerItems, setWinnerItems] = useState<AgeStatItem[]>([]);
  const [winnerLoading, setWinnerLoading] = useState(false);

  const loadData = useCallback(async () => {
    setCompLoading(true);
    setReqstLoading(true);
    setWinnerLoading(true);

    const qs = `statDe=${statDe}&numOfRows=20`;

    Promise.all([
      fetch(`/api/competition?${qs}`).then((r) => r.json()),
      fetch(`/api/apt-info?${qs}`).then((r) => r.json()),
      fetch(`/api/winners?${qs}`).then((r) => r.json()),
    ]).then(([comp, reqst, winner]) => {
      setCompItems(comp?.data ?? []);
      setReqstItems(reqst?.data ?? []);
      setWinnerItems(winner?.data ?? []);
    }).catch(() => {
      setCompItems([]);
      setReqstItems([]);
      setWinnerItems([]);
    }).finally(() => {
      setCompLoading(false);
      setReqstLoading(false);
      setWinnerLoading(false);
    });
  }, [statDe]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 통계 요약 계산
  const totalSuply = compItems.reduce((s, i) => s + (parseInt(i.SUPLY_HSHLDCO) || 0), 0);
  const totalReqst = compItems.reduce((s, i) => s + (parseInt(i.SUPLY_REQ_CNT) || 0), 0);
  const avgCmpet = compItems.length
    ? (compItems.reduce((s, i) => s + (parseFloat(i.SUPLY_CMPET_RATE) || 0), 0) / compItems.length).toFixed(1)
    : "0";
  const topRegion = compItems.length
    ? compItems.reduce((a, b) =>
        (parseFloat(a.SUPLY_CMPET_RATE) || 0) >= (parseFloat(b.SUPLY_CMPET_RATE) || 0) ? a : b
      ).SUBSCRPT_AREA_CODE_NM
    : "-";

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">청</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">청약 대시보드</h1>
            <p className="text-xs text-gray-400">한국부동산원 청약홈 공공데이터</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* 날짜 필터 */}
        <SearchFilter statDe={statDe} onStatDeChange={setStatDe} />

        {/* 요약 카드 */}
        {compItems.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "일반공급 총 세대", value: totalSuply.toLocaleString(), unit: "세대", color: "text-blue-600" },
              { label: "총 신청 건수", value: totalReqst.toLocaleString(), unit: "건", color: "text-indigo-600" },
              { label: "평균 경쟁률", value: avgCmpet, unit: "배", color: "text-amber-600" },
              { label: "최고 경쟁 지역", value: topRegion, unit: "", color: "text-red-500" },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <p className="text-xs text-gray-400 mb-1">{card.label}</p>
                <p className={`text-xl font-bold ${card.color}`}>
                  {card.value}
                  {card.unit && <span className="text-sm font-normal text-gray-400 ml-1">{card.unit}</span>}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* 경쟁률 차트 */}
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-3">지역별 청약 경쟁률</h2>
          <CompetitionChart items={compItems} loading={compLoading} />
        </section>

        {/* 경쟁률 상세 테이블 */}
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-3">경쟁률 상세 현황</h2>
          <CompetitionTable items={compItems} loading={compLoading} />
        </section>

        {/* 연령별 차트 2개 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section>
            <h2 className="text-base font-semibold text-gray-700 mb-3">지역별 연령별 신청자 현황</h2>
            <AgeStatChart
              items={reqstItems}
              loading={reqstLoading}
              title="지역·연령별 청약 신청자 수 (명)"
              colors={["#6366f1", "#10b981", "#f59e0b", "#ef4444"]}
            />
          </section>
          <section>
            <h2 className="text-base font-semibold text-gray-700 mb-3">지역별 연령별 당첨자 현황</h2>
            <AgeStatChart
              items={winnerItems}
              loading={winnerLoading}
              title="지역·연령별 청약 당첨자 수 (명)"
              colors={["#8b5cf6", "#06b6d4", "#f97316", "#ec4899"]}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
