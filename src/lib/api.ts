import { OcrConfig, OcrResult } from "@/types/config";

// Simulate async operations
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchConfigs = async (): Promise<OcrConfig[]> => {
  await delay(500);
  const stored = localStorage.getItem("ocr-configs");
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

export const saveConfig = async (config: OcrConfig): Promise<void> => {
  await delay(300);
  const configs = await fetchConfigs();
  const existingIndex = configs.findIndex((c) => c.id === config.id);
  
  if (existingIndex >= 0) {
    configs[existingIndex] = { ...config, updatedAt: new Date().toISOString() };
  } else {
    configs.push({ ...config, updatedAt: new Date().toISOString() });
  }
  
  localStorage.setItem("ocr-configs", JSON.stringify(configs));
};

export const deleteConfig = async (id: string): Promise<void> => {
  await delay(300);
  const configs = await fetchConfigs();
  const filtered = configs.filter((c) => c.id !== id);
  localStorage.setItem("ocr-configs", JSON.stringify(filtered));
};

export const runOcr = async (
  configId: string,
  file: File
): Promise<OcrResult> => {
  await delay(2000); // Simulate OCR processing time
  
  const configs = await fetchConfigs();
  const config = configs.find((c) => c.id === configId);
  
  if (!config) {
    throw new Error("Configuration not found");
  }

  // Generate mock extracted data based on config fields
  const extractedData: Record<string, any> = {};
  const mappedPayload: Record<string, any> = {};
  
  config.fields.forEach((field) => {
    let mockValue: any;
    
    switch (field.dataType) {
      case "string":
        mockValue = field.exampleValue || `Sample ${field.label}`;
        break;
      case "number":
        mockValue = field.exampleValue || Math.floor(Math.random() * 100000);
        break;
      case "date":
        mockValue = field.exampleValue || new Date().toISOString().split("T")[0];
        break;
      case "boolean":
        mockValue = Math.random() > 0.5;
        break;
      case "array":
        mockValue = ["Item 1", "Item 2", "Item 3"];
        break;
      default:
        mockValue = field.exampleValue || "Mock value";
    }
    
    extractedData[field.key] = mockValue;
    
    if (field.mappedPayloadKey && field.mappedPayloadKey !== "none") {
      mappedPayload[field.mappedPayloadKey] = mockValue;
    }
  });

  return {
    configId,
    fileName: file.name,
    extractedData,
    mappedPayload,
    rawJson: {
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        processedAt: new Date().toISOString(),
        configId,
        documentType: config.documentType,
        companyId: config.companyId,
        transporterCompanyId: config.transporterCompanyId,
      },
      extracted: extractedData,
      mapped: mappedPayload,
    },
  };
};
