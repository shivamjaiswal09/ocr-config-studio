# Freight Audit Backend PoC - Implementation Summary

## Overview

This PoC wires together the existing OCR service with a static Proforma dataset to enable end-to-end freight audit processing. When a user uploads an invoice PDF, the system:

1. Extracts structured invoice data using the existing OCR service
2. Matches invoice trips with Proforma records by `vehicleNumber`
3. Computes differences (base freight, additional charges, totals)
4. Returns audit results in the format expected by the UI

## Files Created

### Core Services

1. **`lib/freightAudit/staticProforma.ts`**
   - Static in-memory Proforma dataset with 3 records
   - Vehicle numbers: `MH12AB1234`, `MH12CD5678`, `MH12EF9012`
   - Includes base freight, additional charges (detention, toll, unloading), and GST

2. **`lib/freightAudit/freightAuditService.ts`**
   - Matching logic: finds Proforma records by `vehicleNumber` (normalized)
   - Difference computation: base freight diff, additional charges diff, total diff, percentage diff
   - Category assignment: `EXACT_MATCH`, `BASE_FREIGHT_DIFF`, `ADDITIONAL_CHARGES_DIFF`
   - Summary computation: counts and total difference amount

3. **`lib/freightAudit/ocrExtractionService.ts`**
   - Wraps existing OCR logic (`runOcrWithOpenAI`, `pdfToText`)
   - Normalizes OCR output to `ExtractedInvoice` format
   - Handles multiple OCR response formats (trips array, line_items, single trip, etc.)
   - Maps various field name variations (snake_case, camelCase, etc.)

### Types

4. **`types/freightAudit.ts`**
   - `ExtractedInvoice`: invoice number, date, trips array
   - `ExtractedInvoiceTrip`: vehicle number, origin/destination, base freight, additional charges, GST
   - `AuditTripResult`: matched Proforma data, differences, category
   - `AuditSummary`: trip counts by category, total difference amount
   - `FreightAuditResult`: complete audit result with invoice, summary, and trips

### API Endpoint

5. **`app/api/freight-audit/process/route.ts`**
   - POST endpoint: `/api/freight-audit/process`
   - Accepts multipart form data or JSON
   - Parameters:
     - `file`: PDF file (base64 data URL or FormData)
     - `clientId`, `branchId`, `transporterId`: metadata (optional, defaults provided)
     - `configId`: OCR config ID (optional)
     - `documentType`: for OCR config lookup (default: "Freight Invoice")
     - `companyId`: for OCR config lookup (defaults to clientId)

## API Usage

### JSON Request

```json
POST /api/freight-audit/process
Content-Type: application/json

{
  "file": "data:application/pdf;base64,JVBERi0xLjQK...",
  "clientId": "CNR-001",
  "branchId": "BR-001",
  "transporterId": "TRN-001",
  "configId": "optional-config-uuid",
  "documentType": "Freight Invoice"
}
```

### FormData Request

```javascript
const formData = new FormData();
formData.append('file', pdfFile);
formData.append('clientId', 'CNR-001');
formData.append('branchId', 'BR-001');
formData.append('transporterId', 'TRN-001');

fetch('/api/freight-audit/process', {
  method: 'POST',
  body: formData
});
```

### Response Format

