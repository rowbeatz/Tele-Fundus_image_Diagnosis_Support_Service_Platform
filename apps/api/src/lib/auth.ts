export function canAccess(userRoles: string[], allowedRoles: string[]): boolean {
  if (allowedRoles.length === 0) {
    return true // Public access if no roles specified
  }
  
  // admin can access everything in MVP
  if (userRoles.includes('admin')) {
    return true
  }

  return userRoles.some(role => allowedRoles.includes(role))
}
