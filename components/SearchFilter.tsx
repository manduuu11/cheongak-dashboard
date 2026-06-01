"use client";

// 최근 12개월 YYYYMM 목록 생성
function getMonthOptions() {
  const options: { label: string; value: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
    options.push({ label, value });
  }
  return options;
}

interface Props {
  statDe: string;
  onStatDeChange: (v: string) => void;
}

export default function SearchFilter({ statDe, onStatDeChange }: Props) {
  const months = getMonthOptions();

  return (
    <div className="flex flex-wrap gap-3 items-center bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <span className="text-sm font-semibold text-gray-600">통계 기준 연월</span>
      <div className="flex flex-wrap gap-2">
        {months.map((m) => (
          <button
            key={m.value}
            onClick={() => onStatDeChange(m.value)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              statDe === m.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
