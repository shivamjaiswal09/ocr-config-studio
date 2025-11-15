import { useState } from "react";
import { OcrResult } from "@/types/config";
import { runOcr } from "@/lib/api";
import { OcrControls } from "./OcrControls";
import { DocumentPreview } from "./DocumentPreview";
import { OcrOutput } from "./OcrOutput";
import { toast } from "sonner";

export const RunOcr = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRun = async (configId: string, selectedFile: File) => {
    setIsProcessing(true);
    setFile(selectedFile);
    try {
      const ocrResult = await runOcr(configId, selectedFile);
      setResult(ocrResult);
      toast.success("OCR completed successfully");
    } catch (error) {
      toast.error("Failed to run OCR. Please check your configuration and try again.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <OcrControls onRun={handleRun} onClear={handleClear} isProcessing={isProcessing} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <DocumentPreview file={file} />
        <OcrOutput result={result} />
      </div>
    </div>
  );
};
