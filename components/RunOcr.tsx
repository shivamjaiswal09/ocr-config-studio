"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Play, Loader2 } from "lucide-react";
import { OcrConfig, RunOcrResponse } from "@/types/ocr";

export default function RunOcr() {
  const [configs, setConfigs] = useState<OcrConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [inputMode, setInputMode] = useState<"text" | "file">("text");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RunOcrResponse | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await fetch("/api/configs");
      if (!response.ok) throw new Error("Failed to fetch configs");
      const data = await response.json();
      setConfigs(data);
    } catch (error: any) {
      toast.error("Failed to load configs", { description: error.message });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type", { 
          description: "Please upload a JPG, PNG, WebP, or PDF file" 
        });
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large", { 
          description: "Please upload a file smaller than 10MB" 
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleRunOcr = async () => {
    if (!selectedConfigId) {
      toast.error("Please select a configuration");
      return;
    }

    if (inputMode === "text" && !inputText.trim()) {
      toast.error("Please provide input text");
      return;
    }

    if (inputMode === "file" && !selectedFile) {
      toast.error("Please upload a file");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      let requestBody: any = {
        configId: selectedConfigId,
      };

      if (inputMode === "text") {
        requestBody.inputText = inputText;
      } else {
        // Convert file to base64 for API
        const base64 = await fileToBase64(selectedFile!);
        requestBody.imageData = base64;
        requestBody.fileType = selectedFile!.type;
      }

      const response = await fetch("/api/ocr/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "OCR processing failed");
      }

      const data: RunOcrResponse = await response.json();
      setResult(data);
      toast.success("OCR completed successfully!");
    } catch (error: any) {
      toast.error("OCR failed", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const selectedConfig = configs.find((c) => c.id === selectedConfigId);

  const loadSampleData = () => {
    setInputText(`FREIGHT INVOICE

Invoice Number: INV-2024-001
Invoice Date: 2024-01-15
Due Date: 2024-02-15

Consignor: ABC Corporation
123 Business Street
Mumbai, Maharashtra 400001
GST: 27AABCU9603R1ZM

Consignee: XYZ Retail Ltd
456 Market Road
Pune, Maharashtra 411001
GST: 27AACXZ1234E1ZN

Transporter: FastShip Logistics
LR Number: LR-2024-5678
Vehicle Number: MH 12 AB 1234

Origin: Mumbai
Destination: Pune
Weight: 500 KG

CHARGES:
Freight Charge: 5000.00
Loading Charge: 500.00
Unloading Charge: 300.00
CGST (9%): 522.00
SGST (9%): 522.00

Total Amount: 6844.00

Payment Terms: Net 30 Days
`);
    toast.info("Sample data loaded");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel: Input */}
      <Card>
        <CardHeader>
          <CardTitle>Run OCR</CardTitle>
          <CardDescription>Select configuration and provide document text</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Config Selection */}
          <div className="space-y-2">
            <Label htmlFor="config">Configuration *</Label>
            <Select value={selectedConfigId} onValueChange={setSelectedConfigId}>
              <SelectTrigger id="config">
                <SelectValue placeholder="Select a configuration" />
              </SelectTrigger>
              <SelectContent>
                {configs.map((config) => (
                  <SelectItem key={config.id} value={config.id}>
                    {config.document_type} - {config.company_id}
                    {config.transporter_company_id && ` (${config.transporter_company_id})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Config Info */}
          {selectedConfig && (
            <Card className="bg-slate-50 dark:bg-slate-900">
              <CardContent className="pt-4 space-y-2">
                <div>
                  <strong className="text-sm">Document Type:</strong>
                  <p className="text-sm text-slate-600">{selectedConfig.document_type}</p>
                </div>
                <div>
                  <strong className="text-sm">Fields ({selectedConfig.fields.length}):</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedConfig.fields.map((field, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {field.field_label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Input Mode Selector */}
          <div className="space-y-2">
            <Label>Input Method</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={inputMode === "text" ? "default" : "outline"}
                onClick={() => setInputMode("text")}
                className="flex-1"
              >
                📝 Text Input
              </Button>
              <Button
                type="button"
                variant={inputMode === "file" ? "default" : "outline"}
                onClick={() => setInputMode("file")}
                className="flex-1"
              >
                📁 Upload File
              </Button>
            </div>
          </div>

          {/* Text Input Mode */}
          {inputMode === "text" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="inputText">Document Text *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={loadSampleData}
                  className="text-xs"
                >
                  Load Sample
                </Button>
              </div>
              <Textarea
                id="inputText"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste or type document text here..."
                rows={15}
                className="font-mono text-sm"
              />
              <p className="text-xs text-slate-500">
                {inputText.length} characters
              </p>
            </div>
          )}

          {/* File Upload Mode */}
          {inputMode === "file" && (
            <div className="space-y-2">
              <Label htmlFor="fileUpload">Upload Document *</Label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-primary transition-colors">
                <input
                  id="fileUpload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="fileUpload" className="cursor-pointer">
                  {selectedFile ? (
                    <div className="space-y-2">
                      <div className="text-4xl">
                        {selectedFile.type.includes("pdf") ? "📄" : "🖼️"}
                      </div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedFile(null);
                        }}
                      >
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-4xl">📁</div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-slate-500">
                        JPG, PNG, WebP, or PDF (max 10MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Run Button */}
          <Button
            onClick={handleRunOcr}
            disabled={
              loading || 
              !selectedConfigId || 
              (inputMode === "text" && !inputText.trim()) ||
              (inputMode === "file" && !selectedFile)
            }
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run OCR
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Right Panel: Results */}
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>
            {result ? (
              <>
                <Badge variant={result.status === "success" ? "default" : "destructive"}>
                  {result.status}
                </Badge>
                <span className="ml-2 text-xs">Run ID: {result.runId}</span>
              </>
            ) : (
              "Results will appear here after running OCR"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!result ? (
            <div className="text-center py-12 text-slate-500">
              <p>No results yet</p>
              <p className="text-sm mt-2">Select a config and run OCR to see results</p>
            </div>
          ) : (
            <Tabs defaultValue="mapped" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mapped">Mapped Payload</TabsTrigger>
                <TabsTrigger value="raw">Raw JSON</TabsTrigger>
              </TabsList>

              <TabsContent value="mapped" className="mt-4">
                {result.mapped_payload && Object.keys(result.mapped_payload).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(result.mapped_payload).map(([key, value]) => (
                      <div key={key} className="border-b pb-2">
                        <strong className="text-sm text-slate-700 dark:text-slate-300">
                          {key}:
                        </strong>
                        <p className="text-sm text-slate-900 dark:text-white mt-1">
                          {value === null ? (
                            <span className="text-slate-400 italic">null</span>
                          ) : typeof value === "object" ? (
                            <pre className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-xs overflow-x-auto">
                              {JSON.stringify(value, null, 2)}
                            </pre>
                          ) : (
                            String(value)
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No mapped data</p>
                )}
              </TabsContent>

              <TabsContent value="raw" className="mt-4">
                <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded text-xs overflow-x-auto">
                  {JSON.stringify(result.raw_response, null, 2)}
                </pre>
              </TabsContent>
            </Tabs>
          )}

          {result?.error_message && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <strong className="text-sm text-red-700 dark:text-red-300">Error:</strong>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {result.error_message}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

