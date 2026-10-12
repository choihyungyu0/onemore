/**
 * 워홀원모어 랜딩페이지 카피 — 전부 이 파일에서만 관리합니다.
 * 코드 파일을 건드리지 않고 문구만 바꾸려면 여기만 수정하세요.
 * 줄바꿈이 필요한 문장은 "\n"으로 표시합니다(컴포넌트가 줄 단위로 렌더링).
 */

export type Country = "호주" | "일본" | "캐나다" | "기타 국가";

export type Creator = {
  id: string;
  name: string;
  country: Country;
  city: string;
  platform: string;
  followers: number;
  tags: string[];
  bio: string;
  /** placeholder 색 블록 톤 인덱스 (0~5) */
  tone: number;
  /** images 맵의 키 */
  image: ImageKey;
};

export type SizeBand = { label: string; min: number; max: number | null };

import { generated } from "./images.generated";

export type SiteImage = { src: string; alt: string };

/** 슬롯 키로 생성 파일(images.generated.ts)의 경로를 읽고, alt는 여기서 관리 */
const img = (key: string, alt: string): SiteImage => ({
  src: generated[key]?.src ?? "",
  alt,
});

/**
 * 섹션별 이미지 — 경로를 바꾸려면 여기서 src를 직접 지정하거나
 * scripts/unsplash-download.mjs 로 public/images/ 를 다시 생성하세요.
 */
export const images = {
  "hero-01": img("hero-01", "거리에서 스마트폰으로 촬영하는 실루엣"),
  "hero-02": img("hero-02", "크림색 건물의 카페 창가"),
  "hero-03": img("hero-03", "여행지에서 삼각대에 올린 스마트폰"),
  "hero-04": img("hero-04", "카메라를 들고 촬영하는 뒷모습"),
  "stage-sky": img("stage-sky", "부드러운 구름이 떠 있는 밝은 하늘"),
  "country-01": img("country-01", "맑은 날의 시드니 항구"),
  "country-02": img("country-02", "낮의 도쿄 거리"),
  "country-03": img("country-03", "산이 보이는 밴쿠버 도심"),
  "country-04": img("country-04", "여름 유럽 구시가지 거리"),
  "show-01": img("show-01", "아침 햇살이 드는 창가에서 커피를 마시는 모습"),
  "show-02": img("show-02", "카페 창가에서 웃으며 이야기하는 친구들"),
  "show-03": img("show-03", "해안 도로를 달리는 여름 로드트립"),
  "show-04": img("show-04", "햇살 좋은 낯선 도시 거리를 걷는 모습"),
  "inset-01": img("inset-01", "돌기둥 아치 발코니에서 바다와 절벽을 내려다보는 뒷모습"),
  "card-sydney": img("card-sydney", "노을 진 시드니 하버 브리지 앞 부두"),
  "card-bondi": img("card-bondi", "노을 진 본다이 바다와 서퍼"),
  "card-melbourne": img("card-melbourne", "멜버른 골목길"),
  "card-brisbane": img("card-brisbane", "황금빛 브리즈번 스토리 브리지"),
  "card-perth": img("card-perth", "노을 진 퍼스 해변"),
  "card-goldcoast": img("card-goldcoast", "골드코스트 황금빛 파도의 서퍼"),
  "marquee-01": img("marquee-01", "플랫화이트 한 잔"),
  "marquee-02": img("marquee-02", "바구니에 담긴 채소"),
  "marquee-03": img("marquee-03", "멜버른 플린더스 역 앞 트램"),
  "marquee-04": img("marquee-04", "아침 창가에서 기지개 켜는 뒷모습"),
  "marquee-05": img("marquee-05", "도쿄 골목의 저녁 포장마차"),
  "marquee-06": img("marquee-06", "연기 피어오르는 길거리 꼬치구이"),
  "marquee-07": img("marquee-07", "해변 피크닉 한 상"),
  "marquee-08": img("marquee-08", "커피와 노트북"),
  "marquee-09": img("marquee-09", "황금빛 거리를 달리는 자전거"),
  "marquee-10": img("marquee-10", "노을 지는 발코니 실루엣"),
  "growth-01": img("growth-01", "따뜻한 빛의 링라이트"),
  "fit-01": img("fit-01", "손등에 바른 스킨케어 크림"),
  "fit-02": img("fit-02", "택배 상자를 여는 손"),
  "fit-03": img("fit-03", "카페 카운터 앞에 선 뒷모습"),
  "creator-01": img("creator-01", "카페에서 노트북과 라떼를 앞에 둔 손"),
  "final-01": img("final-01", "노을 진 시드니 하버"),
} satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof images;

