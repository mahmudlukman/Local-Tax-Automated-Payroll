import { Download } from "lucide-react";
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
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label
          htmlFor="exportFormat"
          className="mb-1.5 block text-sm text-gray-700"
        >
          Bank file format
        </label>
        <select
          id="exportFormat"
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        >
          {formats.map((format) => (
            <option key={format.id} value={format.id}>
              {format.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={onExport}
        disabled={disabled || isExporting}
        className="flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Download className="h-4 w-4" strokeWidth={1.75} />
        {isExporting ? "Exporting…" : "Export"}
      </button>

      {selectedFormat && !selectedFormat.verified && (
        <p className="w-full text-xs text-gray-500">
          This column layout hasn't been confirmed against the bank's real
          template yet — check the file before uploading it.
        </p>
      )}
    </div>
  );
}
