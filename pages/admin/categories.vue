<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  middleware: 'auth'
})

const posStore = usePosStore()
const { categories } = storeToRefs(posStore)

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'icon', header: 'Icon' },
  { id: 'actions', header: 'Actions' }
]

const isOpen = ref(false)
const isEditing = ref(false)

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  icon: z.object({
    label: z.string(),
    value: z.string(),
    icon: z.string()
  }, { required_error: 'Icon is required' })
})

type Schema = z.output<typeof schema>

const state = reactive({
  id: 0,
  name: '',
  icon: { label: 'Fast Food', value: 'ion:fast-food', icon: 'ion:fast-food' }
})

const ionIcons = [
  { label: 'Fast Food', value: 'ion:fast-food', icon: 'ion:fast-food' },
  { label: 'Beer', value: 'ion:beer', icon: 'ion:beer' },
  { label: 'Ice Cream', value: 'ion:ice-cream', icon: 'ion:ice-cream' },
  { label: 'Pizza', value: 'ion:pizza', icon: 'ion:pizza' },
  { label: 'Burger', value: 'ion:hamburger', icon: 'ion:hamburger' },
  { label: 'Egg', value: 'ion:egg', icon: 'ion:egg' },
  { label: 'Vegetarian', value: 'ion:leaf', icon: 'ion:leaf' },
  { label: 'Seafood', value: 'ion:fish', icon: 'ion:fish' },
  { label: 'Meat', value: 'ion:meat', icon: 'ion:meat' },
  { label: 'Spicy', value: 'ion:flame', icon: 'ion:flame' },
  { label: 'Water', value: 'ion:water', icon: 'ion:water' },
  { label: 'Cafe', value: 'ion:cafe', icon: 'ion:cafe' },
  { label: 'Restaurant', value: 'ion:restaurant', icon: 'ion:restaurant' },
  { label: 'Wine', value: 'ion:wine', icon: 'ion:wine' },
]

const openAdd = () => {
  isEditing.value = false
  state.id = Date.now()
  state.name = ''
  state.icon = ionIcons[0]
  isOpen.value = true
}

const openEdit = (row: any) => {
  isEditing.value = true
  state.id = row.id
  state.name = row.name
  state.icon = ionIcons.find(i => i.value === row.icon) || ionIcons[0]
  isOpen.value = true
}

const onSubmit = (event: FormSubmitEvent<Schema>) => {
  const dataToSave = {
    id: state.id,
    name: state.name,
    icon: state.icon.value
  }

  if (isEditing.value) {
    const index = categories.value.findIndex(c => c.id === state.id)
    if (index !== -1) categories.value[index] = dataToSave
  } else {
    categories.value.push(dataToSave)
  }
  isOpen.value = false
}

const remove = (id: number) => {
  categories.value = categories.value.filter(c => c.id !== id)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Category Management</h1>
      <UButton icon="i-heroicons-plus" label="Add Category" @click="openAdd" />
    </div>

    <UCard>
      <UTable :data="categories" :columns="columns">
        <template #icon-cell="{ row }">
          <div class="flex items-center gap-2">
            <UIcon :name="row.original.icon" class="h-5 w-5" />
          </div>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton icon="i-heroicons-pencil-square" size="xs" color="neutral" variant="ghost"
              @click="openEdit(row.original)" />
            <UButton icon="i-heroicons-trash" size="xs" color="error" variant="ghost"
              @click="remove(row.original.id)" />
          </div>
        </template>
      </UTable>
    </UCard>

    <UModal v-model:open="isOpen">
      <template #content>
        <UForm :schema="schema" :state="state" @submit="onSubmit">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold">{{ isEditing ? 'Edit Category' : 'Add Category' }}</h3>
                <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
                  @click="isOpen = false" />
              </div>
            </template>

            <div class="space-y-4">
              <UFormField label="Category Name" name="name">
                <UInput v-model="state.name" placeholder="e.g. Beverages" class="w-full" />
              </UFormField>

              <UFormField label="Icon" name="icon">
                <USelectMenu v-model="state.icon" :items="ionIcons" class="w-full">
                  <template #leading>
                    <UIcon v-if="state.icon" :name="state.icon.value" class="h-4 w-4" />
                  </template>
                  <template #item="{ item }">
                    <div class="flex items-center gap-2">
                      <UIcon :name="item.value" class="h-4 w-4 shrink-0" />
                      <span>{{ item.label }}</span>
                    </div>
                  </template>
                </USelectMenu>
              </UFormField>
            </div>

            <template #footer>
              <div class="flex justify-end gap-2">
                <UButton label="Cancel" color="neutral" variant="ghost" @click="isOpen = false" />
                <UButton label="Save" color="primary" type="submit" />
              </div>
            </template>
          </UCard>
        </UForm>
      </template>
    </UModal>
  </div>
</template>
