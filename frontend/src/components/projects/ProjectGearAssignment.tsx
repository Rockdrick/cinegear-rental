import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Minus, X, Package, Layers } from "lucide-react";
import { apiClient } from "@/lib/api";

interface ProjectGearAssignmentProps {
  projectId: number;
  projectStartDate: string;
  projectEndDate: string;
}

interface KitTemplate {
  id: number;
  name: string;
  description: string;
  itemCount: number;
  items?: KitTemplateItem[];
}

interface KitTemplateItem {
  id: number;
  itemId: number;
  quantity: number;
  item: {
    id: number;
    name: string;
    make: string;
    model: string;
    serialNumber: string;
    category: {
      id: number;
      name: string;
    };
    currentCondition: {
      id: number;
      name: string;
    };
    exclusiveUsage: boolean;
  };
}

interface Item {
  id: number;
  name: string;
  make: string;
  model: string;
  serialNumber: string;
  category: {
    id: number;
    name: string;
  };
  currentCondition: {
    id: number;
    name: string;
  };
  exclusiveUsage: boolean;
}

const ProjectGearAssignment = ({ projectId, projectStartDate, projectEndDate }: ProjectGearAssignmentProps) => {
  const [activeTab, setActiveTab] = useState("kits");
  const [kitTemplates, setKitTemplates] = useState<KitTemplate[]>([]);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [selectedKits, setSelectedKits] = useState<Map<number, number>>(new Map());
  const [selectedLooseItems, setSelectedLooseItems] = useState<Map<number, number>>(new Map());
  const [itemSearchTerm, setItemSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [kitsResponse, itemsResponse] = await Promise.all([
        apiClient.getKitTemplates(),
        apiClient.getItems()
      ]);

      if (kitsResponse.success) {
        setKitTemplates(kitsResponse.templates);
      }

      if (Array.isArray(itemsResponse)) {
        setAvailableItems(itemsResponse);
      }
    } catch (error) {
      console.error('Error loading gear data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = availableItems.filter(item =>
    (item.name && item.name.toLowerCase().includes(itemSearchTerm.toLowerCase())) ||
    (item.make && item.make.toLowerCase().includes(itemSearchTerm.toLowerCase())) ||
    (item.model && item.model.toLowerCase().includes(itemSearchTerm.toLowerCase())) ||
    (item.serialNumber && item.serialNumber.toLowerCase().includes(itemSearchTerm.toLowerCase())) ||
    (item.category && item.category.name && item.category.name.toLowerCase().includes(itemSearchTerm.toLowerCase()))
  );

  const handleKitToggle = (kitId: number) => {
    const newSelectedKits = new Map(selectedKits);
    if (newSelectedKits.has(kitId)) {
      newSelectedKits.delete(kitId);
    } else {
      newSelectedKits.set(kitId, 1);
    }
    setSelectedKits(newSelectedKits);
  };

  const handleKitQuantityChange = (kitId: number, quantity: number) => {
    if (quantity <= 0) {
      const newSelectedKits = new Map(selectedKits);
      newSelectedKits.delete(kitId);
      setSelectedKits(newSelectedKits);
    } else {
      const newSelectedKits = new Map(selectedKits);
      newSelectedKits.set(kitId, quantity);
      setSelectedKits(newSelectedKits);
    }
  };

  const handleItemToggle = (itemId: number) => {
    const newSelectedItems = new Map(selectedLooseItems);
    if (newSelectedItems.has(itemId)) {
      newSelectedItems.delete(itemId);
    } else {
      newSelectedItems.set(itemId, 1);
    }
    setSelectedLooseItems(newSelectedItems);
  };

  const handleItemQuantityChange = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      const newSelectedItems = new Map(selectedLooseItems);
      newSelectedItems.delete(itemId);
      setSelectedLooseItems(newSelectedItems);
    } else {
      const newSelectedItems = new Map(selectedLooseItems);
      newSelectedItems.set(itemId, quantity);
      setSelectedLooseItems(newSelectedItems);
    }
  };

  const getSelectedKitsDetails = () => {
    return Array.from(selectedKits.entries()).map(([kitId, quantity]) => {
      const kit = kitTemplates.find(k => k.id === kitId);
      return kit ? { ...kit, quantity } : null;
    }).filter(Boolean);
  };

  const getSelectedItemsDetails = () => {
    return Array.from(selectedLooseItems.entries()).map(([itemId, quantity]) => {
      const item = availableItems.find(i => i.id === itemId);
      return item ? { ...item, quantity } : null;
    }).filter(Boolean);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading gear options...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Project Gear Assignment</h3>
        <p className="text-sm text-muted-foreground">
          Add kit templates or individual items to this project
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="kits" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Kit Templates ({selectedKits.size})
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Loose Items ({selectedLooseItems.size})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kits" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kitTemplates.map((kit) => (
              <Card key={kit.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{kit.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {kit.description || "No description"}
                      </p>
                    </div>
                    <Checkbox
                      checked={selectedKits.has(kit.id)}
                      onCheckedChange={() => handleKitToggle(kit.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Layers className="h-4 w-4" />
                      <span>{kit.itemCount} items</span>
                    </div>
                    
                    {selectedKits.has(kit.id) && (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleKitQuantityChange(kit.id, (selectedKits.get(kit.id) || 1) - 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {selectedKits.get(kit.id) || 1}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleKitQuantityChange(kit.id, (selectedKits.get(kit.id) || 1) + 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedKits.size > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Selected Kit Templates ({selectedKits.size})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getSelectedKitsDetails().map((kit) => (
                    <div key={kit!.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{kit!.name}</p>
                        <p className="text-sm text-muted-foreground">{kit!.itemCount} items</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Qty: {kit!.quantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleKitToggle(kit!.id)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search items..."
              value={itemSearchTerm}
              onChange={(e) => setItemSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded-lg p-2">
            {filteredItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                <Checkbox
                  checked={selectedLooseItems.has(item.id)}
                  onCheckedChange={() => handleItemToggle(item.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name || 'Unnamed Item'}</p>
                  <p className="text-xs text-gray-600 truncate">
                    {[item.make, item.model].filter(Boolean).join(' ')} {item.serialNumber && `- ${item.serialNumber}`}
                  </p>
                </div>
                {selectedLooseItems.has(item.id) && (
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleItemQuantityChange(item.id, (selectedLooseItems.get(item.id) || 1) - 1)}
                      className="h-6 w-6 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm w-8 text-center">
                      {selectedLooseItems.get(item.id) || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleItemQuantityChange(item.id, (selectedLooseItems.get(item.id) || 1) + 1)}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedLooseItems.size > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Selected Loose Items ({selectedLooseItems.size})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getSelectedItemsDetails().map((item) => (
                    <div key={item!.id} className="flex items-center justify-between p-2 border rounded">
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
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectGearAssignment;
