export type DataType = "string" | "number" | "date" | "boolean" | "array";

export interface FieldDefinition {
  id: string;
  label: string;
  key: string;
  dataType: DataType;
  required: boolean;
  exampleValue?: string;
  mappedPayloadKey?: string;
}

export interface OcrConfig {
  id: string;
  documentType: string;
  companyId: string;
  transporterCompanyId?: string;
  fields: FieldDefinition[];
  prompt: string;
  updatedAt: string;
}

export interface OcrResult {
  configId: string;
  fileName: string;
  extractedData: Record<string, any>;
  mappedPayload: Record<string, any>;
  rawJson: any;
}
