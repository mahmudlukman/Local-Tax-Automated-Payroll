import { useState, type FormEvent } from "react";
import {
  X,
  AlertCircle,
  Play,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Loader2,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";

export interface RunPayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: { month: number; year: number }) => void;
  isLoading?: boolean;
  error?: string | null;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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
  const [step, setStep] = useState<1 | 2>(1);

  if (!isOpen) return null;

  const selectedMonthName = MONTHS[month - 1];

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    onSubmit({ month, year });
  }

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4 backdrop-blur-xs animate-in fade-in-50 duration-150">
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xl text-neutral-900 antialiased transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-neutral-200/80 px-5 py-4 bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white">
              <Play className="h-4 w-4 fill-current ml-0.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-neutral-900">
                Run Payroll
              </h2>
              <p className="text-[11px] text-neutral-500">
                Step {step} of 2 —{" "}
                {step === 1 ? "Select Period" : "Confirm Calculation"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-200/60 hover:text-neutral-700"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {step === 1 ? (
            /* STEP 1: PERIOD SELECTION */
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="month"
                    className="block text-xs font-semibold text-neutral-700"
                  >
                    Payroll Month
                  </label>
                  <div className="relative">
                    <select
                      id="month"
                      value={month}
                      onChange={(e) => setMonth(Number(e.target.value))}
                      className="w-full appearance-none rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 shadow-2xs"
                    >
                      {MONTHS.map((m, i) => (
                        <option key={m} value={i + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <Calendar className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="year"
                    className="block text-xs font-semibold text-neutral-700"
                  >
                    Year
                  </label>
                  <select
                    id="year"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 shadow-2xs"
                  >
                    {getYearOptions().map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Information Card */}
              <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3.5 text-xs text-neutral-600 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-neutral-800">
                  <HelpCircle className="h-4 w-4 text-neutral-500" />
                  <span>What happens next?</span>
                </div>
                <p className="text-[11px] leading-relaxed text-neutral-500">
                  Calculates every active employee for{" "}
                  <strong>
                    {selectedMonthName} {year}
                  </strong>{" "}
                  and generates a draft payslip with tax relief and pension
                  calculations.
                </p>
              </div>
            </div>
          ) : (
            /* STEP 2: SUMMARY CONFIRMATION */
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="rounded-xl border border-neutral-200/80 bg-neutral-50 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-200/60 pb-2.5">
                  <span className="text-xs font-medium text-neutral-500">
                    Target Period
                  </span>
                  <span className="text-xs font-bold text-neutral-900">
                    {selectedMonthName} {year}
                  </span>
                </div>

                <ul className="space-y-2 text-xs text-neutral-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                    <span>
                      Applies configured statutory tax rules & allowances.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                    <span>
                      Respects individual employee Pension & NHF opt-outs.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                    <span>
                      Generates draft payslips (safe to re-run anytime).
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* API Error Alert */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/70 p-3 text-xs text-red-800">
              <AlertCircle
                className="h-4 w-4 shrink-0 text-red-600 mt-0.5"
                strokeWidth={1.75}
              />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-neutral-200/80 pt-4">
            {step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Back
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Calculating...
                </>
              ) : step === 1 ? (
                <>
                  Next Step <ArrowRight className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 fill-current" /> Execute Run
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
