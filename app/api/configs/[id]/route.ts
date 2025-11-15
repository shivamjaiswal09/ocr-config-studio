/**
 * API Route: /api/configs/[id]
 * PUT: Update an existing OCR config
 * DELETE: Delete an OCR config (cascades to ocr_runs)
 */

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { OcrConfig, UpdateConfigRequest } from "@/types/ocr";

/**
 * PUT /api/configs/[id]
 * Updates an existing OCR configuration
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: UpdateConfigRequest = await request.json();

    // Build update object with only provided fields
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.document_type !== undefined) {
      updates.document_type = body.document_type;
    }
    if (body.apply_at_transporter_level !== undefined) {
      updates.apply_at_transporter_level = body.apply_at_transporter_level;
    }
    if (body.transporter_company_id !== undefined) {
      updates.transporter_company_id = body.transporter_company_id;
    }
    if (body.fields !== undefined) {
      if (body.fields.length === 0) {
        return NextResponse.json(
          { error: "At least one field is required" },
          { status: 400 }
        );
      }
      updates.fields = body.fields;
    }
    if (body.prompt !== undefined) {
      if (body.prompt.trim() === "") {
        return NextResponse.json(
          { error: "Prompt cannot be empty" },
          { status: 400 }
        );
      }
      updates.prompt = body.prompt;
    }

    // Update in Supabase
    const { data, error } = await supabase
      .from("ocr_configs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error updating config:", error);

      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Config not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: "Failed to update config", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data as OcrConfig);
  } catch (error: any) {
    console.error("Error in PUT /api/configs/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/configs/[id]
 * Deletes an OCR configuration (cascades to associated ocr_runs)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Delete from Supabase (will cascade to ocr_runs)
    const { error } = await supabase
      .from("ocr_configs")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase error deleting config:", error);

      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Config not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: "Failed to delete config", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Config deleted successfully" });
  } catch (error: any) {
    console.error("Error in DELETE /api/configs/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

