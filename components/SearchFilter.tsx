"use client";

const REGIONS = [
  "전체", "서울", "경기", "인천", "부산", "대구", "광주", "대전",
  "울산", "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

interface Props {
  region: string;
  onRegionChange: (v: string) => void;
}

export default function SearchFilter({ region, onRegionChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3 items-center bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <span className="text-sm font-semibold text-gray-600">지역</span>
      <div className="flex flex-wrap gap-2">
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => onRegionChange(r === "전체" ? "" : r)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              (r === "전체" && region === "") || r === region
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}