/** 푸터 크레딧용 — 생성 파일의 촬영자 정보 */
export const imageCredits = generated;

export const brand = {
  name: "워홀원모어",
  latin: "ONE MORE",
  tagline: "해외 한국인 크리에이터 시딩·매칭",
  company: "주식회사 오엠엘",
};

/** 검색 결과·공유 미리보기 문구 (PDF 10장) */
export const seo = {
  title: "워홀원모어 | 해외 한국인 인플루언서 시딩·매칭",
  description:
    "해외에서 활동하는 한국인 크리에이터를 국가·콘텐츠 키워드·팔로워 규모별로 찾아보세요. 관심 후보를 선택하면 협업 제안을 연결합니다. 첫 시딩부터 메가를 향한 성장까지, 워홀원모어.",
  ogTitle: "첫 시딩부터, 메가를 향한 성장까지.",
  ogDescription: "해외 한국인 크리에이터를 찾고, 선택하고, 협업을 제안하세요.",
  /** 배포 도메인 확정 후 교체 */
  url: "https://onemore-seven.vercel.app",
};

/** 오프닝 인트로 (세션당 1회) */
export const intro = {
  label: "MESSAGE FROM ONE MORE",
  /** 세리프 이탤릭 줄 (영문) */
  serifLine: "From the first seeding to mega",
  /** 굵은 산세리프 줄 (한글) */
  sansLine: "첫 시딩부터, 메가를 향한 성장까지.",
  skip: "CLICK OR SCROLL TO SKIP",
};

export const nav = {
  links: [
    { label: "크리에이터 찾기", href: "#discover" },
    { label: "매칭 방식", href: "#how" },
    { label: "함께 성장하기", href: "#growth" },
    { label: "자주 묻는 질문", href: "#faq" },
  ],
  secondary: { label: "크리에이터로 참여하기", href: "#creators" },
  primary: { label: "캠페인 문의하기", href: "#campaign" },
};

export const hero = {
  eyebrow: "해외 한국인 크리에이터와 브랜드를 연결합니다.",
  title: "첫 시딩부터,\n메가를 향한\n성장까지.",
  description:
    "국가·콘텐츠 키워드·팔로워 규모로 해외 한국인 크리에이터를 찾아보세요.\n마음에 드는 크리에이터를 고르면, 워홀원모어가 협업 제안을 연결합니다.",
  primary: { label: "우리 브랜드와 맞는 크리에이터 찾기", href: "#discover" },
  secondary: { label: "캠페인 상담하기", href: "#campaign" },
  tagline: ["찾는 건 구체적으로.", "선택은 브랜드가.", "연결은 워홀원모어가."],
  /** 첫 화면 마퀴 한가운데 사진 인셋 (인트로의 사진이 날아와 안착) */
  insetImage: "inset-01" as ImageKey,
  /** 인트로 로더에서 차례로 열리는 사진(마지막은 insetImage) · 히어로 인셋 순환에도 사용 */
  insetFrames: ["card-perth", "marquee-04", "card-goldcoast", "hero-02"] as ImageKey[],
  /** 첫 화면을 가로지르는 거대 마퀴 문장 */
  marquee: "첫 시딩부터, 메가를 향한 성장까지.",
  /** 마퀴에서 코랄로 강조할 단어 */
  marqueeAccent: "메가",
  /** 버튼 아래 작은 필 */
  pill: "브랜드가 고르고, 크리에이터도 선택하는 협업",
  /** 첫 화면 하단 모서리 */
  cornerLeft: "워홀원모어® 2026",
  cornerRight: { label: "크리에이터 보기", href: "#discover" },
  flow: ["발견", "선택", "매칭", "성장"],
  /** 첫 화면 오른쪽에 떠 있는 콘텐츠 카드 4장 (4:5) */
  cards: [
    { image: "hero-01" as ImageKey, tone: 0, chip: "호주 · 시드니", tag: "#현지일상" },
    { image: "hero-02" as ImageKey, tone: 2, chip: "호주 · 멜버른", tag: "#카페" },
    { image: "hero-03" as ImageKey, tone: 4, chip: "호주 · 골드코스트", tag: "#여행" },
    { image: "hero-04" as ImageKey, tone: 1, chip: "호주 · 브리즈번", tag: "#워홀" },
  ],
};

