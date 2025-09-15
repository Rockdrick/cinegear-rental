import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Users, Shield, Settings } from 'lucide-react';
import { apiClient, User, Role } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/layout/Navigation';

interface Permission {
  key: string;
  label: string;
  description: string;
  category: 'gear' | 'projects' | 'team' | 'kits' | 'pricing' | 'admin';
}

const PERMISSIONS: Permission[] = [
  // Gear permissions
  { key: 'view_gear_inventory', label: 'View Gear Inventory', description: 'Can view gear items', category: 'gear' },
  { key: 'edit_gear_inventory', label: 'Edit Gear Inventory', description: 'Can create, update, and delete gear', category: 'gear' },
  
  // Project permissions
  { key: 'view_projects', label: 'View All Projects', description: 'Can view all projects (admin level)', category: 'projects' },
  { key: 'view_assigned_projects', label: 'View Assigned Projects', description: 'Can only view projects they are assigned to', category: 'projects' },
  { key: 'edit_projects', label: 'Edit Projects', description: 'Can manage projects and assignments', category: 'projects' },
  
  // Team permissions
  { key: 'view_team', label: 'View Team', description: 'Can view team members', category: 'team' },
  { key: 'edit_team', label: 'Edit Team', description: 'Can manage team members and project assignments', category: 'team' },
  
  // Kit permissions
  { key: 'view_kits', label: 'View All Kits', description: 'Can view all kit templates (admin level)', category: 'kits' },
  { key: 'view_assigned_kits', label: 'View Assigned Kits', description: 'Can only view kits from assigned projects', category: 'kits' },
  { key: 'create_kits', label: 'Create Kits', description: 'Can create, update, and delete kit templates', category: 'kits' },
  
  // Pricing permissions
  { key: 'view_prices', label: 'View Prices', description: 'Can see pricing information', category: 'pricing' },
  { key: 'edit_prices', label: 'Edit Prices', description: 'Can modify pricing', category: 'pricing' },
  
  // Client permissions
  { key: 'view_clients', label: 'View Clients', description: 'Can view client information', category: 'admin' },
  { key: 'edit_clients', label: 'Edit Clients', description: 'Can manage client information and contacts', category: 'admin' },
];

const Admin: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('roles');
  
  // Role management state
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    permissions: {} as Record<string, boolean>
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersData, rolesData] = await Promise.all([
        apiClient.getUsers(),
        apiClient.getRoles()
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleEdit = (role: Role) => {
    setEditingRole(role);
    setRoleFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || {}
    });
    setIsRoleDialogOpen(true);
  };

  const handleRoleSave = async () => {
    try {
      if (editingRole) {
        await apiClient.updateRole(editingRole.id, roleFormData);
      } else {
        await apiClient.createRole(roleFormData);
      }
      await fetchData();
      setIsRoleDialogOpen(false);
      setEditingRole(null);
      setRoleFormData({ name: '', description: '', permissions: {} });
    } catch (error) {
      console.error('Error saving role:', error);
      alert('Failed to save role');
    }
  };

  const handlePermissionToggle = (permissionKey: string, enabled: boolean) => {
    setRoleFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionKey]: enabled
      }
    }));
  };

  const getPermissionCategory = (category: string) => {
    const categoryPermissions = PERMISSIONS.filter(p => p.category === category);
    return categoryPermissions;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Navigation />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading admin data...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Navigation />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList>
                <TabsTrigger value="roles" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Roles & Permissions
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Users
                </TabsTrigger>
              </TabsList>

              {/* Roles & Permissions Tab */}
              <TabsContent value="roles" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Roles & Permissions</h2>
                  <Button onClick={() => setIsRoleDialogOpen(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Role
                  </Button>
                </div>

                <div className="grid gap-4">
                  {roles.map((role) => (
                    <Card key={role.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {role.name}
                              <Badge variant="secondary">{users.filter(u => u.role?.id === role.id).length} users</Badge>
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {role.description || 'No description'}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRoleEdit(role)}
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {Object.entries(role.permissions || {}).map(([key, value]) => {
                            const permission = PERMISSIONS.find(p => p.key === key);
                            if (!permission) return null;
                            
                            return (
                              <div key={key} className="flex items-center justify-between">
                                <div>
                                  <Label className="text-sm font-medium">{permission.label}</Label>
                                  <p className="text-xs text-muted-foreground">{permission.description}</p>
                                </div>
                                <Badge variant={value ? "default" : "secondary"}>
                                  {value ? "Allowed" : "Denied"}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <h2 className="text-xl font-semibold">Users</h2>
                <div className="grid gap-4">
                  {users.map((user) => (
                    <Card key={user.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <Badge variant="outline" className="mt-1">
                              {user.role?.name || 'No Role'}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {user.exclusiveUsage ? "Exclusive" : "Multi-Project"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.isActive ? "Active" : "Inactive"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Role Edit Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Edit Role' : 'Create Role'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="roleName">Role Name</Label>
                <Input
                  id="roleName"
                  value={roleFormData.name}
                  onChange={(e) => setRoleFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter role name"
                />
              </div>
              <div>
                <Label htmlFor="roleDescription">Description</Label>
                <Textarea
                  id="roleDescription"
                  value={roleFormData.description}
                  onChange={(e) => setRoleFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter role description"
                  rows={3}
                />
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Permissions</h3>
              
              {['gear', 'projects', 'team', 'kits', 'pricing', 'admin'].map(category => (
                <div key={category} className="space-y-3">
                  <h4 className="font-medium capitalize">{category} Permissions</h4>
                  <div className="grid gap-3 pl-4">
                    {getPermissionCategory(category).map(permission => (
                      <div key={permission.key} className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label className="text-sm font-medium">{permission.label}</Label>
                          <p className="text-xs text-muted-foreground">{permission.description}</p>
                        </div>
                        <Switch
                          checked={roleFormData.permissions[permission.key] || false}
                          onCheckedChange={(checked) => handlePermissionToggle(permission.key, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleSave}>
              {editingRole ? 'Update Role' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
