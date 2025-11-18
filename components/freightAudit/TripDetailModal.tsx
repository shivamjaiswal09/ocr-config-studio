"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, CheckCircle2, XCircle } from "lucide-react";
import { AuditTripResult } from "@/types/freightAudit";
import StatusBadge from "./StatusBadge";
import ChargeBreakupTable from "./ChargeBreakupTable";

interface TripDetailModalProps {
  trip: AuditTripResult;
  tripIndex: number;
  totalTrips: number;
  isOpen: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onTripAction: (action: "accepted" | "rejected") => void;
  onChargeAction: (chargeType: string, action: "accepted" | "rejected", comment?: string) => void;
  chargeActions: Record<string, "accepted" | "rejected" | null>;
  tripAction: "accepted" | "rejected" | null;
}

export default function TripDetailModal({
  trip,
  tripIndex,
  totalTrips,
  isOpen,
  onClose,
  onPrevious,
  onNext,
  onTripAction,
  onChargeAction,
  chargeActions,
  tripAction,
}: TripDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "audit">("details");

  const checks = [
    {
      label: "Origin - Destination",
      matched: trip.proformaBaseFreight !== null,
      contracted: trip.origin && trip.destination ? `${trip.origin} - ${trip.destination}` : "N/A",
      invoice: trip.origin && trip.destination ? `${trip.origin} - ${trip.destination}` : "N/A",
    },
    {
      label: "Base Freight",
      matched: trip.baseDiff === 0 || trip.baseDiff === null,
      contracted: trip.proformaBaseFreight !== null ? `₹${trip.proformaBaseFreight.toLocaleString()}` : "N/A",
      invoice: `₹${trip.invoiceBaseFreight.toLocaleString()}`,
      variance: trip.baseDiff,
    },
    {
      label: "Additional Charges",
      matched: trip.additionalDiff === 0 || trip.additionalDiff === null,
      contracted:
        trip.proformaAdditionalTotal !== null ? `₹${trip.proformaAdditionalTotal.toLocaleString()}` : "N/A",
      invoice: `₹${trip.invoiceAdditionalTotal.toLocaleString()}`,
      variance: trip.additionalDiff,
    },
    {
      label: "GST",
      matched: trip.proformaGstAmount !== null && trip.proformaGstAmount === trip.invoiceGstAmount,
      contracted: trip.proformaGstAmount !== null ? `₹${trip.proformaGstAmount.toLocaleString()}` : "N/A",
      invoice: `₹${trip.invoiceGstAmount.toLocaleString()}`,
      variance: trip.proformaGstAmount !== null ? trip.proformaGstAmount - trip.invoiceGstAmount : null,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-slate-200 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onPrevious} disabled={tripIndex === 0}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <DialogTitle className="text-lg font-semibold">Invoice Details</DialogTitle>
              <Button variant="ghost" size="sm" onClick={onNext} disabled={tripIndex === totalTrips - 1}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "details"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "audit"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            Audit Trail
          </button>
        </div>

        {activeTab === "details" && (
          <div className="space-y-6 py-4">
            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Docket No.</p>
                <p className="text-sm font-medium text-slate-900">{trip.tripId || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Status</p>
                <StatusBadge category={trip.category} />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Vehicle Number</p>
                <p className="text-sm font-medium text-slate-900">{trip.vehicleNumber}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">LR Number</p>
                <p className="text-sm font-medium text-slate-900">{trip.lrNumber || "N/A"}</p>
              </div>
            </div>

            {/* Checks Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Checks</h3>
              {checks.map((check, index) => (
                <div
                  key={index}
                  className="border border-slate-200 rounded-lg p-4 bg-slate-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900">{check.label}</span>
                    {check.matched ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Matched
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Unmatched
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate-500 mb-1">Contracted</p>
                      <p className="text-slate-900">{check.contracted}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Invoice</p>
                      <p className="text-slate-900">{check.invoice}</p>
                    </div>
                    {check.variance !== null && check.variance !== undefined && check.variance !== 0 && (
                      <div className="col-span-2">
                        <p className="text-slate-500 mb-1">Variance</p>
                        <p
                          className={`font-medium ${
                            check.variance > 0 ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {check.variance > 0 ? "+" : ""}₹{Math.abs(check.variance).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Cost Summary */}
            <div className="border border-slate-200 rounded-lg p-4 bg-white">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Cost Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Contracted cost</p>
                  <p className="text-sm font-medium text-slate-900">
                    ₹
                    {(
                      (trip.proformaBaseFreight || 0) +
                      (trip.proformaAdditionalTotal || 0) +
                      (trip.proformaGstAmount || 0)
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Invoice amount</p>
                  <p className="text-sm font-medium text-slate-900">
                    ₹
                    {(trip.invoiceBaseFreight + trip.invoiceAdditionalTotal + trip.invoiceGstAmount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Variance</p>
                  <p
                    className={`text-sm font-medium ${
                      trip.totalDiff && trip.totalDiff > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {trip.totalDiff !== null
                      ? `${trip.totalDiff > 0 ? "+" : ""}₹${Math.abs(trip.totalDiff).toLocaleString()}`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Charge Breakup */}
            <ChargeBreakupTable
              trip={trip}
              onChargeAction={onChargeAction}
              chargeActions={chargeActions}
            />
          </div>
        )}

        {activeTab === "audit" && (
          <div className="py-4">
            <p className="text-sm text-slate-600">Audit trail will be displayed here.</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-4">
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => onTripAction("rejected")}
          >
            Reject Trip
          </Button>
          <Button
            className="bg-slate-900 text-white hover:bg-slate-800"
            onClick={() => onTripAction("accepted")}
          >
            Approve Trip
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

