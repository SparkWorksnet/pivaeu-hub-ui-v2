<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import appConfig from '../../../config/appConfig'

const route  = useRoute()
const datasetId = route.params.datasetId

const measurements = ref([])
const loading  = ref(true)
const error    = ref(null)
const runTime  = ref(null)

/* ── RDF predicates ─────────────────────────────────────────────────── */
const DQV_HAS     = 'http://www.w3.org/ns/dqv#hasQualityMeasurement'
const DQV_MEAS_OF = 'http://www.w3.org/ns/dqv#isMeasurementOf'
const DQV_VALUE   = 'http://www.w3.org/ns/dqv#value'
const DCT_DATE    = 'http://purl.org/dc/terms/date'
const DCT_DESC    = 'http://purl.org/dc/terms/description'

/* ── Human-readable labels ──────────────────────────────────────────── */
const LABELS = {
  expect_table_row_count_to_be_between:         'Row Count',
  expect_table_column_count_to_be_between:       'Column Count',
  expect_table_columns_to_match_ordered_list:    'Column Order',
  expect_column_to_exist:                        'Column Exists',
  expect_column_values_to_not_be_null:           'No Null Values',
  expect_column_values_to_be_null:               'All Values Null',
  expect_column_values_to_be_of_type:            'Column Type',
  expect_column_values_to_be_in_set:             'Values In Set',
  expect_column_values_to_not_be_in_set:         'Values Not In Set',
  expect_column_values_to_be_between:            'Values In Range',
  expect_column_values_to_be_dateutil_parseable: 'Valid Dates',
}

function humanDetails(expType, descJson) {
  try {
    const r = JSON.parse(descJson)
    const fmt = n => Number(n).toLocaleString()
    switch (expType) {
      case 'expect_table_row_count_to_be_between': {
        let detail = `${fmt(r.observed_value)} rows found`
        if (r.min_value !== undefined) detail += ` (min: ${fmt(r.min_value)}`
        if (r.max_value !== undefined) detail += `, max: ${fmt(r.max_value)}`
        if (r.min_value !== undefined) detail += ')'
        return detail
      }
      case 'expect_column_to_exist':
        return ''
      default:
        if (r.unexpected_count !== undefined)
          return `${fmt(r.unexpected_count)} of ${fmt(r.element_count)} values failed (${Number(r.unexpected_percent).toFixed(1)}%)`
        if (r.observed_value !== undefined)
          return `Observed: ${r.observed_value}`
        return ''
    }
  } catch { return descJson || '' }
}

/* ── Fetch ──────────────────────────────────────────────────────────── */
async function fetchMeasurements() {
  try {
    const hubUrl = appConfig.piveauHubRepoUrl
    const r = await fetch(`${hubUrl}datasets/${datasetId}`, {
      headers: { Accept: 'application/ld+json' },
    })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const data = await r.json()
    const graph = data['@graph'] || []
    const dsNode = graph.find(n =>
      [].concat(n['@type'] || []).some(t => t.includes('Dataset'))
    )
    const raw = dsNode
      ? [].concat(dsNode[DQV_HAS] || dsNode['dqv:hasQualityMeasurement'] || [])
      : []

    runTime.value = raw.length
      ? ((raw[0][DCT_DATE] || raw[0]['dct:date'])?.['@value'] ?? null)
      : null

    measurements.value = raw.map(m => {
      const node = m['@id'] ? (graph.find(n => n['@id'] === m['@id']) || m) : m
      const measOf = node[DQV_MEAS_OF] || node['dqv:isMeasurementOf']
      const iri    = measOf?.['@id'] || ''
      const valNode = node[DQV_VALUE] || node['dqv:value']
      const val    = valNode?.['@value'] !== undefined ? valNode['@value'] : valNode
      const descNode = node[DCT_DESC] || node['dct:description']
      const desc   = descNode?.['@value'] || descNode || ''
      const expType = iri.split('#').pop() || iri
      let column = null
      try { column = JSON.parse(desc).column || null } catch {}
      return {
        expType,
        expectation: LABELS[expType] || expType.replace(/^expect_/, '').replace(/_/g, ' '),
        column,
        passing: val === true || val === 'true',
        details: humanDetails(expType, desc),
      }
    })
  } catch (e) {
    error.value = `Failed to load quality measurements: ${e.message}`
  } finally {
    loading.value = false
  }
}

/* ── Group by expectation type ──────────────────────────────────────── */
const grouped = computed(() => {
  const map = new Map()
  for (const m of measurements.value) {
    if (!map.has(m.expType)) map.set(m.expType, { label: m.expectation, items: [] })
    map.get(m.expType).items.push(m)
  }
  return Array.from(map.values())
})

function formatDate(d) {
  try { return new Date(d).toLocaleString() } catch { return d }
}

onMounted(fetchMeasurements)
</script>

<template>
  <div class="mt-4">
    <!-- Header -->
    <div class="mb-6">
      <h3 class="text-xl font-semibold text-gray-800 dark:text-white">
        Data Quality Measurements
      </h3>
      <p v-if="runTime" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Validated with Great Expectations — {{ formatDate(runTime) }}
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-gray-500 italic">Loading…</div>

    <!-- Error -->
    <div v-else-if="error" class="text-red-600 text-sm">{{ error }}</div>

    <!-- No data -->
    <div v-else-if="!measurements.length" class="text-gray-500 italic">
      No quality measurements available for this dataset.
    </div>

    <!-- Results -->
    <div v-else class="space-y-6">
      <div v-for="(group, i) in grouped" :key="i">
        <!-- Group label -->
        <div class="mb-3 border-b border-gray-200 pb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
          {{ group.label }}
        </div>

        <!-- Passing items: compact chips -->
        <div class="mb-3 flex flex-wrap gap-2">
          <span
            v-for="(m, j) in group.items.filter(m => m.passing)"
            :key="'p' + j"
            class="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-800"
          >
            <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            {{ m.column || m.details || m.expectation }}
          </span>
        </div>

        <!-- Failing items: expanded rows -->
        <div
          v-for="(m, j) in group.items.filter(m => !m.passing)"
          :key="'f' + j"
          class="mb-2 flex items-start gap-3 border-l-4 border-red-400 pl-3 py-1"
        >
          <svg class="mt-0.5 h-4 w-4 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div>
            <div class="text-sm font-medium text-gray-800 dark:text-white">
              {{ m.column || m.expectation }}
            </div>
            <div v-if="m.details" class="mt-0.5 text-xs text-gray-500">{{ m.details }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
