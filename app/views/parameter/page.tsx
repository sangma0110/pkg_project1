"use client";

import { useEffect, useState } from "react";
import type { FormRow } from "@/app/api/forms/route";

interface GetResponse {
  status: "success" | "error";
  rows?: FormRow[];
  message?: string;
}

const PAGE_SIZE = 20;

/** 🔹 Parameter Sheet 컬럼 정의 (네 Sheet 순서 그대로) */
const COLUMNS = [
  "No.",
  "타임스탬프(TimeStamp)",
  "대상 호기(Line)",
  "Machine",
  "Unit",
  "변경 유형",
  "Assy'",
  "변경 시간",
  "요청자",
  "변경자",
  "변경 파라미터",
  "이전 값",
  "변경 값",
  "변경 사유",
];

export default function ParameterViewPage() {
  const [rows, setRows] = useState<FormRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchRows = async () => {
      try {
        const res = await fetch("/api/forms?type=param");
        const json = (await res.json()) as GetResponse;

        if (json.status !== "success") {
          throw new Error(json.message ?? "조회 실패(Fail to Look Up)");
        }

        setRows(json.rows ?? []);
      } catch (err: any) {
        setError(err.message ?? "에러 발생(Error Caused)");
      } finally {
        setLoading(false);
      }
    };

    fetchRows();
  }, []);

  if (loading) return <div className="p-8">불러오는 중...(Loading...)</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  if (!rows.length) {
    return (
      <div className="min-h-screen bg-white text-black flex items-start justify-center pt-16 px-4">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl font-bold mb-6 text-center">
            ESST Parameter 변경 이력 목록 (ESST Parameter Change History List)
          </h1>
          <p className="text-center text-gray-600">데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  /** 🔹 페이지 계산 */
  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pageRows = rows.slice(startIndex, endIndex);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="min-h-screen bg-white text-black flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-4 text-center">
          ESST Parameter 변경 이력 목록
          <br /> (ESST Parameter Change History List)
        </h1>

        {/* ── 테이블 영역 ───────────────────── */}
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2 border-b text-left font-bold text-gray-900 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {pageRows.map((row, rowIndex) => (
                <tr key={startIndex + rowIndex} className="hover:bg-gray-50">
                  {COLUMNS.map((col) => {
                    const isLongText =
                      col === "Assy'" ||
                      col === "Unit" ||
                      col === "요청자" ||
                      col === "변경자" ||
                      col === "이전 값" ||
                      col === "변경 값" ||
                      col === "변경 사유";

                    const value = (row as any)[col];

                    return (
                      <td
                        key={col}
                        className={[
                          "px-3 py-2 border-b text-gray-800 align-top",
                          isLongText
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

        {/* ── 페이지네이션 ───────────────────── */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-700">
          <span>
            총 {rows.length}건 | 페이지 {currentPage} / {totalPages} (Total{" "}
            {rows.length} Items | Page {currentPage} / {totalPages})
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              이전(Prev)
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              다음(Next)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 🔹 타임스탬프 Formatting */
function formatCell(value: any, col: string): string {
  if (value == null) return "";

  if (col === "타임스탬프(TimeStamp)" || col.toLowerCase().includes("time")) {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return String(value);

    const options: Intl.DateTimeFormatOptions = {
      timeZone: "America/Toronto",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    return new Intl.DateTimeFormat("en-CA", options)
      .format(date)
      .replace(",", "")
      .trim();
  }

  return String(value);
}
