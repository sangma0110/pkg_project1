// app/api/forms/route.ts
import { NextRequest, NextResponse } from "next/server";

// 시트 타입별 Apps Script URL 매핑
const SHEET_URLS: Record<string, string | undefined> = {
  control: process.env.APPS_SCRIPT_URL_CONTROL,
  alarm: process.env.APPS_SCRIPT_URL_ALARM,
  damaged: process.env.APPS_SCRIPT_URL_DAMAGED,
  param: process.env.APPS_SCRIPT_URL_PARAM,
};

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
    return JSON.parse(text) as T;
  } catch {
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

// 공통: type 에 맞는 URL 얻기
function getSheetUrl(type: string): string | null {
  const url = SHEET_URLS[type];
  return url ?? null;
}

/**
 * GET: 시트 데이터 조회
 * /api/forms?type=control|alarm|damaged|param
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "control"; // 기본값: control

  const url = getSheetUrl(type);
  if (!url) {
    return NextResponse.json(
      {
        status: "error",
        message: `Unknown or unset sheet type: "${type}"`,
      },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    const text = await res.text();
    const data = safeParseJson<AppsScriptGetResponse>(text);

    if (!data) {
      console.error(
        `Apps Script GET raw response (${type}):`,
        text.slice(0, 500)
      );
      return NextResponse.json(
        {
          status: "error",
          message: "Apps Script GET 응답이 JSON 형식이 아닙니다.",
          raw: text.slice(0, 500),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error(`GET /api/forms?type=${type} error:`, err);
    return NextResponse.json(
      { status: "error", message: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * POST: 폼 데이터 저장
 * /api/forms?type=control|alarm|damaged|param
 */
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "control";

  const url = getSheetUrl(type);
  if (!url) {
    return NextResponse.json(
      {
        status: "error",
        message: `Unknown or unset sheet type: "${type}"`,
      },
      { status: 400 }
    );
  }

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
      console.error(
        `Apps Script POST raw response (${type}):`,
        text.slice(0, 500)
      );
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
    console.error(`POST /api/forms?type=${type} error:`, err);
    return NextResponse.json(
      { status: "error", message: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