```json
{
  "invoice": {
    "invoiceNumber": "INV-001",
    "invoiceDate": "2025-01-15",
    "trips": [
      {
        "vehicleNumber": "MH12AB1234",
        "origin": "Mumbai",
        "destination": "Pune",
        "lrNumber": "LR-001",
        "tripId": "TRIP-001",
        "baseFreight": 12000,
        "additionalCharges": {
          "detention": 0,
          "toll": 800,
          "unloading": 200
        },
        "gstAmount": 2380
      }
    ]
  },
  "summary": {
    "totalTrips": 1,
    "exactMatchTrips": 1,
    "baseDiffTrips": 0,
    "additionalDiffTrips": 0,
    "totalDifferenceAmount": 0
  },
  "trips": [
    {
      "proformaId": "PFR-1001",
      "tripId": "TRIP-001",
      "lrNumber": "LR-001",
      "vehicleNumber": "MH12AB1234",
      "origin": "Mumbai",
      "destination": "Pune",
      "proformaBaseFreight": 12000,
      "invoiceBaseFreight": 12000,
      "proformaAdditionalTotal": 1000,
      "invoiceAdditionalTotal": 1000,
      "proformaGstAmount": 2380,
      "invoiceGstAmount": 2380,
      "baseDiff": 0,
      "additionalDiff": 0,
      "totalDiff": 0,
      "diffPercent": 0,
      "category": "EXACT_MATCH"
    }
  ]
}
```

## Matching Logic

- Matches by `vehicleNumber` (case-insensitive, whitespace-normalized)
- If no match found: `proforma*` fields are `null`, category defaults to `BASE_FREIGHT_DIFF`
- If match found: computes all differences and assigns category based on:
  - `EXACT_MATCH`: baseDiff === 0 && additionalDiff === 0
  - `BASE_FREIGHT_DIFF`: baseDiff !== 0 && additionalDiff === 0
  - `ADDITIONAL_CHARGES_DIFF`: additionalDiff !== 0 (or both differ)

## OCR Output Normalization

The OCR extraction service handles multiple response formats:

1. **trips array**: `{ trips: [...] }`
2. **line_items array**: `{ line_items: [...] }`
3. **Single trip object**: `{ vehicle_number: "...", ... }`
4. **trip_data array**: `{ trip_data: [...] }`
5. **Root-level fields**: fallback to single trip from root

Field name variations handled:
- `vehicle_number`, `vehicleNumber`, `vehicle_no`, `vehicleNo`
- `base_freight`, `baseFreight`, `freight_charge`, `freightCharge`, `freight`
- `detention`, `detention_charge`, `detentionCharge`
- `toll`, `toll_charge`, `tollCharge`
- `unloading`, `unloading_charge`, `unloadingCharge`
- `gst_amount`, `gstAmount`, `gst`, `tax_amount`, `taxAmount`

## Static Proforma Dataset

Three hard-coded Proforma records:

1. **PFR-1001**: MH12AB1234, Mumbai → Pune
   - Base: ₹12,000, Additional: ₹1,000 (toll: 800, unloading: 200), GST: ₹2,380

2. **PFR-1002**: MH12CD5678, Mumbai → Bangalore
   - Base: ₹25,000, Additional: ₹3,200 (detention: 1500, toll: 1200, unloading: 500), GST: ₹5,040

3. **PFR-1003**: MH12EF9012, Pune → Hyderabad
   - Base: ₹18,000, Additional: ₹2,400 (detention: 800, toll: 900, unloading: 400, others: 300), GST: ₹5,352

## Next Steps (When Ready for Production)

1. **Replace Static Proforma**: Replace `STATIC_PROFORMA` import in `freightAuditService.ts` with a call to the real Get Proforma API
2. **Add Error Handling**: Enhance error handling for edge cases (missing OCR config, invalid PDF, etc.)
3. **Add Logging**: Add structured logging for audit operations
4. **Add Validation**: Validate invoice data before processing
5. **Add Caching**: Cache Proforma data if appropriate
6. **Add Tests**: Unit tests for matching logic and difference computation

## Integration with UI

The UI should call `/api/freight-audit/process` with:
- PDF file (as FormData or base64)
- Metadata (clientId, branchId, transporterId)
- Optional OCR config ID

The response can be directly used to:
- Display summary card (using `summary` object)
- Display trip comparison table (using `trips` array)
- Show invoice details (using `invoice` object)

## Notes

- The OCR service is reused as-is (no modifications to existing OCR code)
- All types are TypeScript for type safety
- Functions are pure where possible (easy to test)
- Code is commented for easy extension
- Error handling includes meaningful error messages

