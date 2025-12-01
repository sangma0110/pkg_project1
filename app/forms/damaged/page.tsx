"use client";

import { useState, FormEvent, ChangeEvent } from "react";

type Status = null | "loading" | "success" | "error";

type FormPayload = {
  damagedLine: string; // 파손 호기 (C열)
  item: string; // 품목 (D열)
  modelNumber: string; // 형번 (E열)
  reason: string; // 파손 원인 (F열)
  quantity: string; // 수량 (G열)
  supplyMethod: string; // 수급 방법 (H열)
  spare: string; // Spare 대체 현황 (I열)
};

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1tT9aG5UiREgvkV-s9KCY_61cSRZiS4qBhRmRKuBXI0Y/edit?usp=sharing";

export default function NewFormPage() {
  const [form, setForm] = useState<FormPayload>({
    damagedLine: "1-1호기",
    item: "",
    modelNumber: "",
    reason: "",
    quantity: "",
    supplyMethod: "",
    spare: "",
  });

  const [status, setStatus] = useState<Status>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- 공통 유효성 검사 ---
  const validateForm = (f: FormPayload): string | null => {
    if (!f.damagedLine)
      return "파손 호기를 선택해주세요. (Please select the damaged line.)";
    if (!f.item) return "품목을 입력해주세요. (Please enter the item.)";
    if (!f.modelNumber.trim())
      return "형번을 입력해주세요. (Please enter the model number.)";
    if (!f.reason.trim())
      return "파손 원인을 입력해주세요. (Please enter the cause of the damage.)";
    if (!f.quantity.trim())
      return "수량을 입력해주세요. (Please enter the quantity.)";
    if (!f.supplyMethod.trim())
      return "수급 방법을 입력해주세요. (Please enter the supply method.)";
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

      const res = await fetch("/api/forms?type=damaged", {
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
        damagedLine: "1-1호기",
        item: "",
        modelNumber: "",
        reason: "",
        quantity: "",
        supplyMethod: "",
        spare: "",
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

  const previewText = `[파손품 조치 이력 공유] [Damaged Item Action History Sharing]
  ■시간(Time) : ${formattedNow}
  ■파손 호기(Damaged Line) : ${F(form.damagedLine)}
  ■품목(Item) : ${F(form.item)}
  ■형번(Model Number) : ${F(form.modelNumber)}
  ■파손 원인(Reason) : ${F(form.reason)}
  ■수량(Quantity) : ${F(form.quantity)}
  ■수급 방법(Supply Method) : ${F(form.supplyMethod)} `;

  return (
    <div className="min-h-screen bg-white text-black flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center">
          ESST 파손품 관리 이력 Form
          <br />
          (Damaged Item Action History Sharing Form)
        </h1>

        <p className="text-l font-bold mb-8 text-center">
          ESST 파손품 관리 이력 관리 시트로 관리 사항 업데이트 부탁 드립니다.
          <br />
          (현장에서 즉 조치 필요 사항 제외 모두 조치 양식 맞춰서 진행 부탁
          드립니다.)
          <br />
          현장에서 발생하는 즉 조치 사항 제외 추가적인 요청 사항이나, 조치
          완료된 사항 내역 공유 예정입니다.
          <br />
          <br />
          Please update the management details using the ESST Damaged Item
          Management History Sheet.
          <br />
          (Except for issues that require immediate on-site action, please
          follow the action form format.)
          <br />
          Additional requests or completed action details—excluding urgent
          on-site actions—will be shared accordingly.
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-5 bg-white p-6 border rounded-xl shadow-sm"
        >
          {/* 파손 호기*/}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-medium">
                파손 호기(Damaged Line)
              </label>
              <select
                name="damagedLine"
                value={form.damagedLine}
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
          </div>

          {/* 품목 */}
          <div>
            <label className="block mb-1 font-medium">품목(Item)</label>
            <textarea
              name="item"
              value={form.item}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white min-h-[80px]"
            />
          </div>

          {/* 형번 */}
          <div>
            <label className="block mb-1 font-medium">형번(Model Number)</label>
            <textarea
              name="modelNumber"
              value={form.modelNumber}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white min-h-[80px]"
            />
          </div>

          {/* 파손 원인 */}
          <div>
            <label className="block mb-1 font-medium">
              파손 원인(Cause of the Damage)
            </label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white min-h-[80px]"
            />
          </div>

          {/* 수량 */}
          <div>
            <label className="block mb-1 font-medium">수량(Quantity)</label>
            <textarea
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white min-h-[80px]"
            />
          </div>

          {/* 수급 방법 */}
          <div>
            <label className="block mb-1 font-medium">
              수급 방법(Supply Method)
            </label>
            <textarea
              name="supplyMethod"
              value={form.supplyMethod}
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
                {status === "loading"
                  ? "전송 중... (Sending...)"
                  : "업로드 및 Text 복사 (Upload & Copy Text)"}
              </button>

              <a
                href={SHEET_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full text-center px-4 py-2 rounded border rounded bg-white text-black font-semibold hover:bg-black hover:text-white"
              >
                ESST 파손품 관리 이력 Sheet 열기 (Open Damaged Item Action
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
