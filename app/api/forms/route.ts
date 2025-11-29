// app/api/forms/route.ts
import { NextRequest, NextResponse } from "next/server";

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

// 스프레드시트 한 행의 형태
export interface FormRow {
  Timestamp?: string | Date;
  Line?: "2-1호기" | "2-2호기" | string;
  Machine?: string;
  AlarmCode?: string;
  Symptom?: string;
  Request?: string;
  Requester?: string;
  Action?: string;
  [key: string]: unknown;
}

interface AppsScriptGetResponse {
  status: "success" | "error";
  rows?: FormRow[];
  message?: string;
}

interface AppsScriptPostResponse {
  status: "success" | "error";
  message?: string;
}

/**
 * GET: 시트 데이터 조회
 */
export async function GET(_req: NextRequest) {
  // 1️⃣ env가 아예 없을 때도 HTML 에러 대신 JSON 반환
  if (!APPS_SCRIPT_URL) {
    return NextResponse.json(
      { status: "error", message: "APPS_SCRIPT_URL is not defined" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(APPS_SCRIPT_URL, { method: "GET" });

    const text = await res.text(); // Apps Script가 JSON string을 보내므로 먼저 text로 받자

    let data: AppsScriptGetResponse;
    try {
      data = JSON.parse(text) as AppsScriptGetResponse;
    } catch (e) {
      // 여전히 HTML이 온 경우 디버깅에 도움되는 메시지
      console.error(
        "Apps Script GET 응답이 JSON이 아닙니다:",
        text.slice(0, 200)
      );
      return NextResponse.json(
        {
          status: "error",
          message: "Apps Script GET returned non-JSON (로그 확인 필요)",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { status: "error", message: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * POST: 폼 데이터 저장
 */
export async function POST(req: NextRequest) {
  if (!APPS_SCRIPT_URL) {
    return NextResponse.json(
      { status: "error", message: "APPS_SCRIPT_URL is not defined" },
      { status: 500 }
    );
  }

  try {
    const body = (await req.json()) as Omit<FormRow, "Timestamp">;

    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    let data: AppsScriptPostResponse;
    try {
      data = JSON.parse(text) as AppsScriptPostResponse;
    } catch (e) {
      console.error(
        "Apps Script POST 응답이 JSON이 아닙니다:",
        text.slice(0, 200)
      );
      return NextResponse.json(
        {
          status: "error",
          message: "Apps Script POST returned non-JSON (로그 확인 필요)",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { status: "error", message: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
