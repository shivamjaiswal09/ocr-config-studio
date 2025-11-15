import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { OcrResult } from "@/types/config";
import { Copy, Download, FileText } from "lucide-react";
import { toast } from "sonner";

interface OcrOutputProps {
  result: OcrResult | null;
}

export const OcrOutput = ({ result }: OcrOutputProps) => {
  const handleCopyJson = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result.rawJson, null, 2));
      toast.success("JSON copied to clipboard");
    }
  };

  const handleDownloadJson = () => {
    if (result) {
      const blob = new Blob([JSON.stringify(result.rawJson, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ocr-result-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("JSON downloaded");
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Extracted Data</h3>
        {result && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyJson} className="gap-1">
              <Copy className="h-3 w-3" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadJson} className="gap-1">
              <Download className="h-3 w-3" />
              Download
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {!result ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 p-6">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Run OCR to see extracted data</p>
          </div>
        ) : (
          <Tabs defaultValue="structured" className="h-full flex flex-col">
            <TabsList className="mx-6 mt-4">
              <TabsTrigger value="structured">Structured View</TabsTrigger>
              <TabsTrigger value="raw">Raw JSON</TabsTrigger>
            </TabsList>

            <TabsContent value="structured" className="flex-1 overflow-auto p-6 mt-0">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                    Mapped Payload
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(result.mappedPayload).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between items-start p-3 rounded-lg bg-muted/50"
                      >
                        <div className="font-medium text-sm text-foreground">
                          {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </div>
                        <div className="text-sm text-muted-foreground text-right ml-4">
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                    Metadata
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Name:</span>
                      <span className="text-foreground font-medium">{result.fileName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Config ID:</span>
                      <span className="text-foreground font-mono">{result.configId}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="raw" className="flex-1 overflow-auto p-6 mt-0">
              <pre className="text-xs font-mono bg-muted/50 p-4 rounded-lg overflow-auto">
                {JSON.stringify(result.rawJson, null, 2)}
              </pre>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Card>
  );
};
