/**
 * API Route: /api/configs
 * GET: List OCR configs with optional filters
 * POST: Create new OCR config
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { OcrConfig, CreateConfigRequest } from "@/types/ocr";

/**
 * GET /api/configs
 * Query params:
 * - documentType: Filter by document type
 * - companyId: Filter by company ID
 * - transporterCompanyId: Filter by transporter company ID
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const documentType = searchParams.get("documentType");
    const companyId = searchParams.get("companyId");
    const transporterCompanyId = searchParams.get("transporterCompanyId");

    // Build query
    let query = supabase.from("ocr_configs").select("*").order("created_at", { ascending: false });

    // Apply filters
    if (documentType) {
      query = query.eq("document_type", documentType);
    }
    if (companyId) {
      query = query.eq("company_id", companyId);
    }
    if (transporterCompanyId !== null && transporterCompanyId !== undefined) {
      query = query.eq("transporter_company_id", transporterCompanyId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error fetching configs:", error);
      
      // Check if error is HTML (404 page) - means Supabase URL is wrong
      if (typeof error.message === 'string' && error.message.includes('<!DOCTYPE html>')) {
        return NextResponse.json(
          { 
            error: "Failed to fetch configs", 
            details: "Supabase URL appears to be incorrect. Please verify SUPABASE_URL points to your Supabase project API endpoint (e.g., https://[project-ref].supabase.co)" 
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: "Failed to fetch configs", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data as OcrConfig[]);
  } catch (error: any) {
    console.error("Error in GET /api/configs:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/configs
 * Body: CreateConfigRequest
 * Creates a new OCR configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateConfigRequest = await request.json();

    // Validation
    if (!body.company_id) {
      return NextResponse.json(
        { error: "company_id is required" },
        { status: 400 }
      );
    }

    if (body.apply_at_transporter_level && !body.transporter_company_id) {
      return NextResponse.json(
        { error: "transporter_company_id is required when apply_at_transporter_level is true" },
        { status: 400 }
      );
    }

    if (!body.document_type || !body.fields || body.fields.length === 0) {
      return NextResponse.json(
        { error: "document_type and at least one field are required" },
        { status: 400 }
      );
    }

    if (!body.prompt || body.prompt.trim() === "") {
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 }
      );
    }

    // Prepare data for insertion
    const configData = {
      document_type: body.document_type,
      company_id: body.company_id,
      apply_at_transporter_level: body.apply_at_transporter_level,
      transporter_company_id: body.transporter_company_id || null,
      fields: body.fields,
      prompt: body.prompt,
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from("ocr_configs")
      .insert(configData)
      .select()
      .single();

    if (error) {
      console.error("Supabase error creating config:", error);
      
      // Check for unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json(
          { 
            error: "Config already exists", 
            details: "A configuration with this document_type, company_id, and transporter_company_id already exists" 
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to create config", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data as OcrConfig, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/configs:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

