-- OCR Templates table
CREATE TABLE IF NOT EXISTS ocr_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(255) NOT NULL,
    client_id VARCHAR(50) NOT NULL,
    branch_id VARCHAR(50) NOT NULL,
    transporter_id VARCHAR(50) NOT NULL,
    doc_type VARCHAR(50) NOT NULL CHECK (doc_type IN ('invoice', 'pod', 'lr', 'gate_pass', 'receipt')),
    version_number INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'deprecated')),
    template_json JSONB NOT NULL,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    deprecated_at TIMESTAMP,
    CONSTRAINT unique_ocr_template UNIQUE (client_id, branch_id, transporter_id, doc_type, version_number)
);

-- OCR Template Audit Log
CREATE TABLE IF NOT EXISTS ocr_template_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES ocr_templates(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'PUBLISH', 'DEPRECATE', 'ROLLBACK')),
    changes_json JSONB,
    performed_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor OCR Responses
CREATE TABLE IF NOT EXISTS vendor_ocr_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id VARCHAR(100) NOT NULL UNIQUE,
    template_id UUID REFERENCES ocr_templates(id) ON DELETE SET NULL,
    client_id VARCHAR(50) NOT NULL,
    branch_id VARCHAR(50) NOT NULL,
    transporter_id VARCHAR(50) NOT NULL,
    doc_type VARCHAR(50) NOT NULL,
    document_url TEXT,
    raw_response_json JSONB,
    canonical_json JSONB,
    latency_ms INTEGER NOT NULL,
    token_usage JSONB,
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error', 'timeout')),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for OCR tables
CREATE INDEX IF NOT EXISTS idx_ocr_templates_lookup ON ocr_templates(client_id, branch_id, transporter_id, doc_type, status);
CREATE INDEX IF NOT EXISTS idx_ocr_templates_status ON ocr_templates(status);
CREATE INDEX IF NOT EXISTS idx_ocr_templates_created ON ocr_templates(created_at);
CREATE INDEX IF NOT EXISTS idx_ocr_template_audit_template ON ocr_template_audit(template_id);
CREATE INDEX IF NOT EXISTS idx_ocr_template_audit_created ON ocr_template_audit(created_at);
CREATE INDEX IF NOT EXISTS idx_vendor_responses_request ON vendor_ocr_responses(request_id);
CREATE INDEX IF NOT EXISTS idx_vendor_responses_template ON vendor_ocr_responses(template_id);
CREATE INDEX IF NOT EXISTS idx_vendor_responses_created ON vendor_ocr_responses(created_at);