/** 첫 화면이 축소되며 양옆에서 들어오는 포스터 카드 4장 — 콘텐츠 키워드 */
export const posters = [
  { tag: "#현지일상", keyword: "일상", title: "현지 일상", description: "일하고, 먹고, 쉬는\n보통의 하루", image: "marquee-04" as ImageKey, color: "ink" as const },
  { tag: "#카페", keyword: "카페", title: "카페", description: "동네 단골집과\n플랫화이트 한 잔", image: "marquee-01" as ImageKey, color: "coral" as const },
  { tag: "#여행", keyword: "여행", title: "여행", description: "주말 로드트립과\n바다", image: "card-goldcoast" as ImageKey, color: "forest" as const },
  { tag: "#워홀", keyword: "워홀", title: "워홀", description: "낯선 도시에서의\n첫 해 기록", image: "marquee-09" as ImageKey, color: "char" as const },
];

/** 콘텐츠 쇼케이스(핀 고정 슬라이드) — "어디서": 활동 국가별 현지 풍경. 포스터("무엇을")와 역할을 나눈다 */
export const showcase = {
  headline: "크리에이터가 현지에서 만드는 콘텐츠",
  hint: "(Scroll)",
  more: { label: "이 나라 크리에이터 찾기", href: "#discover" },
  slides: [
    { key: "au", title: "호주", country: "호주" as Country, description: "시드니·멜버른·브리즈번,\n워홀러의 하루가 시작되는 곳", image: "country-01" as ImageKey },
    { key: "jp", title: "일본", country: "일본" as Country, description: "도쿄·오사카의 거리와 카페,\n가까운 나라의 다른 하루", image: "country-02" as ImageKey },
    { key: "ca", title: "캐나다", country: "캐나다" as Country, description: "밴쿠버·토론토,\n유학과 워홀이 만나는 도시", image: "country-03" as ImageKey },
    { key: "etc", title: "유럽·그 외", country: "기타 국가" as Country, description: "유럽에서 동남아까지,\n새로 시작하는 도시들", image: "country-04" as ImageKey },
  ],
};

