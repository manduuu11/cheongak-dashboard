"use client";

import { useState, useEffect, useCallback } from "react";
import SearchFilter from "@/components/SearchFilter";
import AptInfoTable from "@/components/AptInfoTable";
import CompetitionChart from "@/components/CompetitionChart";
import SpecialSupplyTable from "@/components/SpecialSupplyTable";
import WinnerStats from "@/components/WinnerStats";

interface AptItem {
  HOUSE_NM: string;
  SUBSCRPT_AREA_CODE_NM: string;
  TOT_SUPLY_HSHLDCO: string;
  RCRIT_PBLANC_DE: string;
  PRZWNER_PRESNATN_DE: string;
  HMPG_ADRES?: string;
  PBLANC_NO?: string;
}

export default function Home() {
  const [region, setRegion] = useState("");
  const [aptItems, setAptItems] = useState<AptItem[]>([]);
  const [aptLoading, setAptLoading] = useState(false);

  const [selectedApt, setSelectedApt] = useState<AptItem | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [compItems, setCompItems] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [specialItems, setSpecialItems] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [winnerItems, setWinnerItems] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadAptInfo = useCallback(async () => {
    setAptLoading(true);
    try {
      const qs = new URLSearchParams({ numOfRows: "20" });
      if (region) qs.set("region", region);
      const res = await fetch(`/api/apt-info?${qs}`);
      const data = await res.json();
      const items = data?.response?.body?.items?.item ?? [];
      setAptItems(Array.isArray(items) ? items : [items]);
    } catch {
      setAptItems([]);
    } finally {
      setAptLoading(false);
    }
  }, [region]);

  useEffect(() => {
    loadAptInfo();
  }, [loadAptInfo]);

  const handleSelectApt = async (item: AptItem) => {
    setSelectedApt(item);
    if (!item.PBLANC_NO) return;
    setDetailLoading(true);
    try {
      const [compRes, winnersRes] = await Promise.all([
        fetch(`/api/competition?pblancNo=${item.PBLANC_NO}&numOfRows=20`),
        fetch(`/api/winners?pblancNo=${item.PBLANC_NO}&numOfRows=20`),
      ]);
      const compData = await compRes.json();
      const winnersData = await winnersRes.json();

      const compList = compData?.response?.body?.items?.item ?? [];
      const winnerList = winnersData?.response?.body?.items?.item ?? [];
      const allComp = Array.isArray(compList) ? compList : [compList];
      const allWinners = Array.isArray(winnerList) ? winnerList : [winnerList];

      setSpecialItems(allComp.filter((c: { SPSPLY_TY?: string }) => c.SPSPLY_TY));
      setCompItems(allComp);
      setWinnerItems(allWinners);
    } catch {
      setCompItems([]);
      setSpecialItems([]);
      setWinnerItems([]);
    } finally {
      setDetailLoading(false);
    }
  };

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
        {/* 필터 */}
        <SearchFilter region={region} onRegionChange={setRegion} />

        {/* 분양정보 */}
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-3">
            분양정보{" "}
            {aptItems.length > 0 && (
              <span className="text-blue-600">({aptItems.length}건)</span>
            )}
          </h2>
          <AptInfoTable
            items={aptItems}
            loading={aptLoading}
            onSelect={handleSelectApt}
            selected={selectedApt?.HOUSE_NM ?? ""}
          />
        </section>

        {/* 선택된 단지 상세 */}
        {selectedApt && (
          <>
            <div className="flex items-center gap-2 pt-2">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-sm font-semibold text-blue-600 px-2">
                {selectedApt.HOUSE_NM} 상세
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section>
                <h2 className="text-base font-semibold text-gray-700 mb-3">
                  주택형별 경쟁률
                </h2>
                <CompetitionChart items={compItems} loading={detailLoading} />
              </section>

              <section>
                <h2 className="text-base font-semibold text-gray-700 mb-3">
                  특별공급 신청현황
                </h2>
                <SpecialSupplyTable items={specialItems} loading={detailLoading} />
              </section>
            </div>

            <section>
              <h2 className="text-base font-semibold text-gray-700 mb-3">
                당첨자 가점 현황
              </h2>
              <WinnerStats items={winnerItems} loading={detailLoading} />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
