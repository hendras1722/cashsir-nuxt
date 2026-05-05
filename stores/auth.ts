export const useAuthStore = defineStore('auth', () => {
  const user = ref({
    id: 1,
    name: 'MSA Admin',
    role: 'Super Admin', // Roles: 'Super Admin', 'Admin', 'User'
  })

  const isAuthenticated = ref(true)

  const setRole = (role: 'Super Admin' | 'Admin' | 'User') => {
    user.value.role = role
  }

  const hasAccess = (requiredRoles: string[]) => {
    return requiredRoles.includes(user.value.role)
  }

  return {
    user,
    isAuthenticated,
    setRole,
    hasAccess,
  }
})
