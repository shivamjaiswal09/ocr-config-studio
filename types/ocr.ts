/**
 * OCR Config Studio - Type Definitions
 * Domain model for OCR configuration and run management
 */

// Data types supported for OCR fields
export type DataType = "string" | "number" | "date" | "boolean" | "array";

// Status of an OCR run
export type OcrRunStatus = "pending" | "success" | "failed";

// Freight invoicing payload mapping keys - standardized schema
export const FREIGHT_PAYLOAD_KEYS = [
  "invoice_number",
  "invoice_date",
  "due_date",
  "consignor_name",
  "consignee_name",
  "transporter_name",
  "total_amount",
  "tax_amount",
  "lr_number",
  "vehicle_number",
  "origin_location",
  "destination_location",
  "line_items[]",
] as const;

export type FreightPayloadKey = (typeof FREIGHT_PAYLOAD_KEYS)[number];

/**
 * Field configuration for OCR extraction
 * Defines how a single field should be extracted and mapped
 */
export interface OcrFieldConfig {
  field_label: string; // Display name (e.g., "Invoice Number")
  field_key: string; // Internal key (e.g., "invoice_num")
  data_type: DataType;
  required: boolean;
  example_value?: string; // Optional example for better OCR prompting
  payload_mapping_key?: FreightPayloadKey | null; // Maps to standard freight schema
}

/**
 * Complete OCR configuration
 * Uniquely identified by (document_type, company_id, transporter_company_id)
 */
export interface OcrConfig {
  id: string; // UUID
  document_type: string; // e.g., "Freight Invoice", "POD", "LR"
  company_id: string; // Required - the company this config belongs to
  apply_at_transporter_level: boolean; // Whether this config is transporter-specific
  transporter_company_id?: string | null; // Required if apply_at_transporter_level is true
  fields: OcrFieldConfig[]; // Array of field configurations
  prompt: string; // OpenAI instruction prompt for this config
  created_at: string;
  updated_at: string;
}

/**
 * OCR run record
 * Represents a single execution of OCR on a document
 */
export interface OcrRun {
  id: string; // UUID
  config_id: string; // Foreign key to ocr_configs
  document_type: string;
  company_id: string;
  transporter_company_id?: string | null;
  file_url?: string | null; // For future file handling
  status: OcrRunStatus;
  raw_response?: any; // JSONB - raw OpenAI response
  mapped_payload?: any; // JSONB - mapped to freight schema
  error_message?: string | null;
  created_at: string;
  processed_at?: string | null;
}

/**
 * Request/Response types for API routes
 */

// POST /api/configs - Create config request
export interface CreateConfigRequest {
  document_type: string;
  company_id: string;
  apply_at_transporter_level: boolean;
  transporter_company_id?: string | null;
  fields: OcrFieldConfig[];
  prompt: string;
}

// PUT /api/configs/[id] - Update config request
export interface UpdateConfigRequest {
  document_type?: string;
  apply_at_transporter_level?: boolean;
  transporter_company_id?: string | null;
  fields?: OcrFieldConfig[];
  prompt?: string;
}

// POST /api/ocr/run - Run OCR request
export interface RunOcrRequest {
  configId?: string; // Preferred: use existing config
  documentType?: string; // Alternative: specify criteria
  companyId?: string;
  transporterCompanyId?: string | null;
  inputText?: string; // Plain text input
  imageData?: string; // Base64 encoded image data
  fileType?: string; // MIME type of uploaded file
  fileUrl?: string;
}

// POST /api/ocr/run - Run OCR response
export interface RunOcrResponse {
  runId: string;
  status: OcrRunStatus;
  mapped_payload?: any;
  raw_response?: any;
  error_message?: string;
}

