<script setup lang="ts">
import KButton from '@/components/base/button/KButton.vue'
import SearchInput from '@/components/search-input/SearchInput.vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  searchAction: Function
}>()

const { t } = useI18n()

const searchInput = defineModel<string>()
</script>

<template>
  <div class="mt-[5px] flex-none px-6 pt-8 pb-4">
    <section
      name="top"
      class="
        flex flex-col
        lg:pt-10
      "
    >
      <form
        class="flex gap-3"
        @submit.prevent="searchAction"
      >
        <SearchInput
          v-model="searchInput"
          class="w-full max-w-[50rem]"
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
