/** 포스터·쇼케이스에서 "이 키워드/국가로 찾기"를 누르면 크리에이터 찾기 섹션이 필터를 적용하고 그 자리로 스크롤한다 */
export type FilterRequest = { country?: string; keyword?: string };

export const FILTER_EVENT = "onemore:filter";

export function requestFilter(detail: FilterRequest) {
  window.dispatchEvent(new CustomEvent<FilterRequest>(FILTER_EVENT, { detail }));
}
