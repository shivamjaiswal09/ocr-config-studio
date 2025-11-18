"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { FreightAuditResult } from "@/types/freightAudit";
import SummaryPanel from "./freightAudit/SummaryPanel";
import TripTable from "./freightAudit/TripTable";
import TripDetailModal from "./freightAudit/TripDetailModal";

export default function FreightAudit() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FreightAuditResult | null>(null);
  const [clientId, setClientId] = useState("CNR-001");
  const [branchId, setBranchId] = useState("BR-001");
  const [transporterId, setTransporterId] = useState("TRN-001");
  
  // Trip-level actions
  const [tripActions, setTripActions] = useState<Record<number, "accepted" | "rejected" | null>>({});
  
  // Charge-level actions (trip index -> charge type -> action)
  const [chargeActions, setChargeActions] = useState<Record<number, Record<string, "accepted" | "rejected" | null>>>({});
  
  // Modal state
  const [selectedTripIndex, setSelectedTripIndex] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Accept PDFs and image files
      const validTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
      ];
      
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a PDF or image file (PNG, JPEG, WebP)");
        return;
      }
      setSelectedFile(file);
      setResult(null);
      setTripActions({});
      setChargeActions({});
    }
  };

  const handleProcessInvoice = async () => {
    if (!selectedFile) {
      toast.error("Please upload an invoice file (PDF or image)");
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      setTripActions({});
      setChargeActions({});

      // Convert file to base64
      const base64 = await fileToBase64(selectedFile);

      // Call freight audit API
      const response = await fetch("/api/freight-audit/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: base64,
          clientId,
          branchId,
          transporterId,
          documentType: "Freight Invoice",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Freight audit processing failed");
      }

      const data: FreightAuditResult = await response.json();
      setResult(data);
      toast.success("Invoice processed successfully!");
    } catch (error: any) {
      console.error("Freight audit error:", error);
      const errorMessage = error.message || "An unknown error occurred";
      toast.error("Freight audit failed", { 
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleTripClick = (index: number) => {
    setSelectedTripIndex(index);
  };

  const handleTripAction = (index: number, action: "accepted" | "rejected") => {
    setTripActions((prev) => ({
      ...prev,
      [index]: action,
    }));
    toast.success(`Trip ${index + 1} ${action === "accepted" ? "accepted" : "rejected"}`);
  };

  const handleChargeAction = (
    tripIndex: number,
    chargeType: string,
    action: "accepted" | "rejected",
    comment?: string
  ) => {
    setChargeActions((prev) => ({
      ...prev,
      [tripIndex]: {
        ...(prev[tripIndex] || {}),
        [chargeType]: action,
      },
    }));
    toast.success(`${chargeType} ${action === "accepted" ? "accepted" : "rejected"}`);
  };

  const handleModalTripAction = (action: "accepted" | "rejected") => {
    if (selectedTripIndex !== null) {
      handleTripAction(selectedTripIndex, action);
    }
  };

  const handleModalChargeAction = (chargeType: string, action: "accepted" | "rejected", comment?: string) => {
    if (selectedTripIndex !== null) {
      handleChargeAction(selectedTripIndex, chargeType, action, comment);
    }
  };

  const handlePreviousTrip = () => {
    if (selectedTripIndex !== null && selectedTripIndex > 0) {
      setSelectedTripIndex(selectedTripIndex - 1);
    }
  };

  const handleNextTrip = () => {
    if (selectedTripIndex !== null && result && selectedTripIndex < result.trips.length - 1) {
      setSelectedTripIndex(selectedTripIndex + 1);
    }
  };

  const handleSubmitReview = () => {
    if (!result) return;

    const reviewedTrips = Object.keys(tripActions).length;
    const totalTrips = result.trips.length;

    if (reviewedTrips < totalTrips) {
      toast.warning(`Please review all ${totalTrips} trips before submitting`);
      return;
    }

    const acceptedCount = Object.values(tripActions).filter((a) => a === "accepted").length;
    const rejectedCount = Object.values(tripActions).filter((a) => a === "rejected").length;

    toast.success(
      `Review submitted: ${acceptedCount} accepted, ${rejectedCount} rejected`,
      { duration: 5000 }
    );
    
    // Here you would typically send the review to the backend
    console.log("Trip Actions:", tripActions);
    console.log("Charge Actions:", chargeActions);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="space-y-1">
                <Label htmlFor="clientId" className="text-xs text-slate-500">
                  Client ID
                </Label>
                <Input
                  id="clientId"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="CNR-001"
                  className="w-32 h-9"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="branchId" className="text-xs text-slate-500">
                  Branch ID
                </Label>
                <Input
                  id="branchId"
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  placeholder="BR-001"
                  className="w-32 h-9"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="transporterId" className="text-xs text-slate-500">
                  Transporter ID
                </Label>
                <Input
                  id="transporterId"
                  value={transporterId}
                  onChange={(e) => setTransporterId(e.target.value)}
                  placeholder="TRN-001"
                  className="w-32 h-9"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        {!result ? (
          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardContent className="p-12 text-center">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload Invoice to Begin</h3>
              <p className="text-sm text-slate-600 mb-6">
                Upload an invoice PDF or image (PNG, JPEG) to process and audit against Proforma records
              </p>
              <div className="flex flex-col items-center gap-4">
                <div className="space-y-1">
                  <Label htmlFor="file" className="text-xs text-slate-500">
                    Invoice File (PDF or Image)
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleFileChange}
                    className="w-64"
                  />
                </div>
                <Button
                  onClick={handleProcessInvoice}
                  disabled={loading || !selectedFile}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Invoice
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Summary Panel */}
            <SummaryPanel result={result} />

            {/* Trip Table */}
            <TripTable result={result} onTripClick={handleTripClick} />

            {/* Submit Review Button */}
            {Object.keys(tripActions).length > 0 && (
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitReview}
                  className="bg-slate-900 text-white hover:bg-slate-800 px-8"
                  size="lg"
                >
                  Submit Review
                </Button>
              </div>
            )}

            {/* Trip Detail Modal */}
            {selectedTripIndex !== null && result && (
              <TripDetailModal
                trip={result.trips[selectedTripIndex]}
                tripIndex={selectedTripIndex}
                totalTrips={result.trips.length}
                isOpen={selectedTripIndex !== null}
                onClose={() => setSelectedTripIndex(null)}
                onPrevious={handlePreviousTrip}
                onNext={handleNextTrip}
                onTripAction={handleModalTripAction}
                onChargeAction={handleModalChargeAction}
                chargeActions={chargeActions[selectedTripIndex] || {}}
                tripAction={tripActions[selectedTripIndex] || null}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
