// app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "설비 요청 시스템",
  description: "라인/머신 설비 요청 기록용 내부 도구",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-white text-black">
        {/* 상단 네비게이션 바 */}
        <header className="border-b bg-white">
          <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-3">
            <div className="font-bold text-lg">
              <Link href="/">PKG 설비 요청 시스템</Link>
            </div>
            <nav className="flex gap-4 text-sm">
              <Link href="/" className="hover:underline">
                신규 등록
              </Link>
              <Link href="/forms/view" className="hover:underline">
                요청 목록
              </Link>
            </nav>
          </div>
        </header>

        {/* 페이지 내용 */}
        <main className="mx-auto max-w-5xl">{children}</main>
      </body>
    </html>
  );
}
