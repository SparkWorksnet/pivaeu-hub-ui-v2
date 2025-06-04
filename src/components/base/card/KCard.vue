<script setup lang="ts">
import type { CardProps, CardSlots } from 'primevue/card'
import { computed, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const myProps = defineProps<
  CardProps & {
    borderless?: boolean
  }
>()
const mySlots = defineSlots<CardSlots>()

const resolvedAttrs = computed(() => ({ ...useAttrs(), ...myProps }))

</script>

<template>
  <div
    v-bind="resolvedAttrs"
    class="p-card p-component size-96 rounded-lg leading-7 border border-bg-divider bg-surface-0 dark:bg-surface-900 text-content dark:text-surface-0"
  >
    <div
      v-for="(_,slot) of mySlots"
      :key="slot"
      class="p-card-body p-6 text-center"
    >
      <slot :name="slot" />
    </div>
  </div>
</template>

<style scoped></style>