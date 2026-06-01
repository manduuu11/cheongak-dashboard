"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

export interface AgeStatItem {
  SUBSCRPT_AREA_CODE_NM: string;
  AGE_30: string;
  AGE_40: string;
  AGE_50: string;
  AGE_60: string;
  STAT_DE: string;
}

interface Props {
  items: AgeStatItem[];
  loading: boolean;
  title: string;
  colors?: string[];
}

const DEFAULT_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

export default function AgeStatChart({ items, loading, title, colors = DEFAULT_COLORS }: Props) {
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
    "30대": parseInt(item.AGE_30) || 0,
    "40대": parseInt(item.AGE_40) || 0,
    "50대": parseInt(item.AGE_50) || 0,
    "60대 이상": parseInt(item.AGE_60) || 0,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-600 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(v, name) => [`${Number(v).toLocaleString()}명`, name as string]}
            contentStyle={{ fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Bar dataKey="30대" fill={colors[0]} radius={[3, 3, 0, 0]} />
          <Bar dataKey="40대" fill={colors[1]} radius={[3, 3, 0, 0]} />
          <Bar dataKey="50대" fill={colors[2]} radius={[3, 3, 0, 0]} />
          <Bar dataKey="60대 이상" fill={colors[3]} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
