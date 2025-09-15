import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Edit, Trash2, Layers } from "lucide-react";
import { KitTemplateEditDialog } from "@/components/kit/KitTemplateEditDialog";
import Navigation from "@/components/layout/Navigation";
import { apiClient } from "@/lib/api";

interface KitTemplate {
  id: number;
  name: string;
  description: string;
  sourceType: 'template' | 'project';
  sourceId?: number;
  createdAt: string;
  updatedAt: string;
  itemCount?: number;
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
    serial: string;
    category: string;
    condition: string;
    location: string;
  };
}

const KitManagement = () => {
  const [kitTemplates, setKitTemplates] = useState<KitTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<KitTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSourceType, setSelectedSourceType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchKitTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getKitTemplates();
      setKitTemplates(response.templates || []);
    } catch (error) {
      console.error('Error fetching kit templates:', error);
      setKitTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKitTemplates();
  }, []);

  const handleSaveTemplate = async (templateData: any) => {
    try {
      if (editingTemplate) {
        // Update existing template
        await apiClient.updateKitTemplate(editingTemplate.id, templateData);
        await fetchKitTemplates();
        setEditingTemplate(null);
      } else {
        // Create new template
        await apiClient.createKitTemplate(templateData);
        await fetchKitTemplates();
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error saving kit template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this kit template?')) {
      return;
    }

    try {
      await apiClient.deleteKitTemplate(templateId);
      await fetchKitTemplates();
    } catch (error) {
      console.error('Error deleting kit template:', error);
    }
  };

  const filteredTemplates = (kitTemplates || []).filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (template.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSourceType = selectedSourceType === "all" || template.sourceType === selectedSourceType;
    return matchesSearch && matchesSourceType;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Navigation />
        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading kit templates...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Kit Management</h1>
              <p className="text-gray-600 mt-1">Manage kit templates and project-specific kits</p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Kit Template
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search kit templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSourceType} onValueChange={setSelectedSourceType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="template">Templates</SelectItem>
                <SelectItem value="project">Project Kits</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Kit Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {template.description || "No description"}
                      </CardDescription>
                    </div>
                    <Badge variant={template.sourceType === 'template' ? 'default' : 'secondary'}>
                      {template.sourceType === 'template' ? 'Template' : 'Project Kit'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Layers className="h-4 w-4" />
                      <span>{template.itemCount || 0} items</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            const response = await apiClient.getKitTemplate(template.id);
                            if (response.success) {
                              setEditingTemplate(response.kitTemplate);
                            }
                          } catch (error) {
                            console.error('Error fetching kit template:', error);
                          }
                        }}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No kit templates found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedSourceType !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first kit template"
                }
              </p>
              {!searchTerm && selectedSourceType === "all" && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Kit Template
                </Button>
              )}
            </div>
          )}
        </div>
        </div>
      </main>

      {/* Create/Edit Dialog */}
      <KitTemplateEditDialog
        isOpen={isCreateDialogOpen || editingTemplate !== null}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingTemplate(null);
        }}
        onSave={handleSaveTemplate}
        template={editingTemplate}
      />
    </div>
  );
};

export default KitManagement;