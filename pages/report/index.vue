<template>
  <div class="flex justify-end">
    <UPopover>
      <UButton color="primary" variant="outline" icon="i-lucide-calendar">
        {{ modelValue ? format(new Date(modelValue.toString()), 'dd MMMM yyyy') : 'Select a date' }}
      </UButton>


      <template #content>
        <UCalendar v-model="modelValue" class="p-2" />
      </template>
    </UPopover>
  </div>
  <u-table :data="getData" :columns="columns">
    <template #quantity-cell="{ row }">
      <span>{{ row.original.quantity }}x</span>
    </template>
    <template #created_at-cell="{ row }">
      <span>{{ row.original?.created_at && format(subDays(new Date(row.original.created_at), 1),
        'dd-MM-yyyy') || '-'
      }}</span>
    </template>
    <template #price-cell="{ row }">
      <span>Rp.{{ Number(row.original.price).toLocaleString('id-ID') }}</span>
    </template>
    <template #subtotal-cell="{ row }">
      <span>Rp.{{ Number(row.original.subtotal).toLocaleString('id-ID') }}</span>
    </template>
  </u-table>
  <div class="text-lg font-bold flex justify-end">
    Total: Rp.{{ Number(getTotalList).toLocaleString('id-ID') }}
  </div>
</template>

<script lang="tsx" setup>
import type { TableColumn } from '@nuxt/ui';
import { CalendarDate } from '@internationalized/date'
import { format, subDays } from 'date-fns';


interface Product {
  id: string;
  product_name: string;
  quantity: number;
  price: string;
  subtotal: string;
}

interface Report extends Product {
  created_at: Date;
}

const modelValue = shallowRef(new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate()))

const columns: TableColumn<Report>[] = [{
  accessorKey: 'id',
  header: 'ID',
}, {
  accessorKey: 'product_name',
  header: 'Name',
}, {
  accessorKey: 'quantity',
  header: 'Qty',
}, {
  accessorKey: 'price',
  header: 'Harga'
}, {
  accessorKey: 'created_at',
  header: 'Created At'
}, {
  accessorKey: 'subtotal',
  header: 'Sub Total',
},]

const data = ref<Report[]>([])

const getData = computed(() => {
  if (data.value.length === 0) return []
  return (data.value || [])?.filter(item => item.created_at.toString().split('T')[0] === modelValue.value.toString()) || []
})

const getTotalList = computed(() => {
  return data.value.reduce((total, item) => total + Number(item.subtotal), 0)
})


onMounted(() => {
  const getItemsLocalStorage = localStorage.getItem('report')
  data.value = getItemsLocalStorage && JSON.parse(getItemsLocalStorage) || []
})
</script>