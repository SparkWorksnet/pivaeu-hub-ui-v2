<script setup lang="ts">
import { useCatalogueLogo } from '../../composables/useCatalogueLogo'

const props = defineProps<{ catalogueId: string }>()

const { logoUrl, flagCode, title } = useCatalogueLogo(() => props.catalogueId)
</script>

<template>
  <div v-if="logoUrl || flagCode" class="mb-6 mt-18 flex flex-col items-center gap-3 rounded-xl bg-surface p-4">
    <img
      v-if="logoUrl"
      :src="logoUrl"
      :alt="title"
      class="max-h-20 max-w-full object-contain"
      @error="logoUrl = null"
    />
    <img
      v-else-if="flagCode"
      :src="`https://flagcdn.com/w160/${flagCode}.png`"
      :alt="flagCode"
      class="max-h-16 w-full rounded object-cover shadow-sm"
    />
    <span v-if="title" class="text-center text-sm font-medium text-surface-text">{{ title }}</span>
  </div>
</template>
