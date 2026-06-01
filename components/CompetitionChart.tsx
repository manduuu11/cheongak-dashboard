"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

export interface CompItem {
  SUBSCRPT_AREA_CODE_NM: string;
  SUPLY_CMPET_RATE: string;
  SPSPLY_CMPET_RATE: string;
  SUPLY_HSHLDCO: string;
  SUPLY_REQ_CNT: string;
  SPSPLY_HSHLDCO: string;
  SPSPLY_REQ_CNT: string;
  STAT_DE: string;
}

interface Props {
  items: CompItem[];
  loading: boolean;
}

export default function CompetitionChart({ items, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 h-72 flex items-center justify-center">
        데이터를 불러오는 중...
      </div>
    );
  }
  if (!items.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400 h-72 flex items-center justify-center">
        조회된 데이터가 없습니다.
      </div>
    );
  }

  const data = items.map((item) => ({
    name: item.SUBSCRPT_AREA_CODE_NM,
    일반공급: parseFloat(item.SUPLY_CMPET_RATE) || 0,
    특별공급: parseFloat(item.SPSPLY_CMPET_RATE) || 0,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-600 mb-4">지역별 경쟁률 (배수)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
          <YAxis tick={{ fontSize: 11 }} unit="배" />
          <Tooltip
            formatter={(v, name) => [`${Number(v)}배`, name as string]}
            contentStyle={{ fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Bar dataKey="일반공급" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          <Bar dataKey="특별공급" fill="#f59e0b" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
