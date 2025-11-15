import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface DocumentPreviewProps {
  file: File | null;
}

export const DocumentPreview = ({ file }: DocumentPreviewProps) => {
  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Document Preview</h3>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {!file ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Upload a document to preview it here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {file.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(file)}
                alt="Document preview"
                className="max-w-full h-auto rounded-lg border border-border"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-lg space-y-3">
                <FileText className="h-16 w-16 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    PDF preview not available in this demo
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
