<script setup lang="ts">
import KButton from '@/components/base/button/KButton.vue'
import SearchInput from '@/components/search-input/SearchInput.vue'
import { useI18n } from 'vue-i18n'

defineProps<{
  searchAction: ((payload: Event) => void) | undefined
}>()

const { t } = useI18n()

const searchInput = defineModel<string>()
</script>

<template>
  <div class="flex-none pb-2 md:pt-8 md:pb-4">
    <section
      name="top"
      class="
        flex flex-col
        md:pt-10
      "
    >
      <form
        class="flex gap-3"
        @submit.prevent="searchAction"
      >
        <SearchInput
          v-model="searchInput"
          class="w-full"
          :placeholder="t('search.searchBarPlaceholder')"
          :select-options="[]"
        />
        <KButton
          type="submit"
        >
          {{ t('search.submitButton') }}
        </KButton>
      </form>
    </section>
  </div>
</template>
