"use client";

interface AptItem {
  HOUSE_NM: string;
  SUBSCRPT_AREA_CODE_NM: string;
  TOT_SUPLY_HSHLDCO: string;
  RCRIT_PBLANC_DE: string;
  PRZWNER_PRESNATN_DE: string;
  HMPG_ADRES?: string;
}

interface Props {
  items: AptItem[];
  loading: boolean;
  onSelect: (item: AptItem) => void;
  selected: string;
}

export default function AptInfoTable({ items, loading, onSelect, selected }: Props) {
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
        조회된 분양 정보가 없습니다.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">단지명</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">지역</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">공급세대</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">청약접수일</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">당첨자발표</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr
                key={i}
                onClick={() => onSelect(item)}
                className={`border-b border-gray-50 cursor-pointer transition-colors ${
                  selected === item.HOUSE_NM ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <td className="px-4 py-3 font-medium text-blue-700">{item.HOUSE_NM}</td>
                <td className="px-4 py-3 text-gray-600">{item.SUBSCRPT_AREA_CODE_NM}</td>
                <td className="px-4 py-3 text-right text-gray-700">{Number(item.TOT_SUPLY_HSHLDCO).toLocaleString()}세대</td>
                <td className="px-4 py-3 text-gray-600">{item.RCRIT_PBLANC_DE}</td>
                <td className="px-4 py-3 text-gray-600">{item.PRZWNER_PRESNATN_DE}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
