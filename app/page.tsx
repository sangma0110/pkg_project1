// app/page.tsx
"use client";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black flex items-start justify-center pt-24 px-4">
      <div className="w-full max-w-3xl space-y-8">
        {/* 제목 / 소개 */}
        <section className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight">
            ESST PKG 관리 시스템 (ESST PKG Management System)
          </h1>
          <p className="text-sm text-gray-700">
            PKG 설비 관련{" "}
            <span className="font-medium">제어 · 알람 · 파손품 · 파라미터</span>{" "}
            요청을 등록하고 이력을 관리하기 위한 내부 시스템입니다.
            <br />
            (This internal system is used to register and manage history for
            Control, Alarm, Damaged Items, and Parameter requests related to PKG
            equipment.)
          </p>
        </section>

        {/* 사용 방법 안내 */}
        <section className="bg-white rounded-xl space-y-4">
          <h2 className="text-xl font-semibold">관리자 (Administrators)</h2>

          <div className="space-y-1 text-m text-gray-800">
            <p>
              ESST: 설비 기술팀 양세민 사원 / 공정 기술팀 김도우 선임 (ESST:
              Semin Yang / Dowoo Kim)
            </p>
            <p>
              PRI: 이승원 선임 연구원 / 이상민 선임 (PRI: Seungwon Lee/ Sangmin
              Lee)
            </p>
            <br />
          </div>

          <h2 className="text-xl font-semibold">
            ESST PKG 관리 시스템 사용 방법 (How to Use the ESST PKG Management
            System)
          </h2>

          <p className="text-m text-gray-700">
            화면 상단 우측 메뉴에서{" "}
            <span className="font-medium">“신규 등록” (New Request)</span> 또는{" "}
            <span className="font-medium">“요청 목록” (Request List)</span>을
            클릭하면 아래와 같은 하위 항목이 펼쳐집니다. (Selecting these will
            expand the following sub-categories.)
          </p>

          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
            <li>제어 (Control)</li>
            <li>알람 (Alarm)</li>
            <li>파손품 (Damaged Items)</li>
            <li>파라미터 (Parameters)</li>
          </ul>

          <p className="text-m text-gray-700">
            각 항목을 선택하면 해당 유형에 대한 페이지로 이동합니다. (Selecting
            each item will take you to its corresponding page.)
          </p>

          <ul className="text-m text-gray-700 list-disc pl-5 space-y-1">
            <li>
              <span className="font-medium">
                신규 등록 &gt; 항목 선택 (New Request &gt; Select Category)
              </span>{" "}
              : 새로운 요청 사항을 등록할 때 사용합니다.
              <br />
              (Used to register new requests.)
            </li>
            <li>
              <span className="font-medium">
                요청 목록 &gt; 항목 선택 (Request List &gt; Select Category)
              </span>{" "}
              : 등록된 요청 이력과 진행 현황을 조회할 수 있습니다.
              <br />
              (Used to check registered request history and progress.)
            </li>
          </ul>

          <p className="text-sm text-red-500">
            ※ 현장에서 즉시 조치가 필요한 사항을 제외한 모든 요청은 ESST PKG
            관리 Sheet 양식에 맞춰 등록해 주세요. (※ All requests, except those
            requiring immediate on-site action, must be registered using the
            ESST PKG management sheet format.)
          </p>
        </section>
      </div>
    </main>
  );
}
