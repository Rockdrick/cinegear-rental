/**
 * Permission utility functions for handling multiple roles and principle of least privilege
 */

export interface Permission {
  [key: string]: boolean;
}

/**
 * Combines permissions from multiple roles using principle of least privilege
 * A user gets a permission if ANY of their active roles grants it
 * This follows the principle of least privilege by being explicit about what's allowed
 */
export const combineRolePermissions = (rolePermissions: Permission[]): Permission => {
  if (!rolePermissions || rolePermissions.length === 0) {
    return {};
  }

  const combinedPermissions: Permission = {};

  // Get all unique permission keys from all roles
  const allPermissionKeys = new Set<string>();
  rolePermissions.forEach(permissions => {
    Object.keys(permissions).forEach(key => {
      allPermissionKeys.add(key);
    });
  });

  // For each permission, grant it if ANY role has it set to true
  allPermissionKeys.forEach(permissionKey => {
    combinedPermissions[permissionKey] = rolePermissions.some(permissions => 
      permissions[permissionKey] === true
    );
  });

  return combinedPermissions;
};

/**
 * Checks if a user has a specific permission
 */
export const hasPermission = (userPermissions: Permission, permission: string): boolean => {
  return userPermissions[permission] === true;
};

/**
 * Checks if a user has any of the specified permissions
 */
export const hasAnyPermission = (userPermissions: Permission, permissions: string[]): boolean => {
  return permissions.some(permission => hasPermission(userPermissions, permission));
};

/**
 * Checks if a user has all of the specified permissions
 */
export const hasAllPermissions = (userPermissions: Permission, permissions: string[]): boolean => {
  return permissions.every(permission => hasPermission(userPermissions, permission));
};

/**
 * Gets a list of permissions that the user has
 */
export const getGrantedPermissions = (userPermissions: Permission): string[] => {
  return Object.keys(userPermissions).filter(key => userPermissions[key] === true);
};

/**
 * Gets a list of permissions that the user doesn't have
 */
export const getDeniedPermissions = (userPermissions: Permission): string[] => {
  return Object.keys(userPermissions).filter(key => userPermissions[key] === false);
};

/**
 * Validates that a user has the minimum required permissions for a role
 * This ensures principle of least privilege is maintained
 */
export const validateMinimumPermissions = (
  userPermissions: Permission, 
  requiredPermissions: string[]
): { valid: boolean; missing: string[] } => {
  const missing = requiredPermissions.filter(permission => 
    !hasPermission(userPermissions, permission)
  );
  
  return {
    valid: missing.length === 0,
    missing
  };
};

