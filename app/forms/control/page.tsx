"use client";

import { useState, FormEvent, ChangeEvent } from "react";

type Status = null | "loading" | "success" | "error";

type FormPayload = {
  targetLine: string; // 대상 호기 (C열)
  machine: string; // Machine (D열)
  symptom: string; // 현상 (E열)
  requester: string; // 요청자 (F열)
  requestDetail: string; // 요청 내용 (G열)
  actionDetail: string; // 조치 내용 (H열)
  completed: string; // 완료 여부 (I열)
};

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1KwU6JWp-DG_Kr7Ng4Z5zLB_xpxH6o5SZutwXPB5VLM8/edit?gid=991199097#gid=991199097";

export default function NewFormPage() {
  const [form, setForm] = useState<FormPayload>({
    targetLine: "2-1",
    machine: "TW",
    symptom: "",
    requester: "",
    requestDetail: "",
    actionDetail: "",
    completed: "미완료",
  });

  const [status, setStatus] = useState<Status>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- 공통 유효성 검사 ---
  const validateForm = (f: FormPayload): string | null => {
    if (!f.targetLine) return "대상 호기를 선택해주세요.";
    if (!f.machine) return "Machine을 선택해주세요.";
    if (!f.symptom.trim()) return "현상을 입력해주세요.";
    if (!f.requester.trim()) return "요청자를 입력해주세요.";
    if (!f.requestDetail.trim()) return "요청 내용을 입력해주세요.";
    if (!f.actionDetail.trim()) return "조치 내용을 입력해주세요.";
    return null;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setStatus(null);
    setErrorMessage("");
  };

  // 1단계: 양식 생성 버튼
  const handleGeneratePreview = () => {
    const err = validateForm(form);
    if (err) {
      setStatus("error");
      setErrorMessage(err);
      setShowPreview(false);
      return;
    }
    setStatus(null);
    setErrorMessage("");
    setShowPreview(true);
  };

  // 2단계: 실제 업로드 (녹색 버튼)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const err = validateForm(form);
    if (err) {
      setStatus("error");
      setErrorMessage(err);
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      await navigator.clipboard.writeText(previewText);
      setSuccessMessage("업로드 및 클립보드에 Text 가 복사 되었습니다.");

      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (json.status !== "success") {
        throw new Error(json.message ?? "저장 실패");
      }

      setStatus("success");
      setShowPreview(false);
      setForm({
        targetLine: "2-1",
        machine: "TW",
        symptom: "",
        requester: "",
        requestDetail: "",
        actionDetail: "",
        completed: "미완료",
      });
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message ?? "Unknown error");
    }
  };

  // ----- PD 양식 미리보기 텍스트 -----
  const now = new Date();
  const formattedNow = new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Toronto",
  }).format(now);

  const F = (v?: string) => (v && v.trim() ? v.trim() : "-");

  const previewText = `[제어 요청 공유]
  1. 시간 : ${formattedNow}
  2. 대상 호기 : ${F(form.targetLine)}
  3. Machine : ${F(form.machine)}
  4. 현상 : ${F(form.symptom)}
  5. 요청자 : ${F(form.requester)}
  6. 요청 내용 : ${F(form.requestDetail)}
  7. 조치 : ${F(form.actionDetail)}`;

  return (
    <div className="min-h-screen bg-white text-black flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center">
          ESST 제어 요청 Form
        </h1>

        <p className="text-l font-bold mb-8 text-center">
          ESST PKG 제어 이력 관리 시트로 요청 사항 업데이트 부탁 드립니다.
          <br />
          (현장에서 즉 조치 필요 사항 제외 모두 요청 양식 맞춰서 진행 부탁
          드립니다.)
          <br />
          현장에서 발생하는 즉 조치 사항 제외 추가적인 요청 사항이나, 조치
          완료된 사항 내역 공유 예정입니다.
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-5 bg-white p-6 border rounded-xl shadow-sm"
        >
          {/* 대상 호기 + Machine */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-medium">대상 호기</label>
              <select
                name="targetLine"
                value={form.targetLine}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
              >
                <option value="1-1호기">1-1</option>
                <option value="1-2호기">1-2</option>
                <option value="2-1호기">2-1</option>
                <option value="2-2호기">2-2</option>
                <option value="3-1호기">3-1</option>
                <option value="3-2호기">3-2</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-medium">Machine</label>
              <select
                name="machine"
                value={form.machine}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
              >
                <option value="TW">TW</option>
                <option value="CA">CA</option>
                <option value="EL">EL</option>
              </select>
            </div>
          </div>

          {/* 현상 */}
          <div>
            <label className="block mb-1 font-medium">현상</label>
            <textarea
              name="symptom"
              value={form.symptom}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white min-h-[80px]"
            />
          </div>

          {/* 요청자 */}
          <div>
            <label className="block mb-1 font-medium">요청자</label>
            <input
              name="requester"
              value={form.requester}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
            />
          </div>

          {/* 요청 내용 */}
          <div>
            <label className="block mb-1 font-medium">요청 내용</label>
            <textarea
              name="requestDetail"
              value={form.requestDetail}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white min-h-[80px]"
            />
          </div>

          {/* 조치 내용 */}
          <div>
            <label className="block mb-1 font-medium">조치 내용</label>
            <textarea
              name="actionDetail"
              value={form.actionDetail}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white min-h-[80px]"
            />
          </div>

          {/* 1단계 버튼 */}
          <button
            type="button"
            onClick={handleGeneratePreview}
            className="mt-4 w-full px-4 py-3 rounded border rounded bg-white text-black font-semibold hover:bg-black hover:text-white"
          >
            양식 생성하기
          </button>

          {status === "error" && (
            <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
          )}

          {successMessage && (
            <p className="mt-2 text-sm text-green-700">{successMessage}</p>
          )}

          {/* 2단계: 미리보기 + 업로드 버튼들 */}
          {showPreview && (
            <div className="mt-6 flex flex-col gap-4">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-gray-50 border rounded p-4">
                {previewText}
              </pre>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full px-4 py-2 rounded border rounded bg-white text-black font-semibold hover:bg-black hover:text-white disabled:opacity-40"
              >
                {status === "loading" ? "전송 중..." : "업로드 및 Text 복사"}
              </button>

              <a
                href={SHEET_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full text-center px-4 py-2 rounded border rounded bg-white text-black font-semibold hover:bg-black hover:text-white"
              >
                ESST 제어 이력 Sheet 열기
              </a>

              {status === "success" && (
                <p className="text-green-600 text-sm mt-1">
                  성공적으로 저장되었습니다.
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
