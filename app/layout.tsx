// app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ESST PKG 관리",
  description: "Sheet 및 이력 관리",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="!bg-white !text-black">
      <body className="min-h-screen bg-white text-black">
        {/* 상단 네비게이션 바 */}
        <header className="border-b bg-white text-black">
          <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-3">
            <div className="font-bold text-lg">
              <Link href="/">ESST PKG 관리 Sheet</Link>
            </div>
            <nav className="flex gap-4 text-sm">
              <Link href="/" className="hover:underline">
                신규 등록
              </Link>
              <Link href="/forms/controlView" className="hover:underline">
                요청 목록
              </Link>
            </nav>
          </div>
        </header>

        {/* 페이지 내용 */}
        <main className="mx-auto max-w-5xl bg-white">{children}</main>
      </body>
    </html>
  );
}
