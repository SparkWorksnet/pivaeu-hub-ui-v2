<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import appConfig from '../../../config/appConfig'

const route = useRoute()
const datasetId = route.params.datasetId as string

const DALI        = 'https://dali-project.eu/ns#'
const DCAT_EP_URL = 'http://www.w3.org/ns/dcat#endpointURL'

console.log('[ServiceBanner] component setup running, datasetId:', datasetId)
const serviceData = ref<Record<string, string>>({})
const loaded = ref(false)

const SERVICE_TYPE_COLOURS: Record<string, { bg: string, text: string, border: string }> = {
  QualityCheck:          { bg: 'bg-green-50',  text: 'text-green-800',  border: 'border-green-200'  },
  Transformation:        { bg: 'bg-blue-50',   text: 'text-blue-800',   border: 'border-blue-200'   },
  Augmentation:          { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  Aggregation:           { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
  Anonymisation:         { bg: 'bg-pink-50',   text: 'text-pink-800',   border: 'border-pink-200'   },
  'Feature Engineering': { bg: 'bg-teal-50',   text: 'text-teal-800',   border: 'border-teal-200'   },
}

function typeStyle(type: string) {
  return SERVICE_TYPE_COLOURS[type] || { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' }
}

function getString(node: any, key: string): string {
  const val = node[`${DALI}${key}`]
  if (!val) return ''
  const first = Array.isArray(val) ? val[0] : val
  return first?.['@value'] || first?.['@id'] || String(first) || ''
}

onMounted(async () => {
  try {
    const hubUrl = (appConfig as any).piveauHubRepoUrl
    const url = `${hubUrl}datasets/${datasetId}`
    console.log('[ServiceBanner] fetching', url)
    const r = await fetch(url, {
      headers: { Accept: 'application/ld+json' },
    })
    console.log('[ServiceBanner] status', r.status)
    if (!r.ok) return
    const data = await r.json()
    const graph: any[] = data['@graph'] || []
    console.log('[ServiceBanner] types in graph:', graph.map(n => n['@type']))
    const node = graph.find(n =>
      [].concat(n['@type'] || []).some((t: string) => t.includes('DataService'))
    )
    console.log('[ServiceBanner] DataService node found:', !!node)
    if (!node) return

    const endpointArr = [].concat(node[DCAT_EP_URL] || [])
    serviceData.value = {
      serviceType:  getString(node, 'serviceType'),
      framework:    getString(node, 'framework'),
      inputFormat:  getString(node, 'inputFormat'),
      outputFormat: getString(node, 'outputFormat'),
      taskModule:   getString(node, 'taskModule'),
      taskFunction: getString(node, 'taskFunction'),
      endpointUrl:  (endpointArr[0] as any)?.['@id'] || '',
    }
    loaded.value = true
  } catch { /* silent */ }
})
</script>

<template>
  <div v-if="loaded" class="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 p-5">
    <!-- Header -->
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <span class="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
        <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>
        </svg>
        Data Processing Service
      </span>
      <span
        v-if="serviceData.serviceType"
        :class="[
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
          typeStyle(serviceData.serviceType).bg,
          typeStyle(serviceData.serviceType).text,
          typeStyle(serviceData.serviceType).border,
        ]"
      >
        {{ serviceData.serviceType }}
      </span>
    </div>

    <!-- Properties grid -->
    <div class="grid grid-cols-2 gap-x-8 gap-y-3 text-sm md:grid-cols-3">
      <div v-if="serviceData.framework">
        <div class="text-xs font-medium text-indigo-400 uppercase tracking-wider">Framework</div>
        <div class="mt-0.5 font-medium text-gray-800">{{ serviceData.framework }}</div>
      </div>
      <div v-if="serviceData.inputFormat">
        <div class="text-xs font-medium text-indigo-400 uppercase tracking-wider">Input Format</div>
        <div class="mt-0.5"><code class="rounded bg-white px-1.5 py-0.5 text-xs text-gray-700">{{ serviceData.inputFormat }}</code></div>
      </div>
      <div v-if="serviceData.outputFormat">
        <div class="text-xs font-medium text-indigo-400 uppercase tracking-wider">Output Format</div>
        <div class="mt-0.5"><code class="rounded bg-white px-1.5 py-0.5 text-xs text-gray-700">{{ serviceData.outputFormat }}</code></div>
      </div>
      <div v-if="serviceData.taskModule">
        <div class="text-xs font-medium text-indigo-400 uppercase tracking-wider">Module</div>
        <div class="mt-0.5">
          <code class="rounded bg-white px-1.5 py-0.5 text-xs text-gray-700">{{ serviceData.taskModule }}</code>
          <span v-if="serviceData.taskFunction" class="ml-1 text-xs text-gray-500">· {{ serviceData.taskFunction }}()</span>
        </div>
      </div>
      <div v-if="serviceData.endpointUrl" class="col-span-2 md:col-span-3">
        <div class="text-xs font-medium text-indigo-400 uppercase tracking-wider">Endpoint</div>
        <a :href="serviceData.endpointUrl" target="_blank" rel="noopener"
           class="mt-0.5 block truncate text-xs text-indigo-600 hover:underline">
          {{ serviceData.endpointUrl }}
        </a>
      </div>
    </div>
  </div>
</template>
