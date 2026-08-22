<script setup lang="ts">
import { ConfigProvider, TooltipProvider } from "reka-ui";
import SiteBody from "./components/SiteBody.vue";
import { Toaster } from "~/components/ui/sonner";
</script>

<template>
  <SiteBody>
    <ConfigProvider>
      <TooltipProvider>
        <RunableLayout>
          <RunablePage />
        </RunableLayout>
      </TooltipProvider>
    </ConfigProvider>
    <Toaster :expand="true" />
  </SiteBody>
</template>
