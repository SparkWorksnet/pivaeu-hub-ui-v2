<script setup lang="ts">
import DataInfoCard from '@/components/base/data-info-box/DataInfoCard.vue'
import { computed, defineProps } from 'vue'
import { useSearchParams } from './useSearchParams'

const props = defineProps<{
  items: []
  getSearchResultsPagesCount: number
  isLoading: boolean
  isFetching: boolean
  showOnlyPublic: boolean
}>()

const searchParams = useSearchParams()
const currentPage = searchParams.queryParams.page
const itemsCount = computed(() => searchParams?.queryParams?.limit ?? 10)
const totalPages = computed(() => Math.ceil(props.getSearchResultsPagesCount) - 1)
const paginationRange = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const maxButtons = 5

  if (total <= maxButtons) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  let start = current - Math.floor(maxButtons / 2)
  let end = current + Math.floor(maxButtons / 2)
  
  if (start < 1) {
    start = 1 
    end = maxButtons
  } else if (end > total) {
    end = total
    start = total - maxButtons + 1 
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <template v-if="!isLoading && !isFetching">
      <slot v-for="item in items" :key="item.id" :item="item">
        <DataInfoCard
          :to="{ name: 'dataset-details', params: { datasetId: item.id } }"
          :title="item.title"
          :description="item.description"
          :file-formats="item.formats"
          :properties="item.summary"
        />
      </slot>
    </template>
    <template v-else>
      <div v-for="i in itemsCount.value" :key="i" class="flex size-full animate-pulse flex-col gap-6 bg-slate-200 text-content rounded-3xl">
        <div class="flex h-64 flex-wrap gap-2" />
      </div>
    </template>
  </div>
  <!-- Pagination -->
  <div class="grid w-full place-content-center">
    <nav class="rounded-sm">
      <div class="flex items-center justify-center flex-wrap px-4 py-2 rounded-xl bg-surface dark:bg-surface-800 text-primary dark:text-white/60">
        <button
          @click="goToPage(1)"
          class="px-4 py-2"
          :class="{
            'opacity-60' : currentPage === 1 
          }"
        >
          <i class="icon-[ph--caret-double-left] align-middle text-xs"></i>
        </button>

        <button
          @click="goToPage(currentPage - 1)"
          :class="{
            'opacity-60' : currentPage === 1 
          }"
          class="px-4 py-2"
        >
          <i class="icon-[ph--caret-left] align-middle text-xs"></i>
        </button>
        
        <button
          v-for="page in paginationRange"
          :key="page"
          @click="goToPage(page)"
          class=" inline-flex items-center justify-center border-0 rounded-full min-w-[3rem] h-12 m-[0.143rem]"
          :class="{
            'bg-primary text-white dark:text-surface-0 dark:bg-primary-400/30' : page === currentPage,
            'text-primary-700 dark:text-white/80 hover:bg-gray-hover' : page !== currentPage
          }"
        >
          {{ page }}
        </button>

        <button
          @click="goToPage(currentPage + 1)"
          class="px-4 py-2"
          :class="{
            'opacity-60' : currentPage === totalPages 
          }"
        >
          <i class="icon-[ph--caret-right] align-middle text-xs"></i>
        </button>
        
        <button
          @click="goToPage(totalPages)"
          class="px-4 py-2"
          :class="{
            'opacity-60' : currentPage === totalPages 
          }"
        >
          <i class="icon-[ph--caret-double-right] align-middle text-xs"></i>
        </button>
      </div>
    </nav>
  </div>
</template>