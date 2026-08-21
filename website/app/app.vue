<script setup lang="ts">
import { ConfigProvider, TooltipProvider } from "reka-ui";
import SiteBody from "./components/SiteBody.vue";
import { Toaster } from "~/components/ui/sonner";
</script>

<template>
  <SiteBody>
    <ConfigProvider>
      <TooltipProvider>
        <SyoraLayout>
          <div
            class="border-b text-foredeground px-4 py-1 text-center bg-background"
          >
            Syora is currently in alpha. APIs may evolve as we refine the
            framework toward its first stable release.
          </div>

          <SyoraPage />
        </SyoraLayout>
      </TooltipProvider>
    </ConfigProvider>
    <Toaster :expand="true" />
  </SiteBody>
</template>