export const marquee = {
  label: "해외에서 활동하는 한국인 크리에이터 · 콘텐츠 예시",
  hashtags: [
    "#현지일상",
    "#카페",
    "#워홀",
    "#여행",
    "#뷰티",
    "#패션",
    "#푸드",
    "#유학",
    "#호주",
    "#일본",
    "#캐나다",
    "#브이로그",
  ],
  /** 흐르는 콘텐츠 타일 (4:5) */
  tiles: [
    { image: "marquee-01" as ImageKey, tone: 1, tag: "#카페" },
    { image: "marquee-02" as ImageKey, tone: 4, tag: "#현지일상" },
    { image: "marquee-03" as ImageKey, tone: 3, tag: "#멜버른" },
    { image: "marquee-04" as ImageKey, tone: 2, tag: "#일상" },
    { image: "marquee-05" as ImageKey, tone: 0, tag: "#푸드" },
    { image: "marquee-06" as ImageKey, tone: 5, tag: "#여행" },
    { image: "marquee-07" as ImageKey, tone: 1, tag: "#주말" },
    { image: "marquee-08" as ImageKey, tone: 3, tag: "#워홀" },
    { image: "marquee-09" as ImageKey, tone: 4, tag: "#출근길" },
    { image: "marquee-10" as ImageKey, tone: 2, tag: "#하루끝" },
  ],
};

export const sizeBands: SizeBand[] = [
  { label: "3천 이하", min: 0, max: 3000 },
  { label: "3천-1만", min: 3001, max: 10000 },
  { label: "1만-5만", min: 10001, max: 50000 },
  { label: "5만-10만", min: 50001, max: 100000 },
  { label: "10만 초과", min: 100001, max: null },
];

export const discover = {
  kicker: "크리에이터 찾기",
  title: "어느 나라에서, 어떤 이야기로\n우리 브랜드를 소개하고 싶으세요?",
  /** 제목에서 코랄 형광펜으로 강조할 구절 */
  titleAccent: "어떤 이야기로",
  description:
    "활동 국가를 고르고, 콘텐츠 키워드를 더하고,\n원하는 팔로워 규모로 후보를 좁혀보세요.",
  search: {
    label: "어떤 크리에이터를 찾고 계신가요?",
    placeholder: "예: 호주 일상, 일본 뷰티, 해외 카페, 워홀 브이로그",
    button: "크리에이터 찾아보기",
  },
  filters: {
    country: {
      label: "활동 국가",
      all: "전체",
      options: ["호주", "일본", "캐나다", "기타 국가"] as Country[],
    },
    keyword: {
      label: "콘텐츠 키워드",
      options: ["일상", "여행", "뷰티", "패션", "푸드", "카페", "워홀", "유학"],
    },
    size: { label: "팔로워 규모", all: "전체" },
  },
  results: {
    title: "우리 브랜드와 어울리는\n사람을 만나보세요.",
    description: "팔로워 수뿐 아니라, 어떤 이야기를 만드는지도 함께 살펴보세요.",
    exampleNote: "프로필 카드는 화면 설계용 가상 예시입니다.",
    count: "{n}명",
  },
  empty: {
    title: "아직 이 조건에 맞는\n크리에이터가 없어요.",
    description:
      "조건을 넓혀보세요. 찾는 조건을 남겨주시면 매칭 가능 여부를 확인해 드립니다.",
    reset: "검색 조건 초기화",
    inquire: { label: "원하는 조건으로 문의하기", href: "#campaign" },
  },
  card: {
    view: "프로필 보기",
    select: "선택하기",
    selected: "선택됨",
    deselect: "선택 해제",
    example: "예시 프로필",
    followers: "팔로워 {n}명",
  },
  /** 결과 보기 방식 전환 (데스크톱) */
  view: { label: "보기 방식", ring: "3D로 둘러보기", grid: "카드로 한번에 보기" },
  /** 3D 링(데스크톱 결과 보기) */
  ring: {
    label: "CURRENTLY ON ONE MORE",
    hint: "스크롤하거나 ← → 키로 돌려보세요. 정면 카드를 누르면 프로필이 열립니다.",
  },
  /** 프로필 상세 (모달) */
  detail: {
    title: "프로필 상세",
    rows: [
      { label: "기본 소개", key: "basic", description: "활동명, 활동 국가, 채널, 한 줄 소개" },
      { label: "콘텐츠 분야", key: "topics", description: "주요 키워드와 주로 다루는 주제" },
      { label: "채널 규모", key: "scale", description: "팔로워 수와 해당 수치의 확인 기준일" },
      { label: "콘텐츠 확인", key: "content", description: "공개 범위를 확인한 대표 콘텐츠 또는 원본 링크" },
      { label: "협업 관심 분야", key: "interest", description: "크리에이터가 직접 밝힌 관심 카테고리·협업 형식" },
    ],
    select: "이 크리에이터 선택하기",
    deselect: "선택 해제하기",
    close: "닫기",
    contentPlaceholder: "대표 콘텐츠 자리",
  },
  selection: {
    title: "관심 크리에이터 {n}명을 선택했어요.",
    description: "어떤 협업을 제안할지 알려주세요.",
    list: "선택 목록 보기",
    propose: { label: "선택한 크리에이터에게 협업 제안하기", href: "#campaign" },
    note: "후보 선택만으로 협업이 확정되지는 않습니다.\n크리에이터의 참여 의사와 협업 조건을 확인한 뒤 진행됩니다.",
    remove: "선택 해제",
    clear: "모두 해제",
  },
};

