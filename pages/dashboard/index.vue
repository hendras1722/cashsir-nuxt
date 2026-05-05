<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const stats = ref([
  { label: 'Total Sales', value: 'Rp 12.450.000', icon: 'i-heroicons-banknotes', color: 'blue' },
  { label: 'Orders', value: '154', icon: 'i-heroicons-shopping-bag', color: 'green' },
  { label: 'Customers', value: '89', icon: 'i-heroicons-users', color: 'purple' },
  { label: 'Avg. Transaction', value: 'Rp 80.844', icon: 'i-heroicons-calculator', color: 'orange' },
])
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Sales Dashboard</h1>
        <p class="text-gray-500">Welcome back, here's what's happening today.</p>
      </div>
      <UButton
        icon="i-heroicons-calendar"
        label="Download Report"
        variant="soft"
      />
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard
        v-for="stat in stats"
        :key="stat.label"
        class="overflow-hidden"
      >
        <div class="flex items-center gap-4">
          <div :class="`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30`">
            <UIcon :name="stat.icon" :class="`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`" />
          </div>
          <div>
            <p class="text-sm text-gray-500">{{ stat.label }}</p>
            <p class="text-xl font-bold">{{ stat.value }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Chart -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <SalesChart />
      </div>
      
      <UCard>
        <template #header>
          <h3 class="font-semibold">Top Products</h3>
        </template>
        <div class="space-y-4">
          <div v-for="i in 5" :key="i" class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold">
                {{ i }}
              </div>
              <div>
                <p class="text-sm font-medium">Product {{ i }}</p>
                <p class="text-xs text-gray-500">24 sold</p>
              </div>
            </div>
            <p class="text-sm font-bold">Rp 1.200.000</p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
