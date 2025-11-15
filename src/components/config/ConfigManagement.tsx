import { useState, useEffect } from "react";
import { OcrConfig } from "@/types/config";
import { fetchConfigs, saveConfig, deleteConfig } from "@/lib/api";
import { ConfigList } from "./ConfigList";
import { ConfigEditor } from "./ConfigEditor";
import { toast } from "sonner";
import { mockConfigs } from "@/lib/mockData";

export const ConfigManagement = () => {
  const [configs, setConfigs] = useState<OcrConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<OcrConfig | undefined>();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setIsLoading(true);
      let data = await fetchConfigs();
      
      // Initialize with mock data if empty
      if (data.length === 0) {
        localStorage.setItem("ocr-configs", JSON.stringify(mockConfigs));
        data = mockConfigs;
      }
      
      setConfigs(data);
    } catch (error) {
      toast.error("Failed to load configurations");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (config: OcrConfig) => {
    try {
      await saveConfig(config);
      await loadConfigs();
      setIsEditing(false);
      setSelectedConfig(undefined);
      toast.success("Configuration saved successfully");
    } catch (error) {
      toast.error("Failed to save configuration");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteConfig(id);
      await loadConfigs();
      toast.success("Configuration deleted successfully");
    } catch (error) {
      toast.error("Failed to delete configuration");
    }
  };

  const handleEdit = (config: OcrConfig) => {
    setSelectedConfig(config);
    setIsEditing(true);
  };

  const handleNew = () => {
    setSelectedConfig(undefined);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setSelectedConfig(undefined);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading configurations...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <div className="h-full">
        <ConfigList
          configs={configs}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onNew={handleNew}
        />
      </div>

      <div className="h-full">
        {isEditing ? (
          <ConfigEditor config={selectedConfig} onSave={handleSave} onCancel={handleCancel} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Select a configuration to edit or create a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
