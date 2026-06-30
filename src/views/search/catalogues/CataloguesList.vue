<script setup lang="ts">
import SearchItems from '@/views/search/SearchItems.vue'
import CataloguesListItem from './CataloguesListItem.vue'

const props = defineProps<{
  catalogues: []
  getSearchResultsPagesCount: number
  isLoading: boolean
  isFetching: boolean
  showOnlyPublic: boolean
}>()
</script>

<template>
  <SearchItems
    :items="catalogues"
    :get-search-results-pages-count="getSearchResultsPagesCount"
    :is-loading="isLoading"
    :is-fetching="isFetching"
    :show-only-public="showOnlyPublic"
    container-class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
  >
    <template #default="{ item }">
      <CataloguesListItem
        :item="item"
      />
    </template>
  </SearchItems>
</template>
