"use client";

import { useEffect, useState } from "react";
import type { FormRow } from "@/app/api/route";

interface GetResponse {
  status: "success" | "error";
  rows?: FormRow[];
  message?: string;
}

const PAGE_SIZE = 20;

// 📌 시트 헤더와 동일해야 함
const COLUMNS = [
  "NO.",
  "타임스탬프",
  "파손 호기",
  "품목",
  "형번",
  "수량",
  "수급 방법",
];

export default function DamagedViewPage() {
  const [rows, setRows] = useState<FormRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/forms?type=damaged");
        const json = (await res.json()) as GetResponse;

        if (json.status !== "success") {
          throw new Error(json.message ?? "조회 실패");
        }
        setRows(json.rows ?? []);
      } catch (err: any) {
        setError(err.message ?? "에러 발생");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-8">불러오는 중...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  if (!rows.length) {
    return (
      <div className="min-h-screen bg-white flex justify-center pt-16 px-4">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-3xl font-bold mb-6">파손품 이력</h1>
          <p className="text-gray-600">데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  // 페이지 계산
  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const currentPage = Math.min(page, totalPages);
  const sliceStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(sliceStart, sliceStart + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-white flex justify-center pt-16 px-4">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold mb-4 text-center">파손품 이력</h1>

        {/* 스프레드시트 스타일 테이블 */}
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-[#5b2e90] text-white">
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 border-b font-semibold whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {pageRows.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {COLUMNS.map((col) => {
                    const value = row[col];

                    const isLong =
                      col === "품목" || col === "형번" || col === "수급 방법";

                    return (
                      <td
                        key={col}
                        className={[
                          "px-4 py-2 border-b text-gray-800 align-top",
                          isLong
                            ? "max-w-xl whitespace-pre-wrap break-words"
                            : "whitespace-nowrap",
                        ].join(" ")}
                      >
                        {formatCell(value, col)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-700">
          <span>
            총 {rows.length}건 | 페이지 {currentPage} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              이전
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatCell(value: any, col: string): string {
  if (!value) return "";

  if (col === "타임스탬프") {
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);

    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Toronto",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
      .format(d)
      .replace(",", "")
      .trim();
  }

  return String(value);
}
