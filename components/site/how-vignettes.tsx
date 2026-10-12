import { Check, Plus, Search, Send } from "lucide-react";
import { creators, discover, images } from "@/content/landing";
import { cn } from "@/lib/utils";
import { Placeholder } from "./placeholder";

/**
 * 매칭 4단계 비네트 — 실제 서비스 UI를 축소한 삽화 카드.
 * 숫자·설명만으로는 과정이 보이지 않아, 단계마다 "브랜드가 보게 될 화면"을 보여준다.
 * [data-pop] 요소는 단계가 켜질 때 차례로 떠오른다(how-scrub.tsx 타임라인).
 */

const sample = creators.slice(0, 3);

function Chip({ on, children }: { on?: boolean; children: React.ReactNode }) {
  return (
    <span
      data-pop
      className={cn(
        "inline-flex h-7 items-center rounded-full px-2.5 text-[11.5px] font-semibold",
        on ? "bg-ink text-white" : "bg-white text-ink/70 ring-1 ring-inset ring-ink/12"
      )}
    >
      {children}
    </span>
  );
}

function MiniCard({ i, selected, mark }: { i: number; selected?: boolean; mark?: boolean }) {
  const c = sample[i];
  const im = images[c.image];
  return (
    <div
      data-pop
      className={cn(
        "relative overflow-hidden rounded-[12px] bg-white ring-1 ring-ink/[0.06]",
        selected && "ring-2 ring-brand"
      )}
    >
      <Placeholder ratio="4/5" tone={c.tone} src={im.src} alt="" sizes="160px" />
      <div className="px-2.5 py-2">
        <p className="text-[11.5px] font-bold tracking-tight">{c.name}</p>
        <p className="text-[10px] text-muted">{discover.card.followers.replace("{n}", c.followers.toLocaleString("ko-KR"))}</p>
      </div>
      {mark && (
        <span
          className={cn(
            "absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full",
            selected ? "bg-brand text-white" : "bg-white/90 text-ink"
          )}
        >
          {selected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
        </span>
      )}
    </div>
  );
}

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="relative flex h-full flex-col rounded-[22px] bg-white p-5 shadow-lift ring-1 ring-ink/[0.05]">
      <div className="mb-4 flex items-center justify-between">
        <span className="kicker text-[10px] text-ink/50">{label}</span>
        <span className="rounded-full bg-mist px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-[0.14em] text-ink/50">
          {discover.card.example}
        </span>
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}

/** 01 찾아보기 — 검색창·필터·후보 */
export function VignetteSearch() {
  return (
    <Frame label="FIND">
      <div data-pop className="flex items-center gap-2 rounded-full bg-mist px-3 py-2">
        <Search className="h-3.5 w-3.5 text-muted" />
        <span className="flex-1 text-[12px] text-ink/80">호주 카페 브이로그</span>
        <span className="rounded-full bg-ink px-2.5 py-1 text-[10.5px] font-semibold text-white">찾기</span>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="w-16 text-[10.5px] font-semibold text-muted">활동 국가</span>
          <Chip on>호주</Chip>
          <Chip>일본</Chip>
          <Chip>캐나다</Chip>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="w-16 text-[10.5px] font-semibold text-muted">키워드</span>
          <Chip on>카페</Chip>
          <Chip on>일상</Chip>
          <Chip>여행</Chip>
          <Chip>뷰티</Chip>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="w-16 text-[10.5px] font-semibold text-muted">팔로워</span>
          <Chip>3천 이하</Chip>
          <Chip on>3천-1만</Chip>
          <Chip>1만-5만</Chip>
        </div>
      </div>
      <div className="mt-auto grid grid-cols-3 gap-2.5 pt-4">
        <MiniCard i={0} />
        <MiniCard i={1} />
        <MiniCard i={2} />
      </div>
    </Frame>
  );
}

