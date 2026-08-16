import { ref } from "vue";

const errorCode = ref<number | null>(null);

export function useAppError() {
  function setError(code: number) {
    errorCode.value = code;
  }

  function clearError() {
    errorCode.value = null;
  }

  return { errorCode, setError, clearError };
}
