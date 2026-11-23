import { Download, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import type { ExportFormatOption } from "../../@types";

export interface ExportFormatPickerProps {
  formats: ExportFormatOption[];
  selected: string;
  onSelect: (formatId: string) => void;
  onExport: () => void;
  isExporting?: boolean;
  disabled?: boolean;
}

export default function ExportFormatPicker({
  formats,
  selected,
  onSelect,
  onExport,
  isExporting = false,
  disabled = false,
}: ExportFormatPickerProps) {
  const selectedFormat = formats.find((f) => f.id === selected);

  return (
    <div className="space-y-2 text-neutral-900 antialiased">
      <div className="flex flex-wrap items-end gap-3">
        {/* Format Select Dropdown */}
        <div className="min-w-60 flex-1 sm:flex-initial">
          <label
            htmlFor="exportFormat"
            className="mb-1.5 flex items-center justify-between text-xs font-semibold text-neutral-700"
          >
            <span>Bank Payroll Template</span>
          </label>
          <div className="relative">
            <select
              id="exportFormat"
              value={selected}
              disabled={disabled || isExporting}
              onChange={(e) => onSelect(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-neutral-900 shadow-2xs focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-60 transition-colors"
            >
              {formats.map((format) => (
                <option key={format.id} value={format.id}>
                  {format.label} {!format.verified ? "(Unverified)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Export Button */}
        <button
          type="button"
          onClick={onExport}
          disabled={disabled || isExporting}
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Generating File…
            </>
          ) : (
            <>
              <Download className="h-3.5 w-3.5 text-neutral-300" />
              Export Schedule
            </>
          )}
        </button>
      </div>

      {/* Selected Format Contextual Callout */}
      {selectedFormat && (
        <div className="mt-2">
          {!selectedFormat.verified ? (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200/80 bg-amber-50/60 p-2.5 text-[11px] text-amber-900 shadow-2xs">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
              <div className="space-y-0.5">
                <span className="font-semibold">Unverified Column Mapping</span>
                <p className="text-amber-700 leading-normal">
                  This custom layout has not been confirmed against real portal
                  upload specifications yet. Please verify field alignment
                  before transmitting.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>
                Verified format standard matching banking gateway specs.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
