export function isAdmin(context: any): boolean {
  return context.role?.name === 'Admin';
}

export function hasPermission(context: any, permissionName: string): boolean {
  return (
    context.permissions &&
    Array.isArray(context.permissions) &&
    context.permissions.some((p: any) => p.name === permissionName)
  );
}

export function isSelf(context: any, targetUserId: string): boolean {
  return context.userId === targetUserId;
}
