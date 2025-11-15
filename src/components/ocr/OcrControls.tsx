import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OcrConfig } from "@/types/config";
import { fetchConfigs } from "@/lib/api";
import { Upload, Loader2, X } from "lucide-react";

interface OcrControlsProps {
  onRun: (configId: string, file: File) => void;
  onClear: () => void;
  isProcessing: boolean;
}

export const OcrControls = ({ onRun, onClear, isProcessing }: OcrControlsProps) => {
  const [configs, setConfigs] = useState<OcrConfig[]>([]);
  const [documentType, setDocumentType] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [transporterCompanyId, setTransporterCompanyId] = useState("all");
  const [file, setFile] = useState<File | null>(null);
  const [availableTransporters, setAvailableTransporters] = useState<string[]>([]);

  useEffect(() => {
    loadConfigs();
  }, []);

  useEffect(() => {
    if (documentType && companyId) {
      const relevantConfigs = configs.filter(
        (c) => c.documentType === documentType && c.companyId === companyId
      );
      const transporters = relevantConfigs
        .map((c) => c.transporterCompanyId)
        .filter((t): t is string => t !== undefined);
      setAvailableTransporters(transporters);
      
      if (transporters.length === 0) {
        setTransporterCompanyId("all");
      }
    }
  }, [documentType, companyId, configs]);

  const loadConfigs = async () => {
    const data = await fetchConfigs();
    setConfigs(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRun = () => {
    if (!file) return;

    const matchingConfig = configs.find(
      (c) =>
        c.documentType === documentType &&
        c.companyId === companyId &&
        (transporterCompanyId === "all"
          ? !c.transporterCompanyId
          : c.transporterCompanyId === transporterCompanyId)
    );

    if (matchingConfig) {
      onRun(matchingConfig.id, file);
    }
  };

  const handleClearAll = () => {
    setDocumentType("");
    setCompanyId("");
    setTransporterCompanyId("all");
    setFile(null);
    onClear();
  };

  const documentTypes = [...new Set(configs.map((c) => c.documentType))];
  const companyIds = [...new Set(configs.map((c) => c.companyId))];

  const isValid = documentType && companyId && file;
  const configExists = configs.some(
    (c) =>
      c.documentType === documentType &&
      c.companyId === companyId &&
      (transporterCompanyId === "all"
        ? !c.transporterCompanyId
        : c.transporterCompanyId === transporterCompanyId)
  );

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">OCR Configuration & Upload</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="ocr-documentType">Document Type *</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger id="ocr-documentType">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ocr-companyId">Company ID *</Label>
          <Select value={companyId} onValueChange={setCompanyId}>
            <SelectTrigger id="ocr-companyId">
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companyIds.map((id) => (
                <SelectItem key={id} value={id}>
                  {id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ocr-transporter">Transporter Company ID</Label>
          <Select value={transporterCompanyId} onValueChange={setTransporterCompanyId}>
            <SelectTrigger id="ocr-transporter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All / Not Applicable</SelectItem>
              {availableTransporters.map((id) => (
                <SelectItem key={id} value={id}>
                  {id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Upload Document *</Label>
          <div className="flex gap-2">
            <Input
              id="file-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="flex-1"
            />
            {file && (
              <Button variant="outline" size="icon" onClick={() => setFile(null)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {file && (
            <p className="text-xs text-muted-foreground">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        {!configExists && documentType && companyId && (
          <div className="text-sm text-destructive">
            No configuration found for this combination. Please create one in Config Management.
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleRun}
            disabled={!isValid || !configExists || isProcessing}
            className="gap-2 flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running OCR...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Run OCR
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleClearAll} disabled={isProcessing}>
            Clear
          </Button>
        </div>
      </div>
    </Card>
  );
};
