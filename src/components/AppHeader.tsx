import { FileText } from "lucide-react";

export const AppHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-app-header-border bg-app-header-bg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">LLM OCR Studio</h1>
            <p className="text-xs text-muted-foreground">Freight Invoicing Document Processing</p>
          </div>
        </div>
      </div>
    </header>
  );
};
