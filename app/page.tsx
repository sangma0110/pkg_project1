// app/page.tsx
"use client";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-black flex items-start justify-center pt-24 px-4">
      <div className="w-full max-w-3xl space-y-8">
        {/* 제목 / 소개 */}
        <section className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight">
            ESST PKG 관리 시스템
          </h1>
          <p className="text-sm text-gray-700">
            PKG 설비 관련{" "}
            <span className="font-medium">제어 · 알람 · 파손품 · 파라미터</span>{" "}
            요청을 등록하고 이력을 관리하기 위한 내부 시스템입니다.
          </p>
        </section>

        {/* 사용 방법 안내 */}
        <section className="bg-white rounded-xl space-y-4">
          <h2 className="text-xl font-semibold">관리자</h2>
          <div className="space-y-1 text-m text-gray-800">
            <p>ESST: 설비 기술팀 양세민 사원 / 공정 기술팀 김도우 선임</p>
            <p>PR: 이승원 선임 연구원 / 이상민 선임</p>
            <br />
          </div>

          <h2 className="text-xl font-semibold">
            ESST PKG 관리 시스템 사용 방법
          </h2>

          <p className="text-m text-gray-700">
            화면 상단 우측 메뉴에서{" "}
            <span className="font-medium">“신규 등록”</span> 또는{" "}
            <span className="font-medium">“요청 목록”</span>을 클릭하면 아래와
            같은 하위 항목이 펼쳐집니다.
          </p>

          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
            <li>제어</li>
            <li>알람</li>
            <li>파손품</li>
            <li>파라미터</li>
          </ul>

          <p className="text-m text-gray-700">
            각 항목을 선택하면 해당 유형에 대한 페이지로 이동합니다.
          </p>

          <ul className="text-m text-gray-700 list-disc pl-5 space-y-1">
            <li>
              <span className="font-medium">신규 등록 &gt; 항목 선택</span> :
              새로운 요청 사항을 등록할 때 사용합니다.
            </li>
            <li>
              <span className="font-medium">요청 목록 &gt; 항목 선택</span> :
              등록된 요청 이력과 진행 현황을 조회할 수 있습니다.
            </li>
          </ul>

          <p className="text-sm text-red-500">
            ※ 현장에서 즉시 조치가 필요한 사항을 제외한 모든 요청은 ESST PKG
            관리 Sheet 양식에 맞춰 등록해 주세요.
          </p>
        </section>
      </div>
    </main>
  );
}
