<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const staff = ref([
  { id: 1, name: 'Syahendra', role: 'Super Admin', email: 'syahendra@msa.com' },
  { id: 2, name: 'Budi Kasir', role: 'User', email: 'budi@msa.com' },
  { id: 3, name: 'Ani Admin', role: 'Admin', email: 'ani@msa.com' },
])

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
  { id: 'actions', header: 'Actions' }
]

const roles = ['Super Admin', 'Admin', 'User']

const updateRole = (row, newRole) => {
  row.role = newRole
  // If editing self, update store
  if (row.id === user.value.id) {
    authStore.setRole(newRole as any)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Staff & RBAC</h1>
        <p class="text-gray-500">Manage user roles and permissions.</p>
      </div>
      <UButton icon="i-heroicons-user-plus" label="Invite Staff" />
    </div>

    <UAlert
      icon="i-heroicons-information-circle"
      color="primary"
      variant="soft"
      title="Current User Role"
      :description="`You are currently logged in as ${user.name} with role: ${user.role}`"
    />

    <UCard>
      <UTable :data="staff" :columns="columns">
        <template #role-cell="{ row }">
          <USelect
            :model-value="row.original.role"
            :options="roles"
            size="xs"
            @update:model-value="(val) => updateRole(row.original, val)"
          />
        </template>
        
        <template #actions-cell="{ row }">
          <UButton
            icon="i-heroicons-trash"
            size="xs"
            color="error"
            variant="ghost"
          />
        </template>
      </UTable>
    </UCard>
  </div>
</template>
