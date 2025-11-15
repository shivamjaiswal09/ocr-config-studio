-- OCR Config Studio - Supabase Schema
-- Run this SQL in your Supabase SQL Editor to create the necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- OCR Configurations Table
CREATE TABLE IF NOT EXISTS ocr_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_type VARCHAR(100) NOT NULL,
  company_id VARCHAR(100) NOT NULL,
  apply_at_transporter_level BOOLEAN NOT NULL DEFAULT false,
  transporter_company_id VARCHAR(100),
  fields JSONB NOT NULL, -- Array of OcrFieldConfig
  prompt TEXT NOT NULL, -- OpenAI instruction prompt
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one config per (document_type, company_id, transporter_company_id)
  CONSTRAINT unique_config UNIQUE (document_type, company_id, transporter_company_id)
);

-- Create index for faster lookups
CREATE INDEX idx_ocr_configs_lookup ON ocr_configs(document_type, company_id, transporter_company_id);
CREATE INDEX idx_ocr_configs_company ON ocr_configs(company_id);

-- OCR Runs Table
CREATE TABLE IF NOT EXISTS ocr_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  config_id UUID NOT NULL REFERENCES ocr_configs(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  company_id VARCHAR(100) NOT NULL,
  transporter_company_id VARCHAR(100),
  file_url TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  raw_response JSONB,
  mapped_payload JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Create indexes for faster queries
CREATE INDEX idx_ocr_runs_config ON ocr_runs(config_id);
CREATE INDEX idx_ocr_runs_status ON ocr_runs(status);
CREATE INDEX idx_ocr_runs_created ON ocr_runs(created_at DESC);
CREATE INDEX idx_ocr_runs_company ON ocr_runs(company_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on ocr_configs
CREATE TRIGGER update_ocr_configs_updated_at
BEFORE UPDATE ON ocr_configs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE ocr_configs IS 'OCR configuration per document type, company, and optional transporter';
COMMENT ON TABLE ocr_runs IS 'Individual OCR execution records with raw and mapped results';
COMMENT ON COLUMN ocr_configs.fields IS 'JSON array of field configurations (field_label, field_key, data_type, required, example_value, payload_mapping_key)';
COMMENT ON COLUMN ocr_configs.prompt IS 'Custom OpenAI prompt for this configuration';
COMMENT ON COLUMN ocr_runs.raw_response IS 'Raw JSON response from OpenAI';
COMMENT ON COLUMN ocr_runs.mapped_payload IS 'Mapped data according to freight invoicing schema';

