import { useState, type FormEvent } from 'react';
import { X, AlertCircle } from 'lucide-react';

export interface RunPayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: { month: number; year: number }) => void;
  isLoading?: boolean;
  error?: string | null;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const INPUT_CLASS =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500';

function getYearOptions(): number[] {
  const current = new Date().getFullYear();
  return [current - 1, current, current + 1];
}

export default function RunPayrollModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  error,
}: RunPayrollModalProps) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  if (!isOpen) return null;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({ month, year });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900">Run payroll</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="month" className="mb-1.5 block text-sm text-gray-700">
                Month
              </label>
              <select
                id="month"
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className={INPUT_CLASS}
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="year" className="mb-1.5 block text-sm text-gray-700">
                Year
              </label>
              <select
                id="year"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className={INPUT_CLASS}
              >
                {getYearOptions().map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Calculates every active employee for this period and generates a draft payslip
            for each. Safe to re-run while it's still a draft.
          </p>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Running…' : 'Run payroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}