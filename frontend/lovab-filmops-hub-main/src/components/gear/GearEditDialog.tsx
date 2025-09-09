import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { apiClient, Item } from '@/lib/api';

interface GearEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: any) => void;
  item: Item | null;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

interface Condition {
  id: number;
  name: string;
  description: string;
}

interface Location {
  id: number;
  name: string;
  description: string;
}

const GearEditDialog: React.FC<GearEditDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  item
}) => {
  const [formData, setFormData] = useState({
    name: '',
    make: '',
    model: '',
    serialNumber: '',
    categoryId: '',
    conditionId: '',
    locationId: '',
    notes: '',
    acquisitionDate: '',
    purchasePrice: '',
    isRentable: true,
    isActive: true
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingConditions, setIsLoadingConditions] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  // Load reference data
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        setIsLoadingCategories(true);
        setIsLoadingConditions(true);
        setIsLoadingLocations(true);

        // Load categories
        const categoriesResponse = await fetch('http://localhost:3001/api/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }

        // Load conditions
        const conditionsResponse = await fetch('http://localhost:3001/api/conditions');
        if (conditionsResponse.ok) {
          const conditionsData = await conditionsResponse.json();
          setConditions(conditionsData);
        }

        // Load locations
        const locationsResponse = await fetch('http://localhost:3001/api/locations');
        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json();
          setLocations(locationsData);
        }
      } catch (error) {
        console.error('Error loading reference data:', error);
      } finally {
        setIsLoadingCategories(false);
        setIsLoadingConditions(false);
        setIsLoadingLocations(false);
      }
    };

    if (isOpen) {
      loadReferenceData();
    }
  }, [isOpen]);

  // Populate form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        make: item.make || '',
        model: item.model || '',
        serialNumber: item.serialNumber || '',
        categoryId: item.category?.id?.toString() || '',
        conditionId: item.currentCondition?.id?.toString() || '',
        locationId: item.itemLocation?.id?.toString() || '',
        notes: item.notes || '',
        acquisitionDate: item.acquisitionDate ? new Date(item.acquisitionDate).toISOString().split('T')[0] : '',
        purchasePrice: item.purchasePrice?.toString() || '',
        isRentable: item.isRentable ?? true,
        isActive: item.isActive ?? true
      });
    }
  }, [item]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    const itemData = {
      ...formData,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      conditionId: formData.conditionId ? parseInt(formData.conditionId) : null,
      locationId: formData.locationId ? parseInt(formData.locationId) : null,
      purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : 0
    };
    onSave(itemData);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Gear Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Item name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => handleInputChange('make', e.target.value)}
                  placeholder="Manufacturer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="Model number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                  placeholder="Serial number"
                />
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Classification</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingCategories ? (
                      <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select value={formData.conditionId} onValueChange={(value) => handleInputChange('conditionId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingConditions ? "Loading..." : "Select condition"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingConditions ? (
                      <SelectItem value="loading" disabled>Loading conditions...</SelectItem>
                    ) : (
                      conditions.map((condition) => (
                        <SelectItem key={condition.id} value={condition.id.toString()}>
                          {condition.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select value={formData.locationId} onValueChange={(value) => handleInputChange('locationId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingLocations ? "Loading..." : "Select location"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingLocations ? (
                      <SelectItem value="loading" disabled>Loading locations...</SelectItem>
                    ) : (
                      locations.map((location) => (
                        <SelectItem key={location.id} value={location.id.toString()}>
                          {location.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Financial Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="acquisitionDate">Acquisition Date</Label>
                <Input
                  id="acquisitionDate"
                  type="date"
                  value={formData.acquisitionDate}
                  onChange={(e) => handleInputChange('acquisitionDate', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Status</h3>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isRentable"
                  checked={formData.isRentable}
                  onCheckedChange={(checked) => handleInputChange('isRentable', checked)}
                />
                <Label htmlFor="isRentable">Rentable</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about this item"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GearEditDialog;
