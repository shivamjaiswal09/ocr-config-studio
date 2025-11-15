import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfigManagement } from "@/components/config/ConfigManagement";
import { RunOcr } from "@/components/ocr/RunOcr";
import { Settings, Play } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("config");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />

      <main className="flex-1 container mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="mb-6">
            <TabsTrigger value="config" className="gap-2">
              <Settings className="h-4 w-4" />
              Config Management
            </TabsTrigger>
            <TabsTrigger value="run" className="gap-2">
              <Play className="h-4 w-4" />
              Run OCR
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="flex-1 mt-0">
            <ConfigManagement />
          </TabsContent>

          <TabsContent value="run" className="flex-1 mt-0">
            <RunOcr />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