/** 화면 설계용 가상 예시 프로필 6개 — 실제 등록 크리에이터가 아닙니다. */
export const creators: Creator[] = [
  {
    id: "c01",
    name: "크리에이터 01",
    country: "호주",
    city: "시드니",
    platform: "Instagram",
    followers: 2800,
    tags: ["현지일상", "카페", "워홀"],
    bio: "시드니에서 일하고, 먹고, 쉬는 일상을 기록해요.",
    tone: 0,
    image: "card-sydney",
  },
  {
    id: "c02",
    name: "크리에이터 02",
    country: "호주",
    city: "본다이",
    platform: "Instagram",
    followers: 7400,
    tags: ["여행", "일상", "뷰티"],
    bio: "본다이 해변 아침 루틴과 선케어 이야기.",
    tone: 2,
    image: "card-bondi",
  },
  {
    id: "c03",
    name: "크리에이터 03",
    country: "기타 국가",
    city: "리스본",
    platform: "Instagram",
    followers: 15200,
    tags: ["카페", "여행", "일상"],
    bio: "리스본 골목 카페와 주말 여행을 기록해요.",
    tone: 4,
    image: "country-04",
  },
  {
    id: "c04",
    name: "크리에이터 04",
    country: "일본",
    city: "도쿄",
    platform: "Instagram",
    followers: 4100,
    tags: ["카페", "패션", "유학"],
    bio: "도쿄 유학생의 카페와 데일리 룩.",
    tone: 1,
    image: "country-02",
  },
  {
    id: "c05",
    name: "크리에이터 05",
    country: "캐나다",
    city: "밴쿠버",
    platform: "Instagram",
    followers: 62000,
    tags: ["워홀", "푸드", "일상"],
    bio: "밴쿠버 워홀러의 퇴근 후 산책과 저녁.",
    tone: 3,
    image: "country-03",
  },
  {
    id: "c06",
    name: "크리에이터 06",
    country: "호주",
    city: "골드코스트",
    platform: "Instagram",
    followers: 1900,
    tags: ["워홀", "여행", "일상"],
    bio: "골드코스트에서 서핑 배우는 워홀 첫 해 기록.",
    tone: 5,
    image: "card-goldcoast",
  },
];

