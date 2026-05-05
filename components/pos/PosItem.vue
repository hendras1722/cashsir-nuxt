<script setup lang="ts">
const props = defineProps<{
  item: {
    id: number
    name: string
    price: number
    stock: number
  }
}>()

const emit = defineEmits(['add'])

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}
</script>

<template>
  <div
    class="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-blue-500 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900"
    @click="emit('add', item)"
  >
    <div class="mb-4 aspect-square rounded-lg bg-gray-100 flex items-center justify-center dark:bg-gray-800">
      <UIcon name="ion:restaurant-outline" class="h-12 w-12 text-gray-400 group-hover:text-blue-500" />
    </div>
    
    <div>
      <h4 class="font-medium text-gray-900 dark:text-white">{{ item.name }}</h4>
      <p class="text-sm text-blue-600 font-bold mt-1">{{ formatCurrency(item.price) }}</p>
      <div class="mt-2 flex items-center justify-between">
        <span class="text-xs text-gray-500">Stock: {{ item.stock }}</span>
        <UButton
          icon="i-heroicons-plus"
          size="xs"
          color="primary"
          variant="soft"
          class="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  </div>
</template>
