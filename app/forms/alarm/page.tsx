"use client";

import { useState, FormEvent, ChangeEvent } from "react";

type Status = null | "loading" | "success" | "error";

type FormPayload = {
  actionDate: string; // 일자 (C열)
  startTime: string; // 시작시간 (D열)
  endTime: string; // 종료시간 (E열)
  targetLine: string; // 대상 호기 (F열)
  machine: string; // Machine (G열)
  alarmCode: string; // 알람 코드 (H열)
  symptom: string; // 현상 (I열)
  reason: string; // 원인 (J열)
  actionDetail: string; // 조치 내용 (K열)
  actioner: string; // 조치 인원 (L열)
  status: string; // 완료 여부 (M열)
};

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1BC8Znp2zTWjSXsWRfR7kuHAwRVVOMXkje5mxWa7Uce8/edit?usp=sharing";

export default function NewFormPage() {
  const [form, setForm] = useState<FormPayload>({
    actionDate: "",
    startTime: "",
    endTime: "",
    targetLine: "1-1호기",
    machine: "TW",
    alarmCode: "",
    symptom: "",
    reason: "",
    actionDetail: "",
    actioner: "",
    status: "",
  });

  const [status, setStatus] = useState<Status>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formatDateMMDD = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${month}/${day}`;
  };

  // --- 공통 유효성 검사 ---
  const validateForm = (f: FormPayload): string | null => {
    if (!f.actionDate) return "일자를 선택해주세요. (Please select the date)";
    if (!f.startTime)
      return "시작 시간을 선택해주세요. (Please select the start time)";
    if (!f.endTime)
      return "종료 시간을 선택해주세요. (Please select the end time)";
    if (!f.targetLine)
      return "대상 호기를 선택해주세요. (Please select the line.)";
    if (!f.machine) return "Machine 을 선택해주세요. (Please select the line.)";
    if (!f.alarmCode.trim())
      return "알람 코드를 입력해주세요. (Please enter the alarm code.)";
    if (!f.symptom.trim())
      return "현상을 입력해주세요. (Please enter the symptom.)";
    if (!f.reason.trim())
      return "원인을 입력해주세요. (Please enter the cause.)";
    if (!f.actionDetail.trim())
      return "조치 사항을 입력해주세요. (Please enter the action details.)";
    if (!f.actioner.trim())
      return "조치 인원을 입력해주세요. (Please select the person in charge.)";
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

      const res = await fetch("/api/forms?type=alarm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();
      if (json.status !== "success") {
        throw new Error(json.message ?? "저장 실패");
      }

      setStatus("success");
      setSuccessMessage("업로드 및 클립보드에 Text 가 복사 되었습니다.");
      setShowPreview(false);
      setForm({
        actionDate: "",
        startTime: "",
        endTime: "",
        targetLine: "1-1호기",
        machine: "TW",
        alarmCode: "",
        symptom: "",
        reason: "",
        actionDetail: "",
        actioner: "",
        status: "",
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

  const previewText = `
  ■호기: ${F(form.targetLine)} ${F(form.machine)}
  ■일시: ${formatDateMMDD(form.actionDate)}(${form.startTime}~${form.endTime})
  ■현상: [${F(form.alarmCode)}] ${F(form.symptom)}
  ■원인: ${F(form.reason)}
  ■조치사항: ${F(form.actionDetail)}
  ■조치인원: ${F(form.actioner)}`;

  return (
    <div className="min-h-screen bg-white text-black flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center">
          ESST Alarm 조치 이력 Form
          <br />
          (ESST Alarm Action History Sharing Form)
        </h1>

        <p className="text-sm font-bold mb-8 text-center">
          ESST Alarm 조치 이력 관리 시트로 조치 사항 업데이트 부탁 드립니다.
          <br />
          (현장에서 즉 조치 필요 사항 제외 모두 조치 양식 맞춰서 진행 부탁
          드립니다.)
          <br />
          현장에서 발생하는 즉 조치 사항 제외 추가적인 요청 사항이나, 조치
          완료된 사항 내역 공유 예정입니다.
          <br />
          <br />
          Please update the action details using the ESST Alarm Action History
          Management Sheet.
          <br />
          (Except for issues that require immediate on-site action, please
          follow the action form format.)
          <br />
          Any additional requests or completed action details—excluding urgent
          on-site actions—will be shared accordingly.
          <br />
        </p>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-5 bg-white p-6 border rounded-xl shadow-sm"
        >
          <div className="flex gap-4">
            {/* 일자 */}
            <div className="flex-1">
              <label className="block font-medium mb-1">일자(Date)</label>
              <input
                type="date"
                name="actionDate"
                value={form.actionDate}
                onChange={handleChange}
                className="border rounded p-2 w-full"
                required
              />
            </div>

            {/* 시작 시간 */}
            <div className="flex-1">
              <label className="block font-medium mb-1">
                시작 시간(Start Time)
              </label>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className="border rounded p-2 w-full"
                required
              />
            </div>

            {/* 종료 시간 */}
            <div className="flex-1">
              <label className="block font-medium mb-1">
                종료 시간(End Time)
              </label>
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className="border rounded p-2 w-full"
                required
              />
            </div>
          </div>

          {/* 대상 호기 + Machine */}
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

          {/* 알람 코드 */}
          <div>
            <label className="block mb-1 font-medium">
              알람 코드(Alarm Code)
            </label>
            <textarea
              name="alarmCode"
              value={form.alarmCode}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white min-h-[80px]"
            />
          </div>

          {/* 현상 */}
          <div>
            <label className="block mb-1 font-medium">현상(Symptom)</label>
            <textarea
              name="symptom"
              value={form.symptom}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white min-h-[80px]"
            />
          </div>

          {/* 원인 */}
          <div>
            <label className="block mb-1 font-medium">원인(Cause)</label>
            <input
              name="reason"
              value={form.reason}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
            />
          </div>

          {/* 조치 내용 */}
          <div>
            <label className="block mb-1 font-medium">
              조치 내용(Action Detail)
            </label>
            <textarea
              name="actionDetail"
              value={form.actionDetail}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white min-h-[80px]"
            />
          </div>

          {/* 조치 인원 */}
          <div>
            <label className="block mb-1 font-medium">
              조치 인원(Person In Charge)
            </label>
            <textarea
              name="actioner"
              value={form.actioner}
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
            양식 생성하기(Generate Form)
          </button>

          {status === "error" && (
            <p className="text-red-600 text-sm mt-1">{errorMessage}(Error)</p>
          )}

          {successMessage && (
            <p className="mt-2 text-sm text-green-700">
              {successMessage} (Success)
            </p>
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
                ESST Alarm 조치 이력 Sheet 열기 (Open ESST Alarm Action History
                Sheet)
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