export const how = {
  kicker: "매칭 방식",
  title: "마음에 드는 크리에이터를 고르세요.\n그다음 연결은 저희가 이어갑니다.",
  description:
    "처음부터 협업 상대를 확정할 필요는 없어요.\n관심 있는 후보와 원하는 캠페인 조건을 알려주세요.",
  steps: [
    {
      title: "찾아보기",
      description:
        "활동 국가, 콘텐츠 키워드, 팔로워 규모로\n브랜드와 어울리는 크리에이터를 살펴보세요.",
    },
    {
      title: "선택하기",
      description:
        "관심 있는 크리에이터를 여러 명 선택하세요.\n콘텐츠 스타일을 비교하며 후보를 모을 수 있어요.",
    },
    {
      title: "협업 제안하기",
      description:
        "소개할 제품이나 서비스, 원하는 콘텐츠,\n제공 조건과 희망 일정을 알려주세요.",
    },
    {
      title: "연결하기",
      description:
        "워홀원모어가 협업 제안을 전달하고,\n크리에이터의 참여 의사와 조건을 확인해 매칭을 진행합니다.",
    },
  ],
  statement: {
    title: "브랜드가 고르고,\n크리에이터도 선택하는 협업.",
    lead: "서로에게 맞는 연결을 지향합니다.",
    body: "연락처 명단이 아니라, 협업을 연결합니다.\n브랜드의 관심을 크리에이터에게 전달하고,\n서로의 조건을 확인한 다음 협업으로 이어갑니다.",
  },
};

export const growth = {
  kicker: "함께 성장하기",
  lead: "한 번의 시딩보다, 오래 이어질 관계를 생각합니다.",
  title: "유명해진 다음에만\n만나지 않습니다.\n시작하는 순간부터 함께합니다.",
  paragraphs: [
    "팔로워 3,000명 이하의 시작에도\n브랜드와 잘 어울리는 콘텐츠와 이야기는 있습니다.\n워홀원모어는 지금의 숫자만으로\n협업의 가능성을 정하지 않습니다.",
    "첫 시딩이 다음 협업으로,\n다음 협업이 오래 함께하는 관계로 이어지도록.\n초기 크리에이터부터 메가를 향한 성장까지,\n브랜드와 크리에이터 사이의 연결을 이어가고자 합니다.",
  ],
  stages: [
    {
      label: "처음의 발견",
      title: "콘텐츠와 가능성",
      description: "규모보다 먼저,\n콘텐츠와 가능성을 만납니다.",
    },
    {
      label: "첫 번째 협업",
      title: "함께하는 시작",
      description: "서로에게 맞는 조건으로\n함께 시작합니다.",
    },
    {
      label: "다음의 연결",
      title: "다시 만나는 관계",
      description: "잘 맞았던 만남이\n다음 협업으로 이어지길 바랍니다.",
    },
    {
      label: "함께하는 성장",
      title: "성장한 뒤에도",
      description: "크리에이터가 성장한 뒤에도,\n관계는 이어지도록.",
    },
  ],
  closing: "처음 함께한 브랜드가,\n성장한 뒤에도 함께하는 브랜드가 되도록.",
};

export const empathy = {
  kicker: "브랜드 공감",
  title: "이런 협업을\n찾고 있었다면.",
  description: "필요한 사람을 구체적으로 찾고,\n브랜드가 직접 선택하는 시딩·매칭입니다.",
  items: [
    {
      label: "해외 활동 크리에이터를 찾는 브랜드",
      quote: "해외에서 우리 제품을 소개할\n한국인 크리에이터가 필요해요.",
      description: "활동 국가와 콘텐츠 분야를 기준으로\n캠페인에 맞는 후보를 살펴보세요.",
    },
    {
      label: "콘텐츠의 적합성을 먼저 보는 브랜드",
      quote: "팔로워가 큰 사람보다,\n우리 제품과 잘 맞는 사람이 중요해요.",
      description:
        "원하는 규모 안에서 콘텐츠 주제와 스타일을 비교하고,\n브랜드가 직접 관심 후보를 선택하세요.",
    },
    {
      label: "다음 협업까지 생각하는 브랜드",
      quote: "한 번 협찬하고 끝나는 관계는\n아쉬워요.",
      description: "첫 협업을 출발점으로,\n다음에도 함께하고 싶은 크리에이터를 만나보세요.",
    },
  ],
  cta: { label: "우리 브랜드의 협업 상대 찾기", href: "#campaign" },
};

