<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  clearError,
  getError,
  type ErrorRecord,
} from "@/services/errorCapture";
import { definePageMeta } from "../globals/router";

definePageMeta({ name: "NotFound" });

const router = useRouter();

const error = ref<ErrorRecord | null>(null);

onMounted(() => {
  error.value = getError();
});

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString("en-US");
}

function goHome(): void {
  clearError();
  void router.push("/");
}

function clear(): void {
  clearError();
  error.value = null;
}
</script>

<template>
  <div class="error-page">
    <div class="error-container">
      <!-- 404 -->
      <template v-if="!error">
        <div class="not-found">
          <span class="error-code">404</span>

          <h1>Page Not Found</h1>

          <p class="subtitle">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
      </template>

      <!-- Application error -->
      <template v-else>
        <div class="error-card">
          <div class="error-header">
            <span class="error-code">
              {{ error.code }}
            </span>

            <span class="error-time">
              {{ formatTime(error.timestamp) }}
            </span>

            <span v-if="error.info" class="error-context">
              {{ error.info }}
            </span>
          </div>

          <p class="error-message">
            {{ error.message }}
          </p>

          <details v-if="error.stack">
            <summary>Stack Trace</summary>

            <pre>{{ error.stack }}</pre>
          </details>
        </div>
      </template>

      <div class="actions">
        <button class="btn-primary" @click="goHome">Back to Home</button>

        <button v-if="error" class="btn-ghost" @click="clear">
          Clear Error
        </button>
      </div>
    </div>
  </div>
</template>
