import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface UserPermissions {
  userId: string;
  permissions: Permission[];
}

interface PermissionsContextType {
  permissions: Permission[];
  userPermissions: UserPermissions | null;
  hasPermission: (resource: string, action: string) => boolean;
  canViewGear: boolean;
  canEditGear: boolean;
  canViewBookings: boolean;
  canEditBookings: boolean;
  canViewProjects: boolean;
  canEditProjects: boolean;
  canViewTeam: boolean;
  canEditTeam: boolean;
  isLoading: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

// Mock permissions data - in real app, this would come from API
const ALL_PERMISSIONS: Permission[] = [
  {
    id: 'view_gear',
    name: 'View Gear Inventory',
    description: 'Can view equipment and gear items',
    resource: 'gear',
    action: 'view'
  },
  {
    id: 'edit_gear',
    name: 'Edit Gear Inventory',
    description: 'Can create, edit, and delete equipment items',
    resource: 'gear',
    action: 'edit'
  },
  {
    id: 'view_bookings',
    name: 'View Bookings',
    description: 'Can view booking information',
    resource: 'bookings',
    action: 'view'
  },
  {
    id: 'edit_bookings',
    name: 'Edit Bookings',
    description: 'Can create, edit, and delete bookings',
    resource: 'bookings',
    action: 'edit'
  },
  {
    id: 'view_projects',
    name: 'View Projects',
    description: 'Can view project information',
    resource: 'projects',
    action: 'view'
  },
  {
    id: 'edit_projects',
    name: 'Edit Projects',
    description: 'Can create, edit, and delete projects',
    resource: 'projects',
    action: 'edit'
  },
  {
    id: 'view_team',
    name: 'View Team',
    description: 'Can view team member information',
    resource: 'team',
    action: 'view'
  },
  {
    id: 'edit_team',
    name: 'Edit Team',
    description: 'Can create, edit, and delete team members',
    resource: 'team',
    action: 'edit'
  }
];

// Get user permissions based on role
const getUserPermissions = (roleName: string, rolePermissions: any): Permission[] => {
  // If role has "all" permission, return all permissions
  if (rolePermissions?.all === true) {
    return ALL_PERMISSIONS;
  }
  
  // Otherwise, check individual permissions
  const userPermissions: Permission[] = [];
  
  ALL_PERMISSIONS.forEach(permission => {
    const resource = permission.resource;
    const action = permission.action;
    
    // Check if user has this specific permission
    if (rolePermissions?.[resource]?.[action] === true || 
        rolePermissions?.[resource] === true ||
        rolePermissions?.[`${resource}_${action}`] === true) {
      userPermissions.push(permission);
    }
  });
  
  return userPermissions;
};

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const permissions = getUserPermissions(user.role?.name || '', user.role?.permissions);
      setUserPermissions({
        userId: user.id,
        permissions
      });
    } else {
      setUserPermissions(null);
    }
    setIsLoading(false);
  }, [user]);

  const hasPermission = (resource: string, action: string): boolean => {
    if (!userPermissions) return false;
    return userPermissions.permissions.some(
      p => p.resource === resource && p.action === action
    );
  };

  const canViewGear = hasPermission('gear', 'view');
  const canEditGear = hasPermission('gear', 'edit');
  const canViewBookings = hasPermission('bookings', 'view');
  const canEditBookings = hasPermission('bookings', 'edit');
  const canViewProjects = hasPermission('projects', 'view');
  const canEditProjects = hasPermission('projects', 'edit');
  const canViewTeam = hasPermission('team', 'view');
  const canEditTeam = hasPermission('team', 'edit');

  const value: PermissionsContextType = {
    permissions: ALL_PERMISSIONS,
    userPermissions,
    hasPermission,
    canViewGear,
    canEditGear,
    canViewBookings,
    canEditBookings,
    canViewProjects,
    canEditProjects,
    canViewTeam,
    canEditTeam,
    isLoading
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};