export const campaign = {
  kicker: "캠페인 신청",
  title: "어떤 브랜드를,\n어떤 크리에이터와 연결할까요?",
  description:
    "완성된 기획서가 없어도 괜찮아요. 지금 정해진 내용부터 알려주세요.\n선택한 후보가 있다면 함께 전달하고, 없다면 원하는 조건으로 문의할 수 있어요.",
  requiredBadge: "필수",
  fields: {
    brand: { label: "브랜드·회사명", placeholder: "어떤 브랜드의 협업인가요?" },
    manager: { label: "담당자명", placeholder: "담당자 성함을 알려주세요." },
    email: { label: "이메일", placeholder: "협업 안내를 받을 이메일을 입력해 주세요." },
    link: { label: "브랜드·제품 링크", placeholder: "홈페이지, 제품 페이지 또는 브랜드 SNS" },
    countries: {
      label: "희망 활동 국가",
      hint: "어떤 국가에서 활동하는 크리에이터를 찾으시나요?",
      options: ["호주", "일본", "캐나다", "기타 국가"] as Country[],
    },
    keywords: { label: "관심 콘텐츠 키워드", placeholder: "예: 뷰티, 여행, 카페, 현지 일상" },
    sizes: { label: "희망 팔로워 규모", hint: "여러 구간 선택 가능" },
    selected: {
      label: "선택한 크리에이터",
      hint: "탐색 화면에서 선택한 후보 자동 표시",
      empty: "아직 선택한 후보가 없어요. 탐색 화면에서 선택하면 여기에 표시됩니다.",
      browse: { label: "크리에이터 찾아보기", href: "#discover" },
    },
    overview: {
      label: "협업 개요",
      hint: "소개할 제품·서비스, 원하는 콘텐츠, 제안할 조건",
      placeholder:
        "호주에서 활동하는 일상·뷰티 크리에이터를 찾고 있습니다. 스킨케어 제품을 소개하고 싶으며, 희망 콘텐츠는 릴스입니다. 인원과 일정은 협의하고 싶습니다.",
    },
    schedule: {
      label: "희망 일정",
      placeholder: "미정이라면 ‘협의 가능’으로 남겨주세요.",
      negotiable: "협의 가능",
    },
    budget: {
      label: "예산",
      placeholder: "정해진 범위가 있다면 알려주세요.",
      undecided: "미정",
    },
  },
  submit: "크리에이터 매칭 요청하기",
  notes: [
    "요청 내용을 확인한 뒤 입력하신 이메일로 안내드립니다.",
    "신청만으로 결제되거나 협업이 확정되지는 않습니다.",
  ],
  success: {
    title: "협업 요청이 접수되었어요.",
    description:
      "보내주신 브랜드와 캠페인 내용을 확인한 뒤\n입력하신 이메일로 다음 단계를 안내드리겠습니다.",
    thanks: "좋은 연결의 시작을 함께해 주셔서 감사합니다.",
    browse: { label: "크리에이터 더 둘러보기", href: "#discover" },
    home: { label: "메인으로 돌아가기", href: "#top" },
  },
};

export const creatorJoin = {
  kicker: "크리에이터 참여",
  eyebrow: "해외에서 콘텐츠를 만드는 당신에게.",
  title: "팔로워가 더 많아지면\n시작하려고요?\n지금의 당신과 잘 맞는\n브랜드부터 만나보세요.",
  paragraphs: [
    "해외에서 활동하는 한국인 크리에이터라면,\n당신의 콘텐츠와 관심 분야를 알려주세요.",
    "팔로워 3,000명 이하의 시작부터\n메가를 향해 성장하는 여정까지.\n지금의 콘텐츠로 시작할 수 있는\n브랜드와의 연결을 함께 찾아갑니다.",
  ],
  /** 크리에이터 참여 신청 링크 확정 후 href 교체 */
  cta: { label: "크리에이터로 참여하기", href: "#creators" },
  note: "참여 신청이 모든 캠페인의 매칭을 보장하지는 않습니다.\n협업 제안을 확인한 뒤 참여 여부를 선택할 수 있습니다.",
};

