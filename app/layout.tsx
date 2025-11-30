// app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "./components/NavBar";
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
      <body className="min-h-screen bg-white text-black mt-12">
        <Navbar />
        {/* 페이지 내용 */}
        <main className="mx-auto max-w-5xl bg-white">{children}</main>
      </body>
    </html>
  );
}
