"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import type { FormRow } from "@/app/api/forms/route";

type FormPayload = Omit<FormRow, "Timestamp"> & {
  line: string;
  machine: string;
  alarmCode?: string;
  symptom: string;
  request: string;
  requester: string;
  action: string;
};

type Status = null | "loading" | "success" | "error";

export default function NewFormPage() {
  const [form, setForm] = useState<FormPayload>({
    line: "2-1호기",
    machine: "TW",
    alarmCode: "",
    symptom: "",
    request: "",
    requester: "",
    action: "",
  });

  const validateForm = (form: FormPayload): string | null => {
    if (!form.line) return "호기를 선택해주세요.";
    if (!form.machine) return "Machine을 선택해주세요.";
    if (!form.alarmCode?.trim()) return "알람 코드를 입력해주세요.";
    if (!form.symptom.trim()) return "현상을 입력해주세요.";
    if (!form.request.trim()) return "요청사항을 입력해주세요.";
    if (!form.requester.trim()) return "요청자를 입력해주세요.";
    if (!form.action.trim()) return "조치사항을 입력해주세요.";
    return null;
  };

  const [status, setStatus] = useState<Status>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);
    setErrorMessage("");
    const validationError = validateForm(form);
    if (validationError) {
      setStatus("error");
      setErrorMessage(validationError);
      return;
    }

    setStatus("loading");

    try {
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

      // 폼 초기화
      setForm({
        line: "2-1호기",
        machine: "TW",
        alarmCode: "",
        symptom: "",
        request: "",
        requester: "",
        action: "",
      });
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message ?? "Unknown error");
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-start justify-center pt-16 px-4">
      {/* ⭐ 전체 화면을 flex로 중앙 배치 */}

      <div className="w-full max-w-2xl">
        {/* ⭐ 가운데 정렬된 내부 컨테이너 */}

        <h1 className="text-3xl font-bold mb-8 text-center">설비 요청 등록</h1>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-5 bg-white p-6 border rounded-xl shadow-sm"
        >
          {/* ⭐ 폼도 약간 카드처럼 만들어 깔끔하게 */}

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-medium">호기 (Line)</label>
              <select
                name="line"
                value={form.line}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
              >
                <option value="2-1호기">2-1호기</option>
                <option value="2-2호기">2-2호기</option>
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
            <div>
              <label className="block mb-1 font-medium">
                알람 코드 (Alarm Code)
              </label>
              <input
                name="alarmCode"
                value={form.alarmCode ?? ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
                placeholder=""
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">현상 (Symptom)</label>
            <textarea
              name="symptom"
              value={form.symptom}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white min-h-[80px]"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">요청사항 (Request)</label>
            <textarea
              name="request"
              value={form.request}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white min-h-[80px]"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">요청자 (Requester)</label>
            <input
              name="requester"
              value={form.requester}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">조치사항 (Action)</label>
            <textarea
              name="action"
              value={form.action}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white min-h-[80px]"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="
    px-4 py-2 rounded border border-gray-800 
    text-gray-900 font-medium
    bg-white 
    hover:bg-gray-900 hover:text-white
    transition-colors
    disabled:opacity-40
  "
          >
            {status === "loading" ? "전송 중..." : "등록하기"}
          </button>

          {status === "success" && (
            <p className="text-green-600 text-sm">성공적으로 저장되었습니다.</p>
          )}
          {status === "error" && (
            <p className="text-red-600 text-sm">{errorMessage}</p>
          )}
        </form>
      </div>
    </div>
  );
}