export const faq = {
  kicker: "자주 묻는 질문",
  title: "문의하기 전에,\n궁금할 수 있는 것들.",
  items: [
    {
      q: "팔로워 3,000명 이하인 크리에이터만 찾을 수 있나요?",
      a: "아니요. 3,000명 이하부터 1만, 5만, 10만, 그 이상까지 원하는 규모로 후보를 살펴볼 수 있습니다. 실제 선택 가능한 후보는 활동 국가와 콘텐츠 분야에 따라 달라집니다.",
    },
    {
      q: "여러 명을 선택해서 한 번에 문의할 수 있나요?",
      a: "네. 관심 있는 크리에이터를 여러 명 선택한 뒤 캠페인 내용을 보내주세요. 각 크리에이터의 참여 의사와 조건을 확인하며 매칭을 진행합니다.",
    },
    {
      q: "크리에이터를 선택하면 바로 협업이 시작되나요?",
      a: "선택은 협업 제안을 위한 후보 지정입니다. 캠페인 내용과 제공 조건을 전달하고, 브랜드와 크리에이터가 진행 조건을 확인한 뒤 협업이 확정됩니다.",
    },
    {
      q: "제품 제공만으로도 협업할 수 있나요?",
      a: "제품 제공, 서비스 체험, 유료 콘텐츠 등 제안하는 조건과 크리에이터의 의사에 따라 달라집니다. 희망하는 협업 방식을 문의에 남겨주세요.",
    },
    {
      q: "아직 어떤 크리에이터가 필요한지 모르겠어요.",
      a: "후보를 선택하지 않고 문의하셔도 됩니다. 브랜드 소개, 희망 국가, 콘텐츠 분야와 캠페인 목적을 알려주시면 매칭 가능 여부를 확인해 드립니다.",
    },
    {
      q: "매칭과 협업 비용은 어떻게 확인하나요?",
      a: "캠페인 내용을 보내주시면 가능한 진행 방식과 비용을 안내드립니다. 구체적인 범위와 조건을 확인한 뒤 진행 여부를 결정할 수 있습니다.",
    },
    {
      q: "크리에이터 연락처를 바로 받을 수 있나요?",
      a: "연락처를 일괄 제공하는 방식이 아니라, 워홀원모어가 협업 제안을 전달하고 참여 의사를 확인하는 방식으로 연결합니다. 이후 진행에 필요한 정보는 확인된 범위에서 공유합니다.",
    },
  ],
};

export const finale = {
  title: "다음에 크게 성장할 크리에이터,\n우리 브랜드와 먼저 만나면\n어떨까요?",
  description:
    "해외에서 자신만의 이야기를 만드는 한국인 크리에이터.\n지금 브랜드와 잘 맞는 사람을 찾고, 첫 협업을 제안해 보세요.",
  tagline: "첫 시딩부터, 메가를 향한 성장까지.\n워홀원모어가 연결합니다.",
  primary: { label: "크리에이터 찾아보기", href: "#discover" },
  secondary: { label: "캠페인 문의하기", href: "#campaign" },
};

export const footer = {
  links: [
    { label: "서비스 문의", href: "#campaign" },
    { label: "크리에이터 참여", href: "#creators" },
    { label: "이용약관", href: "#" },
    { label: "개인정보처리방침", href: "#" },
  ],
  /** 확인된 실제 값으로 교체 후 공개 */
  company: {
    name: "주식회사 오엠엘",
    items: ["대표자명", "사업자등록번호", "사업장 소재지", "공식 문의 이메일"],
  },
};

export const mobileCta = {
  label: "캠페인 문의하기",
  href: "#campaign",
  secondary: { label: "크리에이터 참여", href: "#creators" },
};
