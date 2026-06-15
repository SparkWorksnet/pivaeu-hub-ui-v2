<script setup lang="ts">
import { useDataTruncator } from '@/composables/useDataTruncator'
import DataQuality from '@/views/search/datasets/DataQuality.vue'

import { computed, ref, toValue } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import PhCaretLeft from '~icons/ph/caret-left'

import appConfig from '../../../config/appConfig'

import KButton from '../base/button/KButton.vue'

import LinkedDataSelector from '../base/links/LinkedDataSelector.vue'

import SummaryBox from '../base/summary-box/SummaryBox.vue'
import TabGroup from '../base/tab-group/TabGroup.vue'
import KTag from '../base/tag/KTag.vue'
import Typography from '../base/typography/Typography.vue'

import DistributionCard from '../distribution-card/DistributionCard.vue'

import DetailsPageHeader from './DetailsPageHeader.vue'

import { ToggleGroupItem, ToggleGroupRoot } from 'reka-ui'
import DatasetsOverview from './DatasetsOverview.vue'

const props = withDefaults(defineProps<{
  headline?: string
  title?: string
  subtitle?: string
  datasetId: string
  summary?: { title: string, text: string }[]
  descriptionMarkup?: string
  distributions?: any[]
  hideQuality?: boolean
}>(), {
  headline: 'Datensatz',
  distributions: () => [],
  hideQuality: false,
})

const { t } = useI18n()


const router = useRouter()
const route = useRoute()

const { data: truncatedDescription, toggle: toggleDescription, isTruncated: isDescriptionTruncated, isTruncationNeeded: isDescriptionTruncationNeeded } = useDataTruncator({
  data: computed(() => props.descriptionMarkup || ''),
  limit: 550,
})

const truncatedEllipsedDescription = computed(() => {
  if (toValue(isDescriptionTruncated)) {
    return `${truncatedDescription.value}...`
  }
  return truncatedDescription.value
})

// Distribution truncator ("show more")
const {
  data: truncatedFormattedDistributions,
  toggle: showAllDistributions,
  isTruncated: isDistributionsTruncated,
} = useDataTruncator({
  data: computed(() => props.distributions),
  limit: 7,
})

const isQualityPageAvailable = computed(() => !props.hideQuality && !!appConfig.piveauDataQualityUrl?.trim())

const showQualityPage = computed(() => route.name === 'dataset-details-quality')

const showBack = computed(() => {
  return !!router.options.history.state?.back
})

const value = ref<string>('overview')
</script>

<template>
  <div class="container mx-auto">
    <div class="mx-auto w-full space-y-6">
      <section name="dsd-header" class="flex flex-col gap-6">
        <div class="flex flex-col gap-6">
          <div class="flex justify-between">
            <div>
              <button v-if="showBack" class="mt-[14px] 2xl:-ml-[1.7em] cursor-pointer py-1" @click="router.back()">
                <Typography variant="paragraph-1" class="
                    flex items-center gap-2 text-primary
                    hover:text-primary-hover
                  ">
                  <PhCaretLeft />
                  <span>{{ t('details.back') }}</span>
                </Typography>
              </button>
            </div>
            <LinkedDataSelector :resource-id="datasetId" resource="datasets" class="mt-4" />
          </div>
          <div class="flex items-center justify-between">
            <DetailsPageHeader :headline="headline" :title="title" :subtitle="subtitle">
              <template #subtitle>
                <slot name="subtitle" :subtitle="subtitle">
                  <span>{{ subtitle }}</span>
                </slot>
              </template>
            </DetailsPageHeader>
            <!-- <KButton v-if="isQualityPageAvailable" size="small" @click="showQualityPage = !showQualityPage">
              {{ showQualityPage ? t('details.overview') : t('details.quality') }}
            </KButton> -->
            <div v-if="isQualityPageAvailable">
              <ToggleGroupRoot type="single" :rovingFocus="false"
                :model-value="showQualityPage ? 'quality' : 'overview'" @update:model-value="(newValue) => {
                  if (newValue === 'quality') {
                    router.push({ name: 'dataset-details-quality', params: { datasetId: props.datasetId } })
                  } else {
                    router.push({ name: 'dataset-details', params: { datasetId: props.datasetId } })
                  }
                }"
                class="inline-flex flex-col sm:flex-row rounded-3xl border border-gray-200 w-full sm:w-auto items-center"
                aria-label="Page view">
                <ToggleGroupItem value="overview" role="tab" :aria-selected="!showQualityPage" class="w-full sm:w-auto h-8 px-4 py-2 text-sm font-medium
                        flex items-center justify-center
                        border-b sm:border-b-0 sm:border-r border-gray-200
                        rounded-t-3xl sm:rounded-t-none sm:rounded-l-3xl
                        bg-white text-gray-700
                        hover:bg-gray-50
                        data-[state=on]:bg-primary
                        data-[state=on]:text-white
                        focus:outline-none
                        focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0
                        focus-visible:z-10">
                  {{ t('details.overview') }}
                </ToggleGroupItem>
                <ToggleGroupItem value="quality" role="tab" :aria-selected="showQualityPage" class="w-full sm:w-auto h-8 px-4 py-2 text-sm font-medium
                        flex items-center justify-center
                        rounded-r-3xl
                        bg-white text-gray-700
                        hover:bg-gray-50
                        data-[state=on]:bg-primary
                        data-[state=on]:text-white
                        focus:outline-none
                        focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-0
                        focus-visible:z-10">
                  {{ t('details.quality') }}
                </ToggleGroupItem>
              </ToggleGroupRoot>
            </div>
          </div>
        </div>
        <slot name="metadata">
          <div class="
              flex flex-col justify-between
              md:flex-row
            ">
            <SummaryBox v-for="(s, i) in summary" :key="i" class="mr-4 mb-4 flex-1" :title="s.title"
              :text="s.text || '-'" />
          </div>
        </slot>
      </section>
      <div>
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>