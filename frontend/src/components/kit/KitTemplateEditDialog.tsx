import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Minus, X } from "lucide-react";
import { apiClient } from "@/lib/api";

interface Item {
  id: number;
  name: string;
  make: string;
  model: string;
  serialNumber: string;
  category: {
    id: number;
    name: string;
    description: string;
  };
  currentCondition: {
    id: number;
    name: string;
    description: string;
  };
  itemLocation: {
    id: number;
    name: string;
    description: string;
  };
  notes?: string;
  exclusiveUsage: boolean;
}

interface KitTemplateItem {
  id: number;
  itemId: number;
  quantity: number;
  item: Item;
}

interface KitTemplate {
  id: number;
  name: string;
  description: string;
  sourceType: 'template' | 'project';
  sourceId?: number;
  items: KitTemplateItem[];
}

interface KitTemplateEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (templateData: any) => void;
  template?: KitTemplate | null;
}

const KitTemplateEditDialog = ({ isOpen, onClose, onSave, template }: KitTemplateEditDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sourceType: "template" as 'template' | 'project',
    sourceId: undefined as number | undefined
  });

  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [itemSearchTerm, setItemSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<Map<number, number>>(new Map());
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadItems();
      if (template) {
        setFormData({
          name: template.name,
          description: template.description,
          sourceType: template.sourceType,
          sourceId: template.sourceId
        });
        // Load existing items
        const itemsMap = new Map<number, number>();
        template.items.forEach(item => {
          itemsMap.set(item.itemId, item.quantity);
        });
        setSelectedItems(itemsMap);
      } else {
        setFormData({
          name: "",
          description: "",
          sourceType: "template",
          sourceId: undefined
        });
        setSelectedItems(new Map());
      }
    }
  }, [isOpen, template]);

  useEffect(() => {
    console.log('Search effect triggered:', { itemSearchTerm, availableItemsCount: availableItems.length });
    if (itemSearchTerm.trim() === "") {
      setFilteredItems(availableItems);
      console.log('No search term, showing all items:', availableItems.length);
    } else {
      const searchTerm = itemSearchTerm.toLowerCase();
      const filtered = availableItems.filter(item =>
        (item.name && item.name.toLowerCase().includes(searchTerm)) ||
        (item.make && item.make.toLowerCase().includes(searchTerm)) ||
        (item.model && item.model.toLowerCase().includes(searchTerm)) ||
        (item.serialNumber && item.serialNumber.toLowerCase().includes(searchTerm)) ||
        (item.category && item.category.name && item.category.name.toLowerCase().includes(searchTerm)) ||
        (item.currentCondition && item.currentCondition.name && item.currentCondition.name.toLowerCase().includes(searchTerm)) ||
        (item.itemLocation && item.itemLocation.name && item.itemLocation.name.toLowerCase().includes(searchTerm)) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm))
      );
      console.log('Search results:', filtered.length, 'items found for term:', searchTerm);
      setFilteredItems(filtered);
    }
  }, [itemSearchTerm, availableItems]);

  const loadItems = async () => {
    try {
      setIsLoadingItems(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/items', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      
      const data = await response.json();
      console.log('Items API response:', data);
      if (Array.isArray(data)) {
        setAvailableItems(data);
        console.log('Items loaded:', data.length);
      } else if (data.success && data.data) {
        setAvailableItems(data.data);
        console.log('Items loaded:', data.data.length);
      } else if (data.success && Array.isArray(data.items)) {
        setAvailableItems(data.items);
        console.log('Items loaded:', data.items.length);
      } else {
        console.error('Unexpected API response format:', data);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleItemToggle = (itemId: number) => {
    const newSelectedItems = new Map(selectedItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.set(itemId, 1);
    }
    setSelectedItems(newSelectedItems);
  };

  const handleQuantityChange = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      const newSelectedItems = new Map(selectedItems);
      newSelectedItems.delete(itemId);
      setSelectedItems(newSelectedItems);
    } else {
      const newSelectedItems = new Map(selectedItems);
      newSelectedItems.set(itemId, quantity);
      setSelectedItems(newSelectedItems);
    }
  };

  const handleSave = () => {
    const items = Array.from(selectedItems.entries()).map(([itemId, quantity]) => ({
      itemId,
      quantity
    }));

    const templateData = {
      ...formData,
      items
    };

    onSave(templateData);
  };

  const getSelectedItemsDetails = () => {
    return Array.from(selectedItems.entries()).map(([itemId, quantity]) => {
      const item = availableItems.find(i => i.id === itemId);
      return item ? { ...item, quantity } : null;
    }).filter(Boolean);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit Kit Template" : "Create Kit Template"}
          </DialogTitle>
          <DialogDescription>
            {template ? "Update the kit template details and items" : "Create a new kit template with items"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Kit Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter kit name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sourceType">Source Type</Label>
              <Select
                value={formData.sourceType}
                onValueChange={(value: 'template' | 'project') => setFormData({ ...formData, sourceType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="project">Project Kit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter kit description"
              rows={3}
            />
          </div>

          {/* Item Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Add Items</h3>
              <div className="text-sm text-gray-600">
                {availableItems.length} items available, {filteredItems.length} shown
                {itemSearchTerm && ` (searching for: "${itemSearchTerm}")`}
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search items..."
                value={itemSearchTerm}
                onChange={(e) => setItemSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {isLoadingItems ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Loading items...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded-lg p-2">
                {filteredItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                    <Checkbox
                      checked={selectedItems.has(item.id)}
                      onCheckedChange={() => handleItemToggle(item.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name || 'Unnamed Item'}</p>
                      <p className="text-xs text-gray-600 truncate">
                        {[item.make, item.model].filter(Boolean).join(' ')} {item.serialNumber && `- ${item.serialNumber}`}
                      </p>
                    </div>
                    {selectedItems.has(item.id) && (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, (selectedItems.get(item.id) || 1) - 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-8 text-center">
                          {selectedItems.get(item.id) || 1}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, (selectedItems.get(item.id) || 1) + 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Items Summary */}
          {selectedItems.size > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Selected Items ({selectedItems.size})</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {getSelectedItemsDetails().map((item) => (
                  <Card key={item!.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{item!.name || 'Unnamed Item'}</p>
                        <p className="text-sm text-gray-600">
                          {[item!.make, item!.model].filter(Boolean).join(' ')} {item!.serialNumber && `- ${item!.serialNumber}`}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {item!.category && item!.category.name && (
                            <Badge variant="secondary" className="text-xs">
                              {item!.category.name}
                            </Badge>
                          )}
                          {item!.currentCondition && item!.currentCondition.name && (
                            <Badge variant="outline" className="text-xs">
                              {item!.currentCondition.name}
                            </Badge>
                          )}
                          {item!.exclusiveUsage && (
                            <Badge variant="secondary" className="text-xs bg-pink-100 text-pink-700 border-pink-200">
                              Exclusive
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Qty: {item!.quantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleItemToggle(item!.id)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!formData.name.trim() || selectedItems.size === 0}>
            {template ? "Update Template" : "Create Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { KitTemplateEditDialog };
