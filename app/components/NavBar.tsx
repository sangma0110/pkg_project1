"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState<"new" | "list" | null>(null);

  const submenuItems = [
    { key: "control", label: "제어(Control)" },
    { key: "alarm", label: "알람(Alarm)" },
    { key: "damaged", label: "파손품(Damaged Item)" },
    { key: "parameter", label: "파라미터(Parameter)" },
  ];

  return (
    <nav className="w-full bg-white text-black shadow-sm fixed top-0 left-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-m font-bold">
          ESST PKG 관리 시스템
        </Link>

        <div className="flex gap-6 text-xs font-medium relative select-none">
          {/* 신규 등록 */}
          <div
            className="relative cursor-pointer"
            onClick={() => setOpenMenu(openMenu === "new" ? null : "new")}
          >
            신규 등록
            <br />
            (New Request)
            {openMenu === "new" && (
              <div className="absolute left-0 mt-2 w-40 bg-white text-xs border shadow-lg rounded-lg p-2">
                {submenuItems.map((item) => (
                  <Link
                    key={item.key}
                    href={`/forms/${item.key}`}
                    className="block px-3 py-2 rounded hover:bg-gray-100"
                    onClick={() => setOpenMenu(null)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 요청 목록 */}
          <div
            className="relative cursor-pointer"
            onClick={() => setOpenMenu(openMenu === "list" ? null : "list")}
          >
            요청 목록
            <br />
            (Requested List)
            {openMenu === "list" && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-xs border shadow-lg rounded-lg p-2">
                {submenuItems.map((item) => (
                  <Link
                    key={item.key}
                    href={`/views/${item.key}`}
                    className="block px-3 py-2 rounded hover:bg-gray-100"
                    onClick={() => setOpenMenu(null)}
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
