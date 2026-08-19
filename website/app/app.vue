<script setup lang="ts">
import { ConfigProvider, TooltipProvider } from "reka-ui";
import SiteBody from "./components/SiteBody.vue";
</script>

<template>
  <SiteBody>
    <ConfigProvider>
      <TooltipProvider>
        <SyoraLayout>
          <!-- <div class="dark bg-muted text-foreground px-4 py-1">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Placeat
            magni aliquam ducimus perferendis expedita. Error dolores
            voluptatibus dolorum ea perspiciatis, placeat consequuntur.
            Dignissimos nemo natus cum voluptatibus accusantium amet id.
          </div> -->

          <SyoraPage />
        </SyoraLayout>
      </TooltipProvider>
    </ConfigProvider>
  </SiteBody>
</template>
