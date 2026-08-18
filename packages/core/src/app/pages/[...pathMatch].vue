<script setup lang="ts">
import { useRouter } from "vue-router";
import { definePageMeta } from "../globals/router-page-meta.js";

definePageMeta({ name: "NotFound" });

const router = useRouter();

function goHome(): void {
  void router.push("/");
}
</script>

<template>
  <div class="error-page">
    <div class="error-container">
      <div class="not-found">
        <span class="error-code">404</span>

        <h1>Page Not Found</h1>

        <p class="subtitle">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <div class="actions">
        <button class="btn-primary" @click="goHome">Back to Home</button>

      </div>
    </div>
  </div>
</template>
