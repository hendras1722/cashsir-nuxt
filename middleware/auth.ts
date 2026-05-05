export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()
  const { user } = storeToRefs(authStore)

  // Define role-based access for paths
  const roleAccess = {
    '/dashboard': ['Super Admin', 'Admin'],
    '/admin/categories': ['Super Admin', 'Admin'],
    '/admin/menus': ['Super Admin', 'Admin'],
    '/admin/staff': ['Super Admin'],
    '/cashier': ['Super Admin', 'Admin', 'User'],
  }

  // Find if current path starts with any of the restricted paths
  const path = Object.keys(roleAccess).find(p => to.path.startsWith(p))

  if (path) {
    const allowedRoles = roleAccess[path]
    if (!allowedRoles.includes(user.value.role)) {
      console.warn(`Access denied for role ${user.value.role} to ${to.path}`)
      return navigateTo('/cashier') // Redirect unauthorized users to cashier
    }
  }
})
