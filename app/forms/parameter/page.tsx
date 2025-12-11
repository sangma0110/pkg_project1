"use client";

import { useState, FormEvent } from "react";

type Status = null | "loading" | "success" | "error";

type FormPayload = {
  targetLine: string;
  machine: string;
  unit: string;
  category: string;
  assy: string;
  actionTime: string;
  requester: string;
  actioner: string;
  parameterName: string;
  before: string;
  after: string;
  reason: string;
};

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1WLlj8Grf74Rdxj5ugFCXj55EFojIc_ZEXTJmO0BWJOo/edit?usp=sharing";

// 🔹 Machine → Unit 목록
const UNIT_OPTIONS: Record<string, string[]> = {
  TW: ["Loader", "Conveyor", "Tab Welder", "Lead Supply", "LMS"],
  CA: ["Cell Loader", "Al Forming", "Cell Assy"],
  EL: ["Cell Loader", "EL Filling", "Cell Unloader"],
};

const formatPreviewTime = (v?: string) => {
  if (!v || !v.trim()) return "-";
  return v.includes("T") ? v.replace("T", " ") : v;
};

// 🔹 모든 문자열 trim 처리 함수
const trimPayload = (payload: FormPayload): FormPayload => {
  const cleaned: Partial<FormPayload> = {};

  for (const [key, value] of Object.entries(payload)) {
    const k = key as keyof FormPayload;
    cleaned[k] = typeof value === "string" ? value.trim() : value;
  }

  return cleaned as FormPayload;
};

