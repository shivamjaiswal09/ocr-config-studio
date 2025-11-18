"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";
import { AuditTripResult } from "@/types/freightAudit";

interface ChargeBreakupTableProps {
  trip: AuditTripResult;
  onChargeAction: (chargeType: string, action: "accepted" | "rejected", comment?: string) => void;
  chargeActions: Record<string, "accepted" | "rejected" | null>;
}

export default function ChargeBreakupTable({
  trip,
  onChargeAction,
  chargeActions,
}: ChargeBreakupTableProps) {
  const [rejectedCharges, setRejectedCharges] = useState<Record<string, string>>({});
  const [showComment, setShowComment] = useState<Record<string, boolean>>({});

  const charges = [
    {
      type: "Base Freight",
      contracted: trip.proformaBaseFreight || 0,
      invoice: trip.invoiceBaseFreight,
      variance: trip.baseDiff || 0,
    },
    {
      type: "Additional Charges",
      contracted: trip.proformaAdditionalTotal || 0,
      invoice: trip.invoiceAdditionalTotal,
      variance: trip.additionalDiff || 0,
    },
    {
      type: "GST",
      contracted: trip.proformaGstAmount || 0,
      invoice: trip.invoiceGstAmount,
      variance: (trip.proformaGstAmount || 0) - trip.invoiceGstAmount,
    },
  ];

  const handleReject = (chargeType: string) => {
    setShowComment((prev) => ({ ...prev, [chargeType]: true }));
  };

  const handleRejectConfirm = (chargeType: string) => {
    const comment = rejectedCharges[chargeType] || "";
    onChargeAction(chargeType, "rejected", comment);
    setShowComment((prev) => ({ ...prev, [chargeType]: false }));
    setRejectedCharges((prev) => ({ ...prev, [chargeType]: "" }));
  };

  const handleAccept = (chargeType: string) => {
    onChargeAction(chargeType, "accepted");
    setShowComment((prev) => ({ ...prev, [chargeType]: false }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900">Charge Breakup</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">
                Charge Type
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">
                Contracted Amt
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">
                Invoice Amt
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">
                Variance (₹)
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {charges.map((charge, index) => {
              const action = chargeActions[charge.type];
              const isRejecting = showComment[charge.type];

              return (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{charge.type}</td>
                  <td className="px-4 py-3 text-sm text-right text-slate-600">
                    ₹{charge.contracted.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-900">
                    ₹{charge.invoice.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-sm font-medium ${
                        charge.variance > 0
                          ? "text-red-600"
                          : charge.variance < 0
                          ? "text-green-600"
                          : "text-slate-600"
                      }`}
                    >
                      {charge.variance > 0 ? "+" : ""}₹{Math.abs(charge.variance).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {action === "accepted" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          <Check className="w-3 h-3 mr-1" />
                          Accepted
                        </span>
                      ) : action === "rejected" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                          <X className="w-3 h-3 mr-1" />
                          Rejected
                        </span>
                      ) : isRejecting ? (
                        <div className="flex flex-col gap-2 items-end min-w-[200px]">
                          <Textarea
                            placeholder="Reason for rejection..."
                            value={rejectedCharges[charge.type] || ""}
                            onChange={(e) =>
                              setRejectedCharges((prev) => ({
                                ...prev,
                                [charge.type]: e.target.value,
                              }))
                            }
                            className="text-xs min-h-[60px]"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => {
                                setShowComment((prev) => ({ ...prev, [charge.type]: false }));
                                setRejectedCharges((prev) => ({ ...prev, [charge.type]: "" }));
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleRejectConfirm(charge.type)}
                            >
                              Confirm Reject
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs border-green-200 text-green-700 hover:bg-green-50"
                            onClick={() => handleAccept(charge.type)}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => handleReject(charge.type)}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

