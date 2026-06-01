"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

interface CompItem {
  HOUSE_TY: string;
  SUPLY_HSHLDCO: string;
  RCEPT_HSHLDCO: string;
}

interface Props {
  items: CompItem[];
  loading: boolean;
}

export default function CompetitionChart({ items, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 h-64 flex items-center justify-center">
        데이터를 불러오는 중...
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 h-64 flex items-center justify-center">
        단지를 선택하면 경쟁률이 표시됩니다.
      </div>
    );
  }

  const data = items.map((item) => {
    const supply = Number(item.SUPLY_HSHLDCO) || 1;
    const applied = Number(item.RCEPT_HSHLDCO) || 0;
    return {
      name: item.HOUSE_TY,
      경쟁률: Math.round((applied / supply) * 10) / 10,
      공급: supply,
      신청: applied,
    };
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-600 mb-4">주택형별 경쟁률</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} unit="배" />
          <Tooltip
            formatter={(v: number) => [`${v}배`, "경쟁률"]}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="경쟁률" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.경쟁률 >= 10 ? "#ef4444" : entry.경쟁률 >= 1 ? "#3b82f6" : "#94a3b8"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-3 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block" />10배 이상</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" />1배 이상</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-400 inline-block" />미달</span>
      </div>
    </div>
  );
}
