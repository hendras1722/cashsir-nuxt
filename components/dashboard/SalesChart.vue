<script setup lang="ts">
const chartOptions = ref({
  chart: {
    id: 'sales-chart',
    toolbar: { show: false },
    sparkline: { enabled: false },
  },
  colors: ['#3b82f6'],
  xaxis: {
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.3,
    },
  },
  dataLabels: { enabled: false },
})

const series = ref([
  {
    name: 'Revenue',
    data: [300000, 450000, 280000, 510000, 420000, 700000, 600000],
  },
])
</script>

<template>
  <UCard class="w-full">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Weekly Sales Revenue</h3>
        <USelect
          :options="['This Week', 'Last Week']"
          size="xs"
        />
      </div>
    </template>
    <div class="h-64">
      <ClientOnly>
        <apexchart
          type="area"
          height="100%"
          :options="chartOptions"
          :series="series"
        />
      </ClientOnly>
    </div>
  </UCard>
</template>
