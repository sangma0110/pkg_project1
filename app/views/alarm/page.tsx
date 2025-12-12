"use client";

import { useEffect, useState } from "react";
import type { FormRow } from "@/app/api/forms/route";

interface GetResponse {
  status: "success" | "error";
  rows?: FormRow[];
  message?: string;
}

const PAGE_SIZE = 20;

/** 🔹 Alarm Sheet에 맞는 컬럼들 */
const COLUMNS = [
  { header: "No.", key: "no" },
  { header: "타임스탬프(TimeStamp)", key: "timestamp" },
  { header: "일자", key: "date" },
  { header: "시작 시간", key: "startTime" },
  { header: "종료 시간", key: "endTime" },
  { header: "대상 호기(Line)", key: "targetLine" },
  { header: "Machine", key: "machine" },
  { header: "알람 코드", key: "alarmCode" },
  { header: "현상(Symptom)", key: "symptom" },
  { header: "원인", key: "cause" },
  { header: "조치 내용(Action Detail)", key: "actionDetail" },
  { header: "조치 인원(Requester)", key: "requester" },
  { header: "여부(Completion Status)", key: "completion" },
];

export default function AlarmViewPage() {
  const [rows, setRows] = useState<FormRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchRows = async () => {
      try {
        const res = await fetch("/api/forms?type=alarm");
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
            ESST 알람 이력 목록 (ESST Alarm Action History List)
          </h1>
          <p className="text-center text-gray-600">데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  /** 🔹 페이지네이션 계산 */
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
          ESST 알람 이력 목록 (ESST Alarm Action History List)
        </h1>

        {/* 테이블 */}
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className="px-3 py-2 border-b text-left font-bold text-gray-900 whitespace-nowrap"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {pageRows.map((row, rowIndex) => (
                <tr key={startIndex + rowIndex} className="hover:bg-gray-50">
                  {COLUMNS.map((col) => {
                    const value = (row as any)[col.key];

                    const isLongText =
                      col.key === "symptom" ||
                      col.key === "alarmCode" ||
                      col.key === "cause" ||
                      col.key === "actionDetail";

                    return (
                      <td
                        key={col.key}
                        className={[
                          "px-3 py-2 border-b text-gray-800 align-top",
                          isLongText
                            ? "max-w-xl whitespace-pre-wrap break-words"
                            : "whitespace-nowrap",
                        ].join(" ")}
                      >
                        {formatCell(value, col.header)}
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

function formatCell(value: any, col: string): string {
  if (value == null) return "";

  // 🔹 1) 일자(Date)
  if (col === "일자") {
    // 이미 YYYY-MM-DD 형태면 그대로 리턴
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    // 날짜 + 시간일 경우 날짜만 추출
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10); // YYYY-MM-DD
    }

    return String(value);
  }

  // 🔹 2) 시작 시간 / 종료 시간: HH:mm 형태로 (엑셀 숫자 방지)
  if (col === "시작 시간" || col === "종료 시간") {
    // 이미 "14:55" 형태면 그대로
    if (/^\d{1,2}:\d{2}$/.test(value)) return value;

    // 엑셀에서 9.52 같은 숫자는 "9:52"로 변환
    if (typeof value === "number") {
      const hours = Math.floor(value);
      const minutes = Math.round((value - hours) * 60);
      return `${hours}:${String(minutes).padStart(2, "0")}`;
    }

    // Date 객체 들어올 경우
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      const hh = String(date.getHours()).padStart(2, "0");
      const mm = String(date.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}`;
    }

    return String(value);
  }

  // 🔹 3) 타임스탬프(TimeStamp)
  if (col === "타임스탬프(TimeStamp)") {
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);

    return date.toLocaleString("en-CA", {
      timeZone: "America/Toronto",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  return String(value);
}
