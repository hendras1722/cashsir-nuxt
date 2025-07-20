<template>
  <div class="flex justify-between gap-3 items-center">
    <UInput v-model="search">
      <template #leading>
        ID
      </template>
    </UInput>

    <div class="flex items-center gap-3">
      <UButton class="button" @click="handleExport">Export CSV</UButton>
      <UPopover>
        <UButton color="primary" variant="outline" icon="i-lucide-calendar">
          {{ modelValue ? format(new Date(modelValue.toString()), 'dd MMMM yyyy') : 'Select a date' }}
        </UButton>

        <template #content>
          <UCalendar v-model="modelValue" class="p-2" />
        </template>
      </UPopover>

    </div>
  </div>
  <u-table id="table" :data="getData" :columns="columns">
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
  header: 'Nama Produk',
}, {
  accessorKey: 'quantity',
  header: 'Qty',
}, {
  accessorKey: 'price',
  header: 'Harga'
}, {
  accessorKey: 'created_at',
  header: 'Tanggal'
}, {
  accessorKey: 'subtotal',
  header: 'Sub Total',
},]

const data = ref<Report[]>([])
const search = ref<string>('')

const getData = computed(() => {
  if (data.value.length === 0) return []
  return (data.value || [])?.filter(item => item.created_at.toString().split('T')[0] === modelValue.value.toString()).filter(item => item.id.toLocaleLowerCase().includes(search.value)) || []
})

const getTotalList = computed(() => {
  return getData.value.reduce((total, item) => total + Number(item.subtotal), 0)
})

onMounted(() => {
  const getItemsLocalStorage = localStorage.getItem('report')
  data.value = getItemsLocalStorage && JSON.parse(getItemsLocalStorage) || []
})

const generateJsonFromData = () => {
  const filteredData = getData.value

  if (filteredData.length === 0) {
    return JSON.stringify(
      { message: 'No data available for selected date' },
      null,
      2
    )
  }

  const simplifiedData = filteredData.map((item) => ({
    id: item.id,
    name: item.product_name,
    qty: item.quantity,
    price: item.price,
    subtotal: item.subtotal,
    created_at: item.created_at
  }))

  return simplifiedData
}



const jsonToCsv = (data: Report[]): string => {
  if (!data || data.length === 0) {
    return 'No data'
  }

  const headers = Object.keys(data[0]) as (keyof Report)[]
  const csvRows = [headers.join(';')]
  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header] ?? ''
      const str = String(val)
      if (str.includes(';') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    })
    csvRows.push(values.join(';'))
  }

  return csvRows.join('\n')
}

const handleExport = () => {
  try {

    const csv = jsonToCsv(generateJsonFromData() as unknown as Report[])
    const currentDate = format(new Date(modelValue.value.toString()), 'yyyy-MM-dd')
    const fileName = `report-${currentDate}.csv`

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting CSV:', error)
    alert('Failed to export CSV. Please try again.')
  }
}
</script>