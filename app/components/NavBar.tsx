"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState<"new" | "list" | null>(null);

  const submenuItems = [
    { key: "control", label: "제어" },
    { key: "alarm", label: "알람" },
    { key: "damaged", label: "파손품" },
    { key: "parameter", label: "파라미터" },
  ];

  return (
    <nav className="w-full bg-white text-black shadow-sm fixed top-0 left-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center whitespace-nowrap overflow-hidden">
        {/* 로고 */}
        <Link href="/" className="text-xl font-bold truncate max-w-[45vw]">
          ESST PKG 관리 시스템
        </Link>

        {/* 메뉴 */}
        <div className="flex gap-8 text-lg font-medium select-none">
          {/* 신규 등록 */}
          <div className="relative">
            <span
              className="cursor-pointer"
              onClick={() => setOpenMenu(openMenu === "new" ? null : "new")}
            >
              신규 등록
            </span>

            {openMenu === "new" && (
              <div
                className="
                  absolute top-full mt-2
                  left-0 
                  w-40
                  bg-white border shadow-lg rounded-lg p-2
                  max-w-[calc(100vw-2rem)]
                  overflow-hidden
                "
              >
                {submenuItems.map((item) => (
                  <Link
                    key={item.key}
                    href={`/forms/${item.key}`}
                    onClick={() => setOpenMenu(null)}
                    className="block px-3 py-2 rounded hover:bg-gray-100"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 요청 목록 */}
          <div className="relative">
            <span
              className="cursor-pointer"
              onClick={() => setOpenMenu(openMenu === "list" ? null : "list")}
            >
              요청 목록
            </span>

            {openMenu === "list" && (
              <div
                className="
                  absolute top-full mt-2
                  left-0
                  w-40
                  bg-white border shadow-lg rounded-lg p-2
                  max-w-[calc(100vw-2rem)]
                  overflow-hidden
                "
              >
                {submenuItems.map((item) => (
                  <Link
                    key={item.key}
                    href={`/views/${item.key}`}
                    onClick={() => setOpenMenu(null)}
                    className="block px-3 py-2 rounded hover:bg-gray-100"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
