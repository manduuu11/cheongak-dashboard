"use client";

interface WinnerItem {
  HOUSE_TY: string;
  SUPLY_HSHLDCO: string;
  PRZWNER_CO: string;
  LTTOT_TOP_SCORE: string;
  LTTOT_LOW_SCORE: string;
  LTTOT_AVG_SCORE: string;
}

interface Props {
  items: WinnerItem[];
  loading: boolean;
}

export default function WinnerStats({ items, loading }: Props) {
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
        단지를 선택하면 당첨자 통계가 표시됩니다.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">주택형</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-600">공급</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-600">당첨</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-600">최고가점</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-600">평균가점</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-600">최저가점</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-gray-50">
              <td className="px-4 py-3 text-gray-700">{item.HOUSE_TY}</td>
              <td className="px-4 py-3 text-right text-gray-600">{Number(item.SUPLY_HSHLDCO).toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-gray-600">{Number(item.PRZWNER_CO).toLocaleString()}</td>
              <td className="px-4 py-3 text-right font-semibold text-red-500">{item.LTTOT_TOP_SCORE}</td>
              <td className="px-4 py-3 text-right font-semibold text-blue-600">{item.LTTOT_AVG_SCORE}</td>
              <td className="px-4 py-3 text-right text-gray-500">{item.LTTOT_LOW_SCORE}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
