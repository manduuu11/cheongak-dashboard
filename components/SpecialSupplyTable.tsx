"use client";

interface SpecialItem {
  SPSPLY_TY: string;
  SUPLY_HSHLDCO: string;
  RCEPT_HSHLDCO: string;
}

interface Props {
  items: SpecialItem[];
  loading: boolean;
}

export default function SpecialSupplyTable({ items, loading }: Props) {
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
        단지를 선택하면 특별공급 현황이 표시됩니다.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">특별공급 유형</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-600">공급</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-600">신청</th>
            <th className="text-right px-4 py-3 font-semibold text-gray-600">경쟁률</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const supply = Number(item.SUPLY_HSHLDCO) || 0;
            const applied = Number(item.RCEPT_HSHLDCO) || 0;
            const ratio = supply ? Math.round((applied / supply) * 10) / 10 : 0;
            return (
              <tr key={i} className="border-b border-gray-50">
                <td className="px-4 py-3 text-gray-700">{item.SPSPLY_TY}</td>
                <td className="px-4 py-3 text-right text-gray-600">{supply.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-gray-600">{applied.toLocaleString()}</td>
                <td className={`px-4 py-3 text-right font-semibold ${ratio >= 10 ? "text-red-500" : ratio >= 1 ? "text-blue-600" : "text-gray-400"}`}>
                  {ratio}배
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