/** 02 선택하기 — 여러 명 선택과 하단 선택 바 */
export function VignetteSelect() {
  return (
    <Frame label="SELECT">
      <div className="grid grid-cols-3 gap-2.5">
        <MiniCard i={0} selected mark />
        <MiniCard i={1} mark />
        <MiniCard i={2} selected mark />
      </div>
      <div data-pop className="mt-auto flex items-center justify-between rounded-[14px] bg-ink px-4 py-3 text-white">
        <div>
          <p className="text-[12.5px] font-bold">2명 선택됨</p>
          <p className="text-[10.5px] text-white/60">선택한 크리에이터에게 함께 제안할 수 있어요</p>
        </div>
        <span className="rounded-full bg-brand px-3 py-1.5 text-[11px] font-semibold">협업 제안하기</span>
      </div>
    </Frame>
  );
}

/** 03 협업 제안하기 — 제안 폼 */
export function VignettePropose() {
  const rows = [
    ["소개할 제품·서비스", "비건 스킨케어 신제품"],
    ["원하는 콘텐츠", "릴스 1편 + 스토리 2회"],
    ["제공 조건", "제품 제공 + 원고료 협의"],
    ["희망 일정", "11월 첫째 주"],
  ];
  return (
    <Frame label="PROPOSE">
      <dl className="divide-y divide-line">
        {rows.map(([k, v]) => (
          <div key={k} data-pop className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[11px] font-semibold text-muted">{k}</dt>
            <dd className="rounded-[8px] bg-mist px-2.5 py-1 text-[11.5px] font-semibold text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      <div data-pop className="mt-auto flex items-center justify-end gap-2 pt-4">
        <span className="text-[10.5px] text-muted">선택한 2명에게 전달</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[11.5px] font-semibold text-white">
          제안 보내기 <Send className="h-3 w-3" />
        </span>
      </div>
    </Frame>
  );
}

/** 04 연결하기 — 전달·확인·매칭 상태 */
export function VignetteConnect() {
  const c = sample[0];
  const im = images[c.image];
  const steps: [string, "done" | "now" | "todo"][] = [
    ["협업 제안 전달", "done"],
    ["크리에이터 참여 의사 확인", "done"],
    ["조건 확인", "now"],
    ["매칭 완료", "todo"],
  ];
  return (
    <Frame label="CONNECT">
      <div data-pop className="flex items-center justify-center gap-4 py-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-brand font-display text-[14px] font-extrabold text-white">
          +1
        </span>
        <span className="relative h-px w-16 bg-ink/15">
          <span className="connect-dot absolute -top-[3px] left-0 h-[7px] w-[7px] rounded-full bg-brand" />
        </span>
        <span className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-white shadow-card">
          <Placeholder fill tone={c.tone} src={im.src} alt="" sizes="48px" />
        </span>
      </div>
      <ol className="mt-3 flex flex-col gap-2">
        {steps.map(([label, st]) => (
          <li key={label} data-pop className="flex items-center gap-3 rounded-[12px] bg-mist px-3 py-2.5">
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full",
                st === "done" && "bg-ink text-white",
                st === "now" && "bg-brand text-white",
                st === "todo" && "ring-1 ring-ink/20"
              )}
            >
              {st === "done" && <Check className="h-3 w-3" />}
              {st === "now" && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
            </span>
            <span className={cn("text-[12px] font-semibold", st === "todo" ? "text-muted" : "text-ink")}>{label}</span>
            {st === "now" && <span className="ml-auto text-[10px] font-semibold text-brand">진행 중</span>}
          </li>
        ))}
      </ol>
    </Frame>
  );
}

export const VIGNETTES = [VignetteSearch, VignetteSelect, VignettePropose, VignetteConnect];

export function Vignette({ step, className }: { step: number; className?: string }) {
  const V = VIGNETTES[step] ?? VignetteSearch;
  return (
    <div className={cn("h-full", className)}>
      <V />
    </div>
  );
}
