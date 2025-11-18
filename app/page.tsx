"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConfigManagement from "@/components/ConfigManagement";
import RunOcr from "@/components/RunOcr";
import FreightAudit from "@/components/FreightAudit";

export default function Home() {
  const [activeTab, setActiveTab] = useState("freight-audit");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            📄 OCR Config Studio
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage OCR configurations and run document extraction with OpenAI
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-6">
            <TabsTrigger value="freight-audit">🚚 Freight Audit</TabsTrigger>
            <TabsTrigger value="config">⚙️ Config Management</TabsTrigger>
            <TabsTrigger value="run">🚀 Run OCR</TabsTrigger>
          </TabsList>

          <TabsContent value="freight-audit" className="mt-0">
            <FreightAudit />
          </TabsContent>

          <TabsContent value="config" className="mt-0">
            <ConfigManagement />
          </TabsContent>

          <TabsContent value="run" className="mt-0">
            <RunOcr />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

