"use client";

interface VarianceCellProps {
  contracted: number | null;
  invoice: number;
  variance: number | null;
  showLabels?: boolean;
}

export default function VarianceCell({
  contracted,
  invoice,
  variance,
  showLabels = false,
}: VarianceCellProps) {
  if (contracted === null) {
    return (
      <div className="text-right">
        {showLabels && <div className="text-xs text-slate-500 mb-1">Invoice</div>}
        <div className="text-sm font-medium text-slate-900">₹{invoice.toLocaleString()}</div>
      </div>
    );
  }

  const hasVariance = variance !== null && variance !== 0;

  return (
    <div className="text-right">
      {showLabels && (
        <div className="text-xs text-slate-500 mb-1 space-y-0.5">
          <div>Contracted</div>
          <div>Invoice</div>
          {hasVariance && <div>Variance</div>}
        </div>
      )}
      <div className="space-y-0.5">
        <div className="text-xs text-slate-500 line-through">₹{contracted.toLocaleString()}</div>
        <div className="text-sm font-medium text-slate-900">₹{invoice.toLocaleString()}</div>
        {hasVariance && (
          <div
            className={`text-xs font-medium ${
              variance > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {variance > 0 ? "+" : ""}₹{Math.abs(variance).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}

