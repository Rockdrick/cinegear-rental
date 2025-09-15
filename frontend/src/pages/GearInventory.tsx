import Navigation from "@/components/layout/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Plus, Download, ChevronLeft, ChevronRight, Package, Edit, Grid3X3, List } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useDashboardData } from "@/hooks/useDashboardData";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useState, useMemo } from "react";
import GearEditDialog from "@/components/gear/GearEditDialog";
import { apiClient, Item } from "@/lib/api";

const GearInventory = () => {
  const { t } = useLanguage();
  const { items, isLoading } = useDashboardData();
  const { canViewGear, canEditGear } = usePermissions();
  
  // State for pagination and search
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedMake, setSelectedMake] = useState("all");
  
  // Edit dialog state
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  
  // View mode state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get unique categories and conditions for filters
  const categories = useMemo(() => {
    if (!items) return [];
    const uniqueCategories = [...new Set(items.map(item => item.category?.name).filter(Boolean))];
    return uniqueCategories.sort();
  }, [items]);

  const conditions = useMemo(() => {
    if (!items) return [];
    const uniqueConditions = [...new Set(items.map(item => item.currentCondition?.name).filter(Boolean))];
    return uniqueConditions.sort();
  }, [items]);

  const types = useMemo(() => {
    if (!items) return [];
    const uniqueTypes = [...new Set(items.map(item => item.model).filter(Boolean))];
    return uniqueTypes.sort();
  }, [items]);

  const locations = useMemo(() => {
    if (!items) return [];
    const uniqueLocations = [...new Set(items.map(item => item.itemLocation?.name).filter(Boolean))];
    return uniqueLocations.sort();
  }, [items]);

  const makes = useMemo(() => {
    if (!items) return [];
    const uniqueMakes = [...new Set(items.map(item => item.make).filter(Boolean))];
    return uniqueMakes.sort();
  }, [items]);

  // Filter and search items
  const filteredItems = useMemo(() => {
    if (!items) return [];
    
    return items.filter(item => {
      const matchesSearch = searchTerm === "" || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || item.category?.name === selectedCategory;
      const matchesCondition = selectedCondition === "all" || item.currentCondition?.name === selectedCondition;
      const matchesStatus = selectedStatus === "all" || 
        (selectedStatus === "active" && item.isActive) ||
        (selectedStatus === "inactive" && !item.isActive);
      const matchesType = selectedType === "all" || item.model === selectedType;
      const matchesLocation = selectedLocation === "all" || item.itemLocation?.name === selectedLocation;
      const matchesMake = selectedMake === "all" || item.make === selectedMake;
      
      return matchesSearch && matchesCategory && matchesCondition && matchesStatus && matchesType && matchesLocation && matchesMake;
    });
  }, [items, searchTerm, selectedCategory, selectedCondition, selectedStatus, selectedType, selectedLocation, selectedMake]);

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1);
    switch (filterType) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'condition':
        setSelectedCondition(value);
        break;
      case 'status':
        setSelectedStatus(value);
        break;
      case 'type':
        setSelectedType(value);
        break;
      case 'location':
        setSelectedLocation(value);
        break;
      case 'make':
        setSelectedMake(value);
        break;
    }
  };

  // Edit handlers
  const handleEditItem = (item: Item) => {
    setEditingItem(item);
  };

  const handleSaveItem = async (itemData: any) => {
    try {
      console.log('Saving item:', itemData);
      if (editingItem) {
        await apiClient.updateItem(editingItem.id, itemData);
        console.log('Item updated successfully');
        // Refresh the page to show updated data
        window.location.reload();
      }
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  // Check permissions
  if (!canViewGear) {
    return (
      <div className="min-h-screen bg-background flex">
        <Navigation />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground">
                You don't have permission to view gear inventory.
              </p>
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
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gear Inventory</h1>
              <p className="text-muted-foreground mt-1">
                Manage your equipment and gear
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none border-l"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              {canEditGear && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search by name, make, model, or serial number..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                  setItemsPerPage(parseInt(value));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="300">300</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground flex items-center">per page</span>
              </div>
            </div>

            {/* Filter Row 1 */}
            <div className="flex gap-4 flex-wrap">
              <Select value={selectedCategory} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCondition} onValueChange={(value) => handleFilterChange('condition', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Conditions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  {conditions.map(condition => (
                    <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} of {filteredItems.length} items
              </div>
            </div>

            {/* Filter Row 2 */}
            <div className="flex gap-4 flex-wrap">
              <Select value={selectedType} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLocation} onValueChange={(value) => handleFilterChange('location', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMake} onValueChange={(value) => handleFilterChange('make', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Makes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Makes</SelectItem>
                  {makes.map(make => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedCondition("all");
                  setSelectedStatus("all");
                  setSelectedType("all");
                  setSelectedLocation("all");
                  setSelectedMake("all");
                  setCurrentPage(1);
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </div>

          {/* Gear Items */}
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-2"
          }>
            {isLoading ? (
              <div className="col-span-full text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading gear items...</p>
              </div>
            ) : currentItems.length > 0 ? (
              currentItems.map((item) => (
                viewMode === 'grid' ? (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-semibold break-words leading-tight">
                              {item.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground break-words">
                              {item.make} {item.model}
                            </p>
                          </div>
                          {canEditGear && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditItem(item)}
                              className="h-8 w-8 p-0 flex-shrink-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge 
                            variant={item.isActive ? "default" : "secondary"}
                          >
                            {item.isActive ? "Available" : "Unavailable"}
                          </Badge>
                          <Badge 
                            variant="secondary"
                            className={`text-xs ${item.exclusiveUsage ? 'bg-pink-100 text-pink-700 border-pink-200' : ''}`}
                          >
                            {item.exclusiveUsage ? "Exclusive" : "Multi-Project"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Category:</span>
                          <span className="text-right break-words">{item.category?.name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Condition:</span>
                          <span className="text-right break-words">{item.currentCondition?.name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Location:</span>
                          <span className="text-right break-words">{item.itemLocation?.name || "Unknown"}</span>
                        </div>
                        {item.serialNumber && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Serial:</span>
                            <span className="font-mono text-xs text-right break-all">{item.serialNumber}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card key={item.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 grid grid-cols-6 gap-4 items-center">
                          <div className="col-span-2 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                            <p className="text-xs text-muted-foreground truncate">{item.make} {item.model}</p>
                          </div>
                          <div className="text-sm text-center">
                            <span className="text-muted-foreground">Category:</span>
                            <div className="font-medium">{item.category?.name || "N/A"}</div>
                          </div>
                          <div className="text-sm text-center">
                            <span className="text-muted-foreground">Condition:</span>
                            <div className="font-medium">{item.currentCondition?.name || "N/A"}</div>
                          </div>
                          <div className="text-sm text-center">
                            <span className="text-muted-foreground">Location:</span>
                            <div className="font-medium">{item.itemLocation?.name || "Unknown"}</div>
                          </div>
                          <div className="text-sm text-center">
                            <span className="text-muted-foreground">Serial:</span>
                            <div className="font-mono text-xs">{item.serialNumber || "N/A"}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge 
                            variant={item.isActive ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {item.isActive ? "Available" : "Unavailable"}
                          </Badge>
                          {canEditGear && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditItem(item)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedCondition("all");
                    setSelectedStatus("all");
                    setSelectedType("all");
                    setSelectedLocation("all");
                    setSelectedMake("all");
                    setCurrentPage(1);
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Edit Dialog */}
      <GearEditDialog
        isOpen={!!editingItem}
        onClose={handleCancelEdit}
        onSave={handleSaveItem}
        item={editingItem}
      />
    </div>
  );
};

export default GearInventory;
