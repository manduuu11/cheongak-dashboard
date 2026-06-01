import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "청약 인사이트",
  description: "한국부동산원 청약홈 공공데이터 기반 청약 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