export default function NewFormPage() {
  const initialMachine = "TW";
  const initialUnit = UNIT_OPTIONS[initialMachine][0] ?? "";
  const initialAssy = "";

  const [form, setForm] = useState<FormPayload>({
    targetLine: "1-1호기",
    machine: initialMachine,
    unit: initialUnit,
    category: "티칭값 변경",
    assy: initialAssy,
    actionTime: "",
    requester: "",
    actioner: "",
    parameterName: "",
    before: "",
    after: "",
    reason: "",
  });

  const [status, setStatus] = useState<Status>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- 공통 유효성 검사 ---
  const validateForm = (f: FormPayload): string | null => {
    if (!f.targetLine) return "대상 호기를 선택해주세요.";
    if (!f.machine) return "Machine을 선택해주세요.";
    if (!f.unit.trim()) return "Unit을 선택해주세요.";
    if (!f.category) return "유형을 선택해주세요.";
    if (!f.assy.trim()) return "Ass'y를 입력해주세요.";
    if (!f.actionTime.trim()) return "변경 시간을 입력해주세요.";
    if (!f.requester.trim()) return "요청자를 입력해주세요.";
    if (!f.actioner.trim()) return "변경자를 입력해주세요.";
    if (!f.parameterName.trim()) return "변경한 Parameter를 입력해주세요.";
    if (!f.before.trim()) return "이전 값을 입력해주세요.";
    if (!f.after.trim()) return "변경 값을 입력해주세요.";
    if (!f.reason.trim()) return "변경 사유를 입력해주세요.";
    return null;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // 🔹 Machine 변경 시 Unit 초기화
    if (name === "machine") {
      const newMachine = value;
      const unitList = UNIT_OPTIONS[newMachine] ?? [];
      const newUnit = unitList[0] ?? "";

      setForm((prev) => ({
        ...prev,
        machine: newMachine,
        unit: newUnit,
        assy: "",
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const unitList = UNIT_OPTIONS[form.machine] ?? [];

  // --- 미리보기 생성 ---
  const handleGeneratePreview = () => {
    const cleaned = trimPayload(form);
    const err = validateForm(cleaned);
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

  const now = new Date();
  const formattedNow = new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Toronto",
  }).format(now);

  const F = (v?: string) => (v && v.trim() ? v.trim() : "-");

  const previewText = `[파라미터 수정사항 공유] [Parameter Change Update]
■시간(Time) : ${formattedNow}
■대상 호기(Line) : ${F(form.targetLine)}
■Machine : ${F(form.machine)}
■Category : ${F(form.category)}
■Unit : ${F(form.unit)}
■Ass'y : ${F(form.assy)}
■변경 시간(Changed Time) : ${formatPreviewTime(form.actionTime)}
■요청자(Requester) : ${F(form.requester)}
■변경자(Person In Charge) : ${F(form.actioner)}
■변경 Parameter(Changed Parameter) : ${F(form.parameterName)}
■이전 값(Previous Value) : ${F(form.before)}
■변경 값(Changed Value) : ${F(form.after)}
■변경 사유(Reason For The Change) : ${F(form.reason)}
`;

  const handleCopyPreview = async () => {
    try {
      await navigator.clipboard.writeText(previewText);
      setStatus(null);
      setErrorMessage("");
      setSuccessMessage("Text가 클립보드에 복사되었습니다.");
    } catch {
      setStatus("error");
      setErrorMessage(
        "클립보드 복사가 차단되었습니다. 브라우저 보안 설정을 확인해주세요."
      );
    }
  };

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
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/forms?type=param", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (json.status !== "success") {
        throw new Error(json.message ?? "저장 실패");
      }

      setStatus("success");
      setSuccessMessage("업로드가 완료되었습니다. (Uploaded successfully.)");
      setShowPreview(false);

      setForm({
        targetLine: "2-1호기",
        machine: initialMachine,
        unit: initialUnit,
        category: "티칭값 변경",
        assy: "",
        actionTime: "",
        requester: "",
        actioner: "",
        parameterName: "",
        before: "",
        after: "",
        reason: "",
      });
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message ?? "Unknown error");
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center">
          ESST Parameter 관리 이력 Form
        </h1>

        <p className="text-l font-bold mb-8 text-center">
          ESST 파라미터 관리 이력 관리 시트로 관리 사항 업데이트 부탁 드립니다.
          <br />
          (현장에서 즉 조치 필요 사항 제외 모두 조치 양식 맞춰서 진행 부탁
          드립니다.)
          <br />
          현장에서 발생하는 즉 조치 사항 제외 추가적인 요청 사항이나, 조치
          완료된 사항 내역 공유 예정입니다.
          <br />
          <br />
          Please update the management details using the ESST Parameter
          Management History Sheet.
          <br />
          (Except for issues that require immediate on-site action, please
          follow the action form format.)
          <br />
          Additional requests or completed action details—excluding urgent
          on-site actions—will be shared accordingly.
        </p>

        <p className="text-xs text-gray-500 mt-2">
          <span className="text-red-500">*</span> 필수 입력 항목입니다.
          (Required fields)
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-5 bg-white p-6 border rounded-xl shadow-sm"
        >
          {/* Line + Machine + Unit */}
          <div className="flex gap-4 min-w-0">
            <div className="flex-1 min-w-0">
              <label className="block mb-1 font-medium">
                대상 호기(Line)<span className="text-red-500 ml-1">*</span>
              </label>
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

            <div className="flex-1 min-w-0">
              <label className="block mb-1 font-medium">
                Machine<span className="text-red-500 ml-1">*</span>
              </label>
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

            <div className="flex-1 min-w-0">
              <label className="block mb-1 font-medium">
                Unit<span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
              >
                {unitList.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block mb-1 font-medium">
              변경 유형(Category)<span className="text-red-500 ml-1">*</span>
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
            >
              <option value="티칭값 변경">티칭값 변경</option>
              <option value="기구물 조정">기구물 조정</option>
              <option value="세팅값 조정">세팅값 조정</option>
            </select>
          </div>

          {/* Ass'y */}
          <div>
            <label className="block mb-1 font-medium">
              Ass'y<span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              name="assy"
              value={form.assy}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
            />
          </div>

          {/* 변경 시간 */}
          <div className="min-w-0">
            <label className="block mb-1 font-medium">
              변경 시간(Changed Time)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="datetime-local"
              name="actionTime"
              value={form.actionTime}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
              required
            />
          </div>

          {/* 요청자 + 변경자 */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-medium">
                요청자(Requester)<span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="requester"
                value={form.requester}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
              />
            </div>

            <div className="flex-1">
              <label className="block mb-1 font-medium">
                변경자(Person In Charge)
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                name="actioner"
                value={form.actioner}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
              />
            </div>
          </div>

          {/* Parameter */}
          <div>
            <label className="block mb-1 font-medium">
              변경한 파라미터(Changed Parameter)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              name="parameterName"
              value={form.parameterName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
            />
          </div>

          {/* 이전 값 */}
          <div>
            <label className="block mb-1 font-medium">
              이전 값(Previous Value)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              name="before"
              value={form.before}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
            />
          </div>

          {/* 변경 값 */}
          <div>
            <label className="block mb-1 font-medium">
              변경 값(Changed Value)<span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              name="after"
              value={form.after}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
            />
          </div>

          {/* 변경 사유 */}
          <div>
            <label className="block mb-1 font-medium">
              변경 사유(Reason For The Change)
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
            />
          </div>

          {/* 생성 버튼 */}
          <button
            type="button"
            onClick={handleGeneratePreview}
            className="mt-4 w-full px-4 py-3 rounded border bg-white text-black font-semibold hover:bg-black hover:text-white"
          >
            양식 생성하기 (Generate Form)
          </button>

          {status === "error" && (
            <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
          )}
          {successMessage && (
            <p className="text-green-700 text-sm mt-1">{successMessage}</p>
          )}

          {/* 미리보기 */}
          {showPreview && (
            <div className="mt-6 flex flex-col gap-4">
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 border rounded p-4 leading-relaxed">
                {previewText}
              </pre>

              {/* ✅ Text 복사 버튼 (clipboard 전용) */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault(); // form submit 완전 차단
                  handleCopyPreview();
                }}
                className="w-full px-4 py-3 rounded border font-semibold bg-white text-black hover:bg-black hover:text-white"
              >
                Text 복사 (Copy Text)
              </button>

              {/* ✅ 업로드 버튼 (submit 전용) */}
              <button
                type="submit"
                disabled={status === "loading"}
                className={`
    w-full px-4 py-3 rounded border font-semibold transition-all
    ${
      status === "loading"
        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
        : "bg-white text-black hover:bg-black hover:text-white"
    }
  `}
              >
                {status === "loading" ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-gray-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    전송 중... (Sending...)
                  </div>
                ) : (
                  "업로드 (Upload)"
                )}
              </button>

              <a
                href={SHEET_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full text-center px-4 py-3 rounded border bg-white text-black font-semibold hover:bg-black hover:text-white"
              >
                ESST 파라미터 관리 이력 Sheet 열기 (Open ESST Parameter History
                Sheet)
              </a>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
