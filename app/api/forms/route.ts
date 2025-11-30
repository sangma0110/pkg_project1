// app/api/forms/route.ts
import { NextRequest, NextResponse } from "next/server";

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

// 스프레드시트 한 행의 형태 (지금은 자유로운 key를 허용)
export interface FormRow {
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
 * Apps Script 가 HTML 안에 JSON을 감싸서 줄 수도 있으니,
 * 텍스트에서 실제 JSON 부분만 뽑아서 파싱하는 헬퍼
 */
function safeParseJson<T = any>(text: string): T | null {
  try {
    // 먼저 그냥 파싱 시도
    return JSON.parse(text) as T;
  } catch {
    // 실패하면, 가장 처음 { 와 마지막 } 사이만 잘라서 다시 시도
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first !== -1 && last !== -1 && last > first) {
      const possibleJson = text.slice(first, last + 1);
      try {
        return JSON.parse(possibleJson) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * GET: 시트 데이터 조회
 */
export async function GET(_req: NextRequest) {
  if (!APPS_SCRIPT_URL) {
    return NextResponse.json(
      { status: "error", message: "APPS_SCRIPT_URL is not defined" },
      { status: 500 }
    );
  }

  const url = APPS_SCRIPT_URL as string;

  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    const text = await res.text();

    const data = safeParseJson<AppsScriptGetResponse>(text);
    if (!data) {
      console.error("Apps Script GET raw response:", text.slice(0, 500));
      return NextResponse.json(
        {
          status: "error",
          message: "Apps Script GET 응답이 JSON 형식이 아닙니다.",
          raw: text.slice(0, 500), // 디버깅용으로 일부 동봉
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error("GET /api/forms error:", err);
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

  const url = APPS_SCRIPT_URL as string;

  try {
    const body = (await req.json()) as FormRow;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();

    const data = safeParseJson<AppsScriptPostResponse>(text);
    if (!data) {
      console.error("Apps Script POST raw response:", text.slice(0, 500));
      return NextResponse.json(
        {
          status: "error",
          message: "Apps Script POST 응답이 JSON 형식이 아닙니다.",
          raw: text.slice(0, 500),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error("POST /api/forms error:", err);
    return NextResponse.json(
      { status: "error", message: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
