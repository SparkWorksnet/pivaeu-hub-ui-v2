<script setup lang="ts">
import KTag from '../base/tag/KTag.vue'

const props = defineProps<{
  idName: string
  groupName?: string
  label?: string
}>()

const emit = defineEmits<{
  click: [id: string]
}>()
</script>

<template>
  <button
    tabindex="-1"
    class="max-w-full min-w-0"
    @click="emit('click', props.idName)"
  >
    <KTag removable>
      <slot>{{ props.label }}</slot>
    </KTag>
  </button>
</template>
