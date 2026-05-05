<script setup lang="ts">
definePageMeta({
  layout: false
})

const posStore = usePosStore()
const { categories, menus } = storeToRefs(posStore)

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-extrabold text-blue-600 mb-2">Our Menu</h1>
        <p class="text-gray-500">Fresh and delicious meals served daily</p>
      </div>

      <div v-for="cat in categories" :key="cat.id" class="mb-12">
        <div class="flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
          <UIcon :name="cat.icon" class="h-8 w-8 text-blue-500" />
          <h2 class="text-2xl font-bold">{{ cat.name }}</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="item in menus.filter(m => m.categoryId === cat.id)"
            :key="item.id"
            class="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm"
          >
            <div>
              <h3 class="font-bold text-lg text-gray-900 dark:text-white">{{ item.name }}</h3>
              <p class="text-sm text-gray-500">Fresh ingredients</p>
            </div>
            <p class="text-xl font-black text-blue-600">{{ formatCurrency(item.price) }}</p>
          </div>
        </div>
      </div>

      <div class="text-center text-gray-400 mt-20">
        <p>© 2026 CashSir POS. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>
