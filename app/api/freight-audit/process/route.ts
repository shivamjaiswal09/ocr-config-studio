/**
 * API Route: /api/freight-audit/process
 * POST: Process invoice PDF, extract data via OCR, match with Proforma, and compute differences
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseAvailable } from "@/lib/supabaseClient";
import { OcrConfig } from "@/types/ocr";
import { extractInvoiceFromBase64 } from "@/lib/freightAudit/ocrExtractionService";
import { runFreightAudit } from "@/lib/freightAudit/freightAuditService";
import { STATIC_PROFORMA } from "@/lib/freightAudit/staticProforma";
import { FreightAuditResult } from "@/types/freightAudit";

/**
 * POST /api/freight-audit/process
 * 
 * Accepts multipart form data or JSON:
 * - file: PDF file (as base64 data URL or FormData)
 * - clientId: Client ID (optional, defaults to CNR-001)
 * - branchId: Branch ID (optional, defaults to BR-001)
 * - transporterId: Transporter ID (optional, defaults to TRN-001)
 * - configId: OCR config ID (optional, if not provided will lookup by documentType/companyId)
 * - documentType: Document type for OCR config lookup (default: "Freight Invoice")
 * - companyId: Company ID for OCR config lookup (defaults to clientId)
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request - handle both multipart form data and JSON
    let fileBase64: string | null = null;
    let clientId = "CNR-001";
    let branchId = "BR-001";
    let transporterId = "TRN-001";
    let configId: string | undefined;
    let documentType = "Freight Invoice";
    let companyId: string | undefined;

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Handle FormData
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const clientIdForm = formData.get("clientId") as string | null;
      const branchIdForm = formData.get("branchId") as string | null;
      const transporterIdForm = formData.get("transporterId") as string | null;
      const configIdForm = formData.get("configId") as string | null;
      const documentTypeForm = formData.get("documentType") as string | null;
      const companyIdForm = formData.get("companyId") as string | null;

      if (!file) {
        return NextResponse.json(
          { error: "File is required" },
          { status: 400 }
        );
      }

      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fileBase64 = `data:application/pdf;base64,${buffer.toString("base64")}`;

      if (clientIdForm) clientId = clientIdForm;
      if (branchIdForm) branchId = branchIdForm;
      if (transporterIdForm) transporterId = transporterIdForm;
      if (configIdForm) configId = configIdForm;
      if (documentTypeForm) documentType = documentTypeForm;
      if (companyIdForm) companyId = companyIdForm;
    } else {
      // Handle JSON
      const body = await request.json();

      if (!body.file && !body.imageData) {
        return NextResponse.json(
          { error: "File (file or imageData) is required" },
          { status: 400 }
        );
      }

      // Support both 'file' (base64) and 'imageData' (for compatibility with OCR API)
      fileBase64 = body.file || body.imageData;

      if (body.clientId) clientId = body.clientId;
      if (body.branchId) branchId = body.branchId;
      if (body.transporterId) transporterId = body.transporterId;
      if (body.configId) configId = body.configId;
      if (body.documentType) documentType = body.documentType;
      if (body.companyId) companyId = body.companyId;
    }

    if (!fileBase64) {
      return NextResponse.json(
        { error: "File data is required" },
        { status: 400 }
      );
    }

    // Use companyId if provided, otherwise use clientId
    const lookupCompanyId = companyId || clientId;

    // Step 1: Resolve OCR config
    let config: OcrConfig | null = null;

    // Helper function to create default OCR config
    const createDefaultConfig = (): OcrConfig => {
      const defaultFields = [
        {
          field_label: "Invoice Number",
          field_key: "invoice_number",
          data_type: "string" as const,
          required: true,
          payload_mapping_key: "invoice_number" as const,
        },
        {
          field_label: "Invoice Date",
          field_key: "invoice_date",
          data_type: "date" as const,
          required: true,
          payload_mapping_key: "invoice_date" as const,
        },
        {
          field_label: "Vehicle Number",
          field_key: "vehicle_number",
          data_type: "string" as const,
          required: true,
          payload_mapping_key: "vehicle_number" as const,
        },
        {
          field_label: "Base Freight",
          field_key: "base_freight",
          data_type: "number" as const,
          required: true,
          payload_mapping_key: null,
        },
        {
          field_label: "Additional Charges",
          field_key: "additional_charges",
          data_type: "array" as const,
          required: false,
          payload_mapping_key: null,
        },
        {
          field_label: "GST Amount",
          field_key: "gst_amount",
          data_type: "number" as const,
          required: true,
          payload_mapping_key: "tax_amount" as const,
        },
      ];

      const defaultPrompt = `Extract all information from this freight invoice document. 
Focus on extracting:
- Invoice number and date
- Vehicle number(s) and trip details
- Base freight charges
- Additional charges (detention, toll, unloading, etc.)
- GST/tax amounts
- Origin and destination locations
- LR numbers and trip IDs

Return the data as JSON with trips as an array if multiple trips exist, or as a single trip object if only one trip is present.`;

      return {
        id: "default",
        document_type: documentType,
        company_id: lookupCompanyId,
        apply_at_transporter_level: false,
        transporter_company_id: null,
        fields: defaultFields,
        prompt: defaultPrompt,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as OcrConfig;
    };

    // If Supabase is not available, use default config
    if (!isSupabaseAvailable()) {
      console.log("Supabase not configured, using default OCR config");
      config = createDefaultConfig();
    } else if (configId) {
      // Lookup by config ID (preferred)
      const { data, error } = await supabase
        .from("ocr_configs")
        .select("*")
        .eq("id", configId)
        .single();

      if (error || !data) {
        console.log("OCR config not found by ID, using default");
        config = createDefaultConfig();
      } else {
        config = data as OcrConfig;
      }
    } else {
      // Lookup by criteria (documentType + companyId)
      // Try with transporter filter first
      const { data: transporterConfig, error: transporterError } = await supabase
        .from("ocr_configs")
        .select("*")
        .eq("document_type", documentType)
        .eq("company_id", lookupCompanyId)
        .eq("transporter_company_id", transporterId)
        .single();

      if (!transporterError && transporterConfig) {
        config = transporterConfig as OcrConfig;
      } else {
        // Fallback: try without transporter filter
        const { data: generalConfig, error: generalError } = await supabase
          .from("ocr_configs")
          .select("*")
          .eq("document_type", documentType)
          .eq("company_id", lookupCompanyId)
          .is("transporter_company_id", null)
          .single();

        if (generalError || !generalConfig) {
          // Try to create default config in Supabase, but fallback to in-memory if that fails
          console.log(`No OCR config found, creating default for ${documentType} / ${lookupCompanyId}`);
          
          const defaultConfig = createDefaultConfig();
          
          try {
            const { data: newConfig, error: createError } = await supabase
              .from("ocr_configs")
              .insert({
                document_type: documentType,
                company_id: lookupCompanyId,
                apply_at_transporter_level: false,
                transporter_company_id: null,
                fields: defaultConfig.fields,
                prompt: defaultConfig.prompt,
              })
              .select()
              .single();

            if (!createError && newConfig) {
              config = newConfig as OcrConfig;
            } else {
              console.warn("Failed to save default config to Supabase, using in-memory config:", createError?.message);
              config = defaultConfig;
            }
          } catch (err) {
            console.warn("Error saving default config to Supabase, using in-memory config:", err);
            config = defaultConfig;
          }
        } else {
          config = generalConfig as OcrConfig;
        }
      }
    }

    // Step 2: Extract invoice data using OCR
    let extractedInvoice;
    try {
      console.log("Starting OCR extraction with config:", {
        documentType,
        companyId: lookupCompanyId,
        fieldsCount: config.fields.length,
      });
      
      extractedInvoice = await extractInvoiceFromBase64(fileBase64, {
        prompt: config.prompt,
        fields: config.fields,
      });
      
      console.log("OCR extraction successful:", {
        invoiceNumber: extractedInvoice.invoiceNumber,
        tripsCount: extractedInvoice.trips.length,
      });
    } catch (ocrError: any) {
      console.error("OCR extraction error:", ocrError);
      console.error("Error stack:", ocrError.stack);
      console.error("Error details:", {
        message: ocrError.message,
        name: ocrError.name,
        cause: ocrError.cause,
      });
      
      // Provide more helpful error messages
      let errorMessage = ocrError.message || "Unknown error during OCR extraction";
      if (errorMessage.includes("No trips found")) {
        errorMessage = "The invoice PDF was processed, but no trip information was found. Please ensure the PDF contains vehicle numbers, freight charges, or trip details.";
      } else if (errorMessage.includes("Could not extract text") || errorMessage.includes("image-based") || errorMessage.includes("scanned document")) {
        errorMessage = "This PDF appears to be image-based (scanned document). Currently, we only support text-based PDFs. Please use a PDF with selectable text, or convert the scanned PDF pages to images (PNG/JPEG) and upload those instead.";
      } else if (errorMessage.includes("corrupted") || errorMessage.includes("XRef") || errorMessage.includes("unsupported format")) {
        errorMessage = "The PDF file appears to be corrupted or in an unsupported format. Please try a different PDF file or ensure the file is not password-protected.";
      } else if (errorMessage.includes("OpenAI")) {
        errorMessage = "OCR processing failed. Please check your OpenAI API configuration and try again.";
      } else if (errorMessage.includes("parse PDF") || errorMessage.includes("Invalid MIME type")) {
        if (errorMessage.includes("Invalid MIME type")) {
          errorMessage = "OpenAI Vision API doesn't support PDF files directly. Please use a text-based PDF (with selectable text) or convert PDF pages to images (PNG/JPEG) first.";
        } else {
          errorMessage = "Failed to parse the PDF file. Please ensure the file is a valid PDF and try again.";
        }
      }
      
      return NextResponse.json(
        {
          error: "Failed to extract invoice data",
          details: errorMessage,
        },
        { status: 500 }
      );
    }

    // Step 3: Run freight audit (match with Proforma and compute differences)
    const auditResult: FreightAuditResult = runFreightAudit(
      extractedInvoice,
      STATIC_PROFORMA,
      {
        clientId,
        branchId,
        transporterId,
      }
    );

    // Step 4: Return result
    return NextResponse.json(auditResult);
  } catch (error: any) {
    console.error("Error in POST /api/freight-audit/process:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

