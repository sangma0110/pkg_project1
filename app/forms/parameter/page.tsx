"use client";

import { useState, FormEvent } from "react";

type Status = null | "loading" | "success" | "error";

type FormPayload = {
  targetLine: string; // 대상 호기 (C열)
  machine: string; // Machine (D열)
  unit: string; // 유닛 (E열)
  assy: string; // ass'y (F열)
  actionTime: string; // 변경 시간 (G열)
  actioner: string; // 변경자 (H열)
  parameterName: string; // 파라미터 이름 (I열)
  before: string; // 이전 값 (J열)
  after: string; // 변경 값 (K열)
  reason: string; // 변경 사유 (L열)
};

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1KwU6JWp-DG_Kr7Ng4Z5zLB_xpxH6o5SZutwXPB5VLM8/edit?gid=991199097#gid=991199097";

// 🔹 Machine → Unit 목록
const UNIT_OPTIONS: Record<string, string[]> = {
  TW: ["Loader", "Conveyor", "Tab Welder", "Lead Supply", "LMS"],
  CA: ["Cell Loader", "Al Forming", "Cell Assy"],
  EL: ["Cell Loader", "EL Filling", "Cell Unloader"],
};

export default function NewFormPage() {
  // 🔹 초기 machine/unit/assy 를 실제 옵션 기준으로 세팅
  const initialMachine = "TW";
  const initialUnit = UNIT_OPTIONS[initialMachine][0] ?? "";
  const initialAssy = "";

  const [form, setForm] = useState<FormPayload>({
    targetLine: "2-1",
    machine: initialMachine,
    unit: initialUnit,
    assy: initialAssy,
    actionTime: "",
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
    if (!f.targetLine)
      return "대상 호기를 선택해주세요. (Please select the target line.)";
    if (!f.machine)
      return "Machine을 선택해주세요. (Please select the machine.)";
    if (!f.unit.trim()) return "Unit을 선택해주세요. (Please select the unit.)";
    if (!f.assy.trim())
      return "Ass'y를 입력해주세요. (Please enter the assembly.)";
    if (!f.actionTime.trim())
      return "변경 시간을 입력해주세요. (Please enter the change time.)";
    if (!f.actioner.trim())
      return "변경자를 입력해주세요. (Please enter the person who made the change.)";
    if (!f.parameterName.trim())
      return "변경한 Parameter를 입력해주세요. (Please enter the parameter changed.)";
    if (!f.before.trim())
      return "이전 값을 입력해주세요. (Please enter the previous value.)";
    if (!f.after.trim())
      return "변경 값을 입력해주세요. (Please enter the updated value.)";
    if (!f.reason.trim())
      return "변경 사유를 입력해주세요. (Please enter the reason for the change.)";
    return null;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // 1) Machine 이 바뀔 때
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

    // 3) 나머지 일반 필드
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🔹 Unit / Assy 리스트 미리 계산 (항상 배열 보장)
  const unitList = UNIT_OPTIONS[form.machine] ?? [];

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

  // ----- PD 양식 미리보기 텍스트 -----
  const now = new Date();
  const formattedNow = new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Toronto",
  }).format(now);

  const F = (v?: string) => (v && v.trim() ? v.trim() : "-");

  const previewText = `[파라미터 수정사항 공유] [Parameter Change Update]
  1. 시간(Time) : ${formattedNow}
  2. 대상 호기(Line) : ${F(form.targetLine)}
  3. Machine : ${F(form.machine)}
  4. Unit : ${F(form.unit)}
  5. Ass'y : ${F(form.assy)}
  6. 변경 시간(Changed Time) : ${F(form.actionTime)}
  7. 변경자(Person In Charge) : ${F(form.actioner)}
  8. 변경 Parameter(Changed Parameter) : ${F(form.parameterName)}
  9. 이전 값(Previous Value) : ${F(form.before)}
  10. 변경 값(Changed Value) : ${F(form.after)}
  11. 변경 사유(Reason For The Change) : ${F(form.reason)}
  `;

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
      setSuccessMessage(
        "업로드 및 클립보드에 Text 가 복사 되었습니다. (Uploaded and copied to clipboard.)"
      );
      setShowPreview(false);
      setForm({
        targetLine: "2-1호기",
        machine: initialMachine,
        unit: initialUnit,
        assy: initialAssy,
        actionTime: "",
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
          <br />
          (ESST Parameter Change History Form)
        </h1>

        <p className="text-sm font-bold mb-8 text-center">
          ESST PKG Parameter 관리 이력 시트로 관리 이력 업데이트 부탁 드립니다.
          <br />
          (현장에서 즉 조치 필요 사항 제외 모두 요청 양식 맞춰서 진행 부탁
          드립니다.)
          <br />
          현장에서 발생하는 즉 조치 사항 제외 추가적인 요청 사항이나, 조치
          완료된 사항 내역 공유 예정입니다.
          <br /> <br />
          Please update the management history using the ESST PKG Parameter
          Management History Sheet.
          <br />
          (Except for issues that require immediate on-site action, please
          follow the request form format.)
          <br />
          Additional requests or completed action details—excluding urgent
          on-site actions—will be shared accordingly.
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-5 bg-white p-6 border rounded-xl shadow-sm"
        >
          {/* 대상 호기 + Machine + Unit */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-medium">대상 호기(Line)</label>
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

            {/* Machine */}
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

            {/* Unit */}
            <div className="flex-1">
              <label className="block mb-1 font-medium">Unit</label>
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

          {/* Ass'y */}
          <div>
            <label className="block mb-1 font-medium">Ass' y</label>
            <textarea
              name="assy"
              value={form.assy}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white min-h-[80px]"
            />
          </div>

          {/* 변경 시간 */}
          <div>
            <label className="block mb-1 font-medium">
              변경 시간(Changed Time)
            </label>
            <textarea
              name="actionTime"
              value={form.actionTime}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white min-h-[80px]"
            />
          </div>

          {/* 변경자 */}
          <div>
            <label className="block mb-1 font-medium">
              변경자(Person In Charge)
            </label>
            <input
              name="actioner"
              value={form.actioner}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
            />
          </div>

          {/* 변경 Parameter */}
          <div>
            <label className="block mb-1 font-medium">
              변경한 파라미터(Changed Parameter)
            </label>
            <textarea
              name="parameterName"
              value={form.parameterName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white min-h-[80px]"
            />
          </div>

          {/* 이전 값 */}
          <div>
            <label className="block mb-1 font-medium">
              이전 값(Previous Value)
            </label>
            <textarea
              name="before"
              value={form.before}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white min-h-[80px]"
            />
          </div>

          {/* 변경 값 */}
          <div>
            <label className="block mb-1 font-medium">
              변경 값(Changed Value)
            </label>
            <textarea
              name="after"
              value={form.after}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white min-h-[80px]"
            />
          </div>

          {/* 변경 사유 */}
          <div>
            <label className="block mb-1 font-medium">
              변경 사유(Reason For The Change)
            </label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white min-h-[80px]"
            />
          </div>

          {/* 1단계 버튼 */}
          <button
            type="button"
            onClick={handleGeneratePreview}
            className="mt-4 w-full px-4 py-3 rounded border bg-white text-black font-semibold hover:bg-black hover:text-white"
          >
            양식 생성하기(Generate Form)
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
                className="w-full px-4 py-2 rounded border bg-white text-black font-semibold hover:bg-black hover:text-white disabled:opacity-40"
              >
                {status === "loading"
                  ? "전송 중... (Sending...)"
                  : "업로드 및 Text 복사 (Upload & Copy Text)"}
              </button>

              <a
                href={SHEET_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full text-center px-4 py-2 rounded border bg-white text-black font-semibold hover:bg-black hover:text-white"
              >
                ESST 파라미터 관리 이력 Sheet 열기(Open ESST Parameter Change
                History Sheet)
              </a>

              {status === "success" && (
                <p className="text-green-600 text-sm mt-1">
                  성공적으로 저장되었습니다. (Saved Successfully)
                </p>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
