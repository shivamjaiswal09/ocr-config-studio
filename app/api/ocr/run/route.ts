/**
 * API Route: /api/ocr/run
 * POST: Execute OCR on a document using OpenAI and a stored config
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { runOcrWithOpenAI } from "@/lib/ocr/openaiOcr";
import { mapToFreightPayload } from "@/lib/ocr/mapping";
import { pdfToText } from "@/lib/ocr/pdfProcessor";
import { OcrConfig, RunOcrRequest, RunOcrResponse } from "@/types/ocr";

/**
 * POST /api/ocr/run
 * Body: RunOcrRequest
 * Executes OCR and returns structured results
 */
export async function POST(request: NextRequest) {
  let runId: string | null = null;

  try {
    const body: RunOcrRequest = await request.json();

    // Validate request - either inputText or imageData required
    if (!body.inputText && !body.imageData) {
      return NextResponse.json(
        { error: "Either inputText or imageData is required" },
        { status: 400 }
      );
    }

    // Handle PDF files - convert to text
    let processedInputText = body.inputText;
    let processedImageData = body.imageData;
    
    if (body.fileType === "application/pdf" && body.imageData) {
      try {
        // Extract base64 data (remove data URL prefix if present)
        const base64Data = body.imageData.includes(",") 
          ? body.imageData.split(",")[1] 
          : body.imageData;
        
        // Convert base64 to buffer
        const pdfBuffer = Buffer.from(base64Data, "base64");
        
        // Extract text from PDF
        const extractedText = await pdfToText(pdfBuffer);
        
        if (!extractedText || extractedText.trim() === "") {
          return NextResponse.json(
            { error: "Could not extract text from PDF. The PDF might be image-based or corrupted." },
            { status: 400 }
          );
        }
        
        // Use extracted text instead of image
        processedInputText = extractedText;
        processedImageData = undefined;
      } catch (pdfError: any) {
        console.error("PDF processing error:", pdfError);
        return NextResponse.json(
          { error: "Failed to process PDF file", details: pdfError.message },
          { status: 400 }
        );
      }
    }

    // Step 1: Resolve config
    let config: OcrConfig | null = null;

    if (body.configId) {
      // Lookup by config ID (preferred)
      const { data, error } = await supabase
        .from("ocr_configs")
        .select("*")
        .eq("id", body.configId)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: "Config not found", details: error?.message },
          { status: 404 }
        );
      }

      config = data as OcrConfig;
    } else {
      // Lookup by criteria
      if (!body.documentType || !body.companyId) {
        return NextResponse.json(
          { error: "Either configId or (documentType + companyId) must be provided" },
          { status: 400 }
        );
      }

      let query = supabase
        .from("ocr_configs")
        .select("*")
        .eq("document_type", body.documentType)
        .eq("company_id", body.companyId);

      // Add transporter filter
      if (body.transporterCompanyId) {
        query = query.eq("transporter_company_id", body.transporterCompanyId);
      } else {
        query = query.is("transporter_company_id", null);
      }

      const { data, error } = await query.single();

      if (error || !data) {
        return NextResponse.json(
          { 
            error: "Config not found", 
            details: `No config found for documentType="${body.documentType}", companyId="${body.companyId}", transporterCompanyId="${body.transporterCompanyId || null}"` 
          },
          { status: 404 }
        );
      }

      config = data as OcrConfig;
    }

    // Step 2: Create ocr_runs record with status 'pending'
    const runData = {
      config_id: config.id,
      document_type: config.document_type,
      company_id: config.company_id,
      transporter_company_id: config.transporter_company_id || null,
      file_url: body.fileUrl || null,
      status: "pending" as const,
    };

    const { data: runRecord, error: runInsertError } = await supabase
      .from("ocr_runs")
      .insert(runData)
      .select()
      .single();

    if (runInsertError || !runRecord) {
      console.error("Failed to create ocr_runs record:", runInsertError);
      return NextResponse.json(
        { error: "Failed to create OCR run record", details: runInsertError?.message },
        { status: 500 }
      );
    }

    runId = runRecord.id;

    // Step 3: Run OCR with OpenAI
    let ocrResult;
    try {
      ocrResult = await runOcrWithOpenAI({
        prompt: config.prompt,
        inputText: processedInputText,
        imageData: processedImageData,
        fields: config.fields,
      });
    } catch (ocrError: any) {
      console.error("OpenAI OCR error:", ocrError);

      // Update run record with error
      await supabase
        .from("ocr_runs")
        .update({
          status: "failed",
          error_message: ocrError.message || "OpenAI OCR failed",
          processed_at: new Date().toISOString(),
        })
        .eq("id", runId);

      return NextResponse.json(
        { 
          error: "OCR processing failed", 
          details: ocrError.message,
          runId 
        },
        { status: 500 }
      );
    }

    // Step 4: Map to freight payload
    let mappedPayload: Record<string, any> = {};
    try {
      mappedPayload = mapToFreightPayload(config.fields, ocrResult.parsedJson);
    } catch (mapError: any) {
      console.error("Mapping error:", mapError);
      // Continue with empty mapped payload if mapping fails
    }

    // Step 5: Update run record with success
    const updatePayload = {
      status: "success" as const,
      raw_response: ocrResult.parsedJson,
      mapped_payload: mappedPayload,
      processed_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("ocr_runs")
      .update(updatePayload)
      .eq("id", runId);

    if (updateError) {
      console.error("Failed to update ocr_runs record:", updateError);
      // Log but don't fail the request since OCR succeeded
    }

    // Step 6: Return response
    const response: RunOcrResponse = {
      runId: runId!,
      status: "success",
      mapped_payload: mappedPayload,
      raw_response: ocrResult.parsedJson,
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error("Error in POST /api/ocr/run:", error);

    // If we have a runId, update it with error
    if (runId) {
      await supabase
        .from("ocr_runs")
        .update({
          status: "failed",
          error_message: error.message || "Internal server error",
          processed_at: new Date().toISOString(),
        })
        .eq("id", runId);
    }

    return NextResponse.json(
      { error: "Internal server error", details: error.message, runId },
      { status: 500 }
    );
  }
}

