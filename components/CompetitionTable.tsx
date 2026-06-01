"use client";

import { CompItem } from "./CompetitionChart";

interface Props {
  items: CompItem[];
  loading: boolean;
}

export default function CompetitionTable({ items, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
        데이터를 불러오는 중...
      </div>
    );
  }
  if (!items.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
        조회된 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">지역</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">일반공급 세대</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">일반 신청</th>
              <th className="text-right px-4 py-3 font-semibold text-blue-600">일반 경쟁률</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">특공 세대</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">특공 신청</th>
              <th className="text-right px-4 py-3 font-semibold text-amber-600">특공 경쟁률</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const suply = parseFloat(item.SUPLY_CMPET_RATE) || 0;
              const spsply = parseFloat(item.SPSPLY_CMPET_RATE) || 0;
              return (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{item.SUBSCRPT_AREA_CODE_NM}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{Number(item.SUPLY_HSHLDCO).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{Number(item.SUPLY_REQ_CNT).toLocaleString()}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${suply >= 10 ? "text-red-500" : suply >= 1 ? "text-blue-600" : "text-gray-400"}`}>
                    {suply}배
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{Number(item.SPSPLY_HSHLDCO).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{Number(item.SPSPLY_REQ_CNT).toLocaleString()}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${spsply >= 10 ? "text-red-500" : spsply >= 1 ? "text-amber-500" : "text-gray-400"}`}>
                    {spsply}배
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
