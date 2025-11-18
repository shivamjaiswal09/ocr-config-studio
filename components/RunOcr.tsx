"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Play, Loader2 } from "lucide-react";
import { OcrConfig, RunOcrResponse } from "@/types/ocr";

export default function RunOcr() {
  const [configs, setConfigs] = useState<OcrConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [result, setResult] = useState<RunOcrResponse | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  // Auto-select first config when configs are loaded
  useEffect(() => {
    if (configs.length > 0 && !selectedConfigId) {
      setSelectedConfigId(configs[0].id);
    }
  }, [configs, selectedConfigId]);

  const fetchConfigs = async () => {
    try {
      setLoadingConfigs(true);
      const response = await fetch("/api/configs");
      if (!response.ok) throw new Error("Failed to fetch configs");
      const data = await response.json();
      setConfigs(data);
    } catch (error: any) {
      toast.error("Failed to load configs", { description: error.message });
    } finally {
      setLoadingConfigs(false);
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
      
      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleRunOcr = async () => {
    if (!selectedConfigId) {
      toast.error("Please select a configuration");
      return;
    }

    if (!selectedFile) {
      toast.error("Please upload a file");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      // Convert file to base64 for API
      const base64 = await fileToBase64(selectedFile!);
      const requestBody = {
        configId: selectedConfigId,
        imageData: base64,
        fileType: selectedFile.type,
      };

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
      
      // Keep file preview after OCR completes
      if (selectedFile && !filePreview) {
        if (selectedFile.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setFilePreview(e.target?.result as string);
          };
          reader.readAsDataURL(selectedFile);
        } else if (selectedFile.type === "application/pdf") {
          // For PDFs, show a placeholder or extract first page
          setFilePreview(null); // PDF preview can be added later if needed
        }
      }
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
            {loadingConfigs ? (
              <div className="flex items-center justify-center h-10 border rounded-md bg-slate-50">
                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                <span className="ml-2 text-sm text-slate-500">Loading configurations...</span>
              </div>
            ) : configs.length === 0 ? (
              <div className="p-3 border rounded-md bg-slate-50 text-sm text-slate-600">
                No configurations available. Please create one in the Config Management tab.
              </div>
            ) : (
              <Select value={selectedConfigId} onValueChange={setSelectedConfigId}>
                <SelectTrigger id="config" className="w-full">
                  <SelectValue placeholder="Select a configuration" />
                </SelectTrigger>
                <SelectContent className="z-[100] max-h-[300px]">
                  {configs.map((config) => (
                    <SelectItem key={config.id} value={config.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{config.document_type}</span>
                        <span className="text-xs text-slate-500">
                          {config.company_id}
                          {config.transporter_company_id && ` • ${config.transporter_company_id}`}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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

          {/* File Upload */}
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
                        setFilePreview(null);
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

          {/* Run Button */}
          <Button
            onClick={handleRunOcr}
            disabled={loading || !selectedConfigId || !selectedFile}
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
            <Tabs defaultValue="document" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="document">📄 Document</TabsTrigger>
                <TabsTrigger value="raw">Raw JSON</TabsTrigger>
              </TabsList>

              {/* Document Preview Tab */}
              <TabsContent value="document" className="mt-4">
                {filePreview ? (
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900">
                      <img 
                        src={filePreview} 
                        alt="Uploaded document" 
                        className="w-full h-auto max-h-[600px] object-contain"
                      />
                    </div>
                    {selectedFile && (
                      <div className="text-xs text-slate-500">
                        <p><strong>File:</strong> {selectedFile.name}</p>
                        <p><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
                        <p><strong>Type:</strong> {selectedFile.type}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <p>No document preview available</p>
                  </div>
                )}
              </TabsContent>

              {/* Raw JSON Tab */}
              <TabsContent value="raw" className="mt-4">
                <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded text-xs overflow-x-auto max-h-[500px] overflow-y-auto">
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

