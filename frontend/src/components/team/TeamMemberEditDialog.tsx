import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/i18n/LanguageContext";
import { apiClient, Role } from "@/lib/api";

interface TeamMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  role: {
    id: number;
    name: string;
  };
  isActive: boolean;
  exclusiveUsage: boolean;
}

interface TeamMemberEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memberData: Partial<TeamMember>) => void;
  member?: TeamMember | null;
}

const TeamMemberEditDialog = ({ isOpen, onClose, onSave, member }: TeamMemberEditDialogProps) => {
  const { t } = useLanguage();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    roleId: "",
    isActive: true,
    exclusiveUsage: true
  });

  const fetchRoles = async () => {
    try {
      setIsLoadingRoles(true);
      const rolesData = await apiClient.getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName || "",
        lastName: member.lastName || "",
        email: member.email || "",
        phoneNumber: member.phoneNumber || "",
        roleId: member.role?.id?.toString() || "",
        isActive: member.isActive ?? true,
        exclusiveUsage: member.exclusiveUsage ?? true
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        roleId: "",
        isActive: true,
        exclusiveUsage: true
      });
    }
  }, [member, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {member ? t.team.editMember : t.team.createMember}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">{t.common.firstName}</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">{t.common.lastName}</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">{t.common.email}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="phoneNumber">{t.common.phone}</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            />
          </div>


          <div>
            <Label htmlFor="role">{t.common.role}</Label>
            <Select value={formData.roleId} onValueChange={(value) => handleInputChange("roleId", value)}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingRoles ? "Loading roles..." : t.common.selectRole} />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange("isActive", e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="isActive">{t.common.active}</Label>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="exclusiveUsage" className="text-base">
                Exclusive Usage
              </Label>
              <div className="text-sm text-muted-foreground">
                Can only work on one project at a time
              </div>
            </div>
            <Switch
              id="exclusiveUsage"
              checked={formData.exclusiveUsage}
              onCheckedChange={(checked) => handleInputChange("exclusiveUsage", checked)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t.common.cancel}
            </Button>
            <Button type="submit">
              {t.common.save}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TeamMemberEditDialog;
