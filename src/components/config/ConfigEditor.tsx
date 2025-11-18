import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { OcrConfig, FieldDefinition, DataType } from "@/types/config";
import { DOCUMENT_TYPES, PAYLOAD_FIELDS } from "@/lib/mockData";
import { Trash2, Plus, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConfigEditorProps {
  config?: OcrConfig;
  onSave: (config: OcrConfig) => void;
  onCancel: () => void;
}

export const ConfigEditor = ({ config, onSave, onCancel }: ConfigEditorProps) => {
  const [documentType, setDocumentType] = useState(config?.documentType || "");
  const [companyId, setCompanyId] = useState(config?.companyId || "");
  const [useTransporterLevel, setUseTransporterLevel] = useState(!!config?.transporterCompanyId);
  const [transporterCompanyId, setTransporterCompanyId] = useState(config?.transporterCompanyId || "");
  const [fields, setFields] = useState<FieldDefinition[]>(
    config?.fields || [
      {
        id: crypto.randomUUID(),
        label: "",
        key: "",
        dataType: "string",
        required: false,
        mappedPayloadKey: "none",
      },
    ]
  );
  const [prompt, setPrompt] = useState(
    config?.prompt ||
      "You are an OCR assistant. Extract the following fields and return JSON matching the mapped payload structure."
  );

  const addField = () => {
    setFields([
      ...fields,
      {
        id: crypto.randomUUID(),
        label: "",
        key: "",
        dataType: "string",
        required: false,
        mappedPayloadKey: "none",
      },
    ]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FieldDefinition>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleSave = () => {
    const configData: OcrConfig = {
      id: config?.id || crypto.randomUUID(),
      documentType,
      companyId,
      transporterCompanyId: useTransporterLevel ? transporterCompanyId : undefined,
      fields,
      prompt,
      updatedAt: new Date().toISOString(),
    };
    onSave(configData);
  };

  const isValid =
    documentType &&
    companyId &&
    (!useTransporterLevel || transporterCompanyId) &&
    fields.length > 0 &&
    fields.every((f) => f.label && f.key);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b border-border">
        <CardTitle>{config ? "Edit Configuration" : "New Configuration"}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto p-6 space-y-6">
        {/* Scope Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Configuration Scope</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type *</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger id="documentType">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyId">Company ID *</Label>
              <Input
                id="companyId"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                placeholder="e.g., COMP001"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="transporterLevel"
                checked={useTransporterLevel}
                onCheckedChange={setUseTransporterLevel}
              />
              <Label htmlFor="transporterLevel" className="cursor-pointer">
                Apply configuration at transporter level?
              </Label>
            </div>

            {useTransporterLevel && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="transporterCompanyId">Transporter Company ID *</Label>
                <Input
                  id="transporterCompanyId"
                  value={transporterCompanyId}
                  onChange={(e) => setTransporterCompanyId(e.target.value)}
                  placeholder="e.g., TRANS001"
                />
              </div>
            )}

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Config uniqueness is based on Document Type + Company ID + optional Transporter Company ID.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Fields Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Fields to Extract & Map</h3>
            <p className="text-xs text-muted-foreground">
              Define which fields the OCR should extract and how they map to your Freight Invoicing payload.
            </p>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`label-${field.id}`}>Field Label *</Label>
                    <Input
                      id={`label-${field.id}`}
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="e.g., Invoice Number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`key-${field.id}`}>Field Key *</Label>
                    <Input
                      id={`key-${field.id}`}
                      value={field.key}
                      onChange={(e) => updateField(field.id, { key: e.target.value })}
                      placeholder="e.g., invoice_number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`dataType-${field.id}`}>Data Type</Label>
                    <Select
                      value={field.dataType}
                      onValueChange={(value) =>
                        updateField(field.id, { dataType: value as DataType })
                      }
                    >
                      <SelectTrigger id={`dataType-${field.id}`}>
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
                    <Label htmlFor={`mappedKey-${field.id}`}>Map to Payload Field *</Label>
                    <Select
                      value={field.mappedPayloadKey || "none"}
                      onValueChange={(value) => updateField(field.id, { mappedPayloadKey: value })}
                    >
                      <SelectTrigger id={`mappedKey-${field.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYLOAD_FIELDS.map((pf) => (
                          <SelectItem key={pf.value} value={pf.value}>
                            {pf.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`example-${field.id}`}>Example Value</Label>
                    <Input
                      id={`example-${field.id}`}
                      value={field.exampleValue || ""}
                      onChange={(e) => updateField(field.id, { exampleValue: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>

                  <div className="flex items-end gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`required-${field.id}`}
                        checked={field.required}
                        onCheckedChange={(checked) =>
                          updateField(field.id, { required: checked as boolean })
                        }
                      />
                      <Label htmlFor={`required-${field.id}`} className="text-sm cursor-pointer">
                        Required
                      </Label>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeField(field.id)}
                      disabled={fields.length === 1}
                      className="ml-auto text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button variant="outline" onClick={addField} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Add Field
          </Button>
        </div>

        {/* Prompt Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">LLM Prompt Configuration</h3>
            <p className="text-xs text-muted-foreground">
              This prompt will be sent to OpenAI when processing documents using this configuration.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Instruction Prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
          </div>
        </div>
      </CardContent>

      <div className="border-t border-border p-6 flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!isValid}>
          Save Configuration
        </Button>
      </div>
    </Card>
  );
};
