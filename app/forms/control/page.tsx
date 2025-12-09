"use client";

import { useState, FormEvent, ChangeEvent } from "react";

type Status = null | "loading" | "success" | "error";

type FormPayload = {
  targetLine: string;
  machine: string;
  symptom: string;
  requester: string;
  requestDetail: string;
  actionDetail: string;
  completed: string;
};

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1KwU6JWp-DG_Kr7Ng4Z5zLB_xpxH6o5SZutwXPB5VLM8/edit?usp=sharing";

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  /* -------------------- Validation -------------------- */
  const validateForm = (f: FormPayload): string | null => {
    if (!f.targetLine) return "대상 호기를 선택해주세요.";
    if (!f.machine) return "Machine을 선택해주세요.";
    if (!f.symptom.trim()) return "현상을 입력해주세요.";
    if (!f.requester.trim()) return "요청자를 입력해주세요.";
    if (!f.requestDetail.trim()) return "요청 내용을 입력해주세요.";
    return null;
  };

  /* -------------------- Handlers -------------------- */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setStatus(null);
    setErrorMessage("");
    setSuccessMessage(null);
  };

  const handleGeneratePreview = () => {
    const err = validateForm(form);
    if (err) {
      setStatus("error");
      setErrorMessage(err);
      setShowPreview(false);
      return;
    }

    setShowPreview(true);
    setStatus(null);
    setErrorMessage("");
  };

  /* ✅ Clipboard 전용 (user gesture 보장) */
  const handleCopyPreview = async () => {
    try {
      await navigator.clipboard.writeText(previewText);
      setSuccessMessage("Text가 클립보드에 복사되었습니다.");
    } catch {
      setStatus("error");
      setErrorMessage(
        "클립보드 복사가 차단되었습니다. 브라우저 보안 설정을 확인해주세요."
      );
    }
  };

  /* ✅ 서버 저장 전용 */
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
      const res = await fetch("/api/forms?type=control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (json.status !== "success") {
        throw new Error(json.message ?? "저장 실패");
      }

      setStatus("success");
      setSuccessMessage("업로드가 완료되었습니다.");
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

  /* -------------------- Preview Text -------------------- */
  const now = new Date();
  const formattedNow = new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Toronto",
  }).format(now);

  const F = (v?: string) => (v && v.trim() ? v.trim() : "-");

  const previewText = `[제어 요청 공유] [Control Request Sharing]
■ 시간(Time) : ${formattedNow}
■ 대상 호기(Line) : ${F(form.targetLine)}
■ Machine : ${F(form.machine)}
■ 현상(Symptom) : ${F(form.symptom)}
■ 요청자(Requester) : ${F(form.requester)}
■ 요청 내용(Request Detail) : ${F(form.requestDetail)}
■ 조치(Action Detail) : ${F(form.actionDetail)}`;

  /* -------------------- UI -------------------- */
  return (
    <div className="min-h-screen bg-white text-black flex justify-center pt-16 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center">
          ESST 제어 요청 Form
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 bg-white p-6 border rounded-xl shadow-sm"
        >
          {/* Line / Machine */}
          <div className="flex flex-col md:flex-row gap-4">
            <select
              name="targetLine"
              value={form.targetLine}
              onChange={handleChange}
              className="flex-1 border rounded px-3 py-2"
            >
              <option value="1-1">1-1</option>
              <option value="1-2">1-2</option>
              <option value="2-1">2-1</option>
              <option value="2-2">2-2</option>
              <option value="3-1">3-1</option>
              <option value="3-2">3-2</option>
            </select>

            <select
              name="machine"
              value={form.machine}
              onChange={handleChange}
              className="flex-1 border rounded px-3 py-2"
            >
              <option value="All">All</option>
              <option value="TW">TW</option>
              <option value="CA">CA</option>
              <option value="EL">EL</option>
            </select>
          </div>

          <textarea
            name="symptom"
            value={form.symptom}
            onChange={handleChange}
            placeholder="현상 (Symptom)"
            className="border rounded px-3 py-2 min-h-[80px]"
          />

          <input
            name="requester"
            value={form.requester}
            onChange={handleChange}
            placeholder="요청자 (Requester)"
            className="border rounded px-3 py-2"
          />

          <textarea
            name="requestDetail"
            value={form.requestDetail}
            onChange={handleChange}
            placeholder="요청 내용 (Request Detail)"
            className="border rounded px-3 py-2 min-h-[80px]"
          />

          <textarea
            name="actionDetail"
            value={form.actionDetail}
            onChange={handleChange}
            placeholder="조치 내용 (Action Detail)"
            className="border rounded px-3 py-2 min-h-[80px]"
          />

          {/* Generate */}
          <button
            type="button"
            onClick={handleGeneratePreview}
            className="w-full px-4 py-3 border rounded font-semibold hover:bg-black hover:text-white"
          >
            양식 생성하기
          </button>

          {status === "error" && (
            <p className="text-red-600 text-sm">{errorMessage}</p>
          )}

          {showPreview && (
            <div className="flex flex-col gap-4 mt-4">
              <pre className="bg-gray-50 border rounded p-4 text-sm whitespace-pre-wrap">
                {previewText}
              </pre>

              <button
                type="button"
                onClick={handleCopyPreview}
                className="w-full px-4 py-3 border rounded font-semibold hover:bg-black hover:text-white"
              >
                Text 복사
              </button>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full px-4 py-3 border rounded font-semibold disabled:opacity-50 hover:bg-black hover:text-white"
              >
                {status === "loading" ? "전송 중..." : "업로드"}
              </button>

              <a
                href={SHEET_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full text-center px-4 py-2 border rounded font-semibold hover:bg-black hover:text-white"
              >
                제어 이력 Sheet 열기
              </a>

              {status === "success" && (
                <p className="text-green-600 text-sm">{successMessage}</p>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
