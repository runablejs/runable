import { ofetch } from "ofetch";

export const $fetch = ofetch;

export function useFetch() {
  return $fetch;
}
