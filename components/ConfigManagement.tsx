"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import { OcrConfig, OcrFieldConfig, DataType, FREIGHT_PAYLOAD_KEYS, FreightPayloadKey } from "@/types/ocr";

export default function ConfigManagement() {
  const [configs, setConfigs] = useState<OcrConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState<string | "new" | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    document_type: "",
    company_id: "",
    apply_at_transporter_level: false,
    transporter_company_id: "",
    prompt: "",
  });
  const [fields, setFields] = useState<OcrFieldConfig[]>([]);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/configs");
      if (!response.ok) throw new Error("Failed to fetch configs");
      const data = await response.json();
      setConfigs(data);
    } catch (error: any) {
      toast.error("Failed to load configs", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditMode("new");
    setFormData({
      document_type: "Freight Invoice",
      company_id: "",
      apply_at_transporter_level: false,
      transporter_company_id: "",
      prompt: "Extract the following information from the freight invoice document accurately.",
    });
    setFields([
      {
        field_label: "Invoice Number",
        field_key: "invoice_number",
        data_type: "string",
        required: true,
        payload_mapping_key: "invoice_number",
      },
    ]);
  };

  const handleEdit = (config: OcrConfig) => {
    setEditMode(config.id);
    setFormData({
      document_type: config.document_type,
      company_id: config.company_id,
      apply_at_transporter_level: config.apply_at_transporter_level,
      transporter_company_id: config.transporter_company_id || "",
      prompt: config.prompt,
    });
    setFields([...config.fields]);
  };

  const handleCancel = () => {
    setEditMode(null);
    setFormData({
      document_type: "",
      company_id: "",
      apply_at_transporter_level: false,
      transporter_company_id: "",
      prompt: "",
    });
    setFields([]);
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.company_id || !formData.document_type || fields.length === 0) {
        toast.error("Validation error", { description: "Please fill all required fields" });
        return;
      }

      if (formData.apply_at_transporter_level && !formData.transporter_company_id) {
        toast.error("Validation error", { description: "Transporter company ID is required when applying at transporter level" });
        return;
      }

      const payload = {
        document_type: formData.document_type,
        company_id: formData.company_id,
        apply_at_transporter_level: formData.apply_at_transporter_level,
        transporter_company_id: formData.apply_at_transporter_level ? formData.transporter_company_id : null,
        fields,
        prompt: formData.prompt,
      };

      let response;
      if (editMode === "new") {
        response = await fetch("/api/configs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`/api/configs/${editMode}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save config");
      }

      toast.success(editMode === "new" ? "Config created successfully" : "Config updated successfully");
      fetchConfigs();
      handleCancel();
    } catch (error: any) {
      toast.error("Failed to save config", { description: error.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this configuration?")) return;

    try {
      const response = await fetch(`/api/configs/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete config");
      toast.success("Config deleted successfully");
      fetchConfigs();
    } catch (error: any) {
      toast.error("Failed to delete config", { description: error.message });
    }
  };

  const addField = () => {
    setFields([
      ...fields,
      {
        field_label: "",
        field_key: "",
        data_type: "string",
        required: false,
        payload_mapping_key: null,
      },
    ]);
  };

  const updateField = (index: number, updates: Partial<OcrFieldConfig>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-slate-600">Loading configurations...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* List View */}
      {editMode === null && (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Configurations
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {configs.length} configuration(s) defined
              </p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Configuration
            </Button>
          </div>

          {configs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-600 mb-4">No configurations yet</p>
                <Button onClick={handleCreate}>Create First Configuration</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {configs.map((config) => (
                <Card key={config.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{config.document_type}</CardTitle>
                        <CardDescription>
                          Company: {config.company_id}
                          {config.transporter_company_id && ` • Transporter: ${config.transporter_company_id}`}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(config)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(config.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <strong className="text-sm">Fields ({config.fields.length}):</strong>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {config.fields.map((field, idx) => (
                            <Badge key={idx} variant="secondary">
                              {field.field_label} ({field.data_type})
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <strong className="text-sm">Prompt:</strong>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                          {config.prompt}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Edit/Create Form */}
      {editMode !== null && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editMode === "new" ? "Create New Configuration" : "Edit Configuration"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="document_type">Document Type *</Label>
                <Input
                  id="document_type"
                  value={formData.document_type}
                  onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                  placeholder="e.g., Freight Invoice, POD, LR"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_id">Company ID *</Label>
                <Input
                  id="company_id"
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                  placeholder="e.g., ABC_CORP"
                />
              </div>
            </div>

            {/* Transporter Level */}
            <div className="flex items-center space-x-2">
              <Switch
                id="apply_transporter"
                checked={formData.apply_at_transporter_level}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, apply_at_transporter_level: checked })
                }
              />
              <Label htmlFor="apply_transporter">Apply at Transporter Level</Label>
            </div>

            {formData.apply_at_transporter_level && (
              <div className="space-y-2">
                <Label htmlFor="transporter_id">Transporter Company ID *</Label>
                <Input
                  id="transporter_id"
                  value={formData.transporter_company_id}
                  onChange={(e) => setFormData({ ...formData, transporter_company_id: e.target.value })}
                  placeholder="e.g., XYZ_TRANSPORT"
                />
              </div>
            )}

            {/* Prompt */}
            <div className="space-y-2">
              <Label htmlFor="prompt">OpenAI Prompt *</Label>
              <Textarea
                id="prompt"
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                placeholder="Instructions for OpenAI on how to extract data..."
                rows={4}
              />
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Fields ({fields.length})</Label>
                <Button type="button" variant="outline" size="sm" onClick={addField}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>

              {fields.map((field, idx) => (
                <Card key={idx} className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Field Label *</Label>
                      <Input
                        value={field.field_label}
                        onChange={(e) => updateField(idx, { field_label: e.target.value })}
                        placeholder="e.g., Invoice Number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Field Key *</Label>
                      <Input
                        value={field.field_key}
                        onChange={(e) => updateField(idx, { field_key: e.target.value })}
                        placeholder="e.g., invoice_number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Data Type</Label>
                      <Select
                        value={field.data_type}
                        onValueChange={(value) => updateField(idx, { data_type: value as DataType })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="boolean">Boolean</SelectItem>
                          <SelectItem value="array">Array</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Payload Mapping</Label>
                      <Select
                        value={field.payload_mapping_key || "none"}
                        onValueChange={(value) =>
                          updateField(idx, {
                            payload_mapping_key: value === "none" ? null : (value as FreightPayloadKey),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {FREIGHT_PAYLOAD_KEYS.map((key) => (
                            <SelectItem key={key} value={key}>
                              {key}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Example Value</Label>
                      <Input
                        value={field.example_value || ""}
                        onChange={(e) => updateField(idx, { example_value: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={field.required}
                          onCheckedChange={(checked) => updateField(idx, { required: checked })}
                        />
                        <Label>Required</Label>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeField(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Configuration
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

