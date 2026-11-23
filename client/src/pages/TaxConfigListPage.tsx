import { useState } from "react";
import {
  Plus,
  X,
  History,
  CheckCircle2,
  AlertCircle,
  FileCode,
} from "lucide-react";
import Button from "../components/ui/Button";
import TaxConfigForm from "../components/taxConfig/TaxConfigForm";
import { formatDate } from "../utils/formatDate";
import type { TaxConfigFormValues } from "../@types";
import {
  useListTaxConfigsQuery,
  useCreateTaxConfigMutation,
} from "../redux/features/taxConfig/taxConfigApi";

export default function TaxConfigListPage() {
  const [showForm, setShowForm] = useState(false);

  const {
    data: taxConfigs = [],
    isLoading,
    isError,
    error,
  } = useListTaxConfigsQuery();

  const [createTaxConfig, { isLoading: isCreating, error: createError }] =
    useCreateTaxConfigMutation();

  async function handleSubmit(values: TaxConfigFormValues) {
    try {
      await createTaxConfig(values).unwrap();
      setShowForm(false);
    } catch {
      // Error is caught and surfaced via createError variable
    }
  }

  const formError = createError
    ? ((createError as { data?: { message?: string } })?.data?.message ??
      "Failed to create new tax configuration version.")
    : null;

  // View: Creation Form
  if (showForm) {
    return (
      <div className="max-w-4xl space-y-6 antialiased">
        <div className="flex items-center justify-between border-b border-neutral-200/80 pb-4">
          <div>
            <h1 className="text-base font-bold text-neutral-900 tracking-tight">
              Create Statutory Tax Version
            </h1>
            <p className="text-xs text-neutral-500">
              Define income tax bands, Consolidated Relief Allowance (CRA), and
              exemption thresholds.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200/80 bg-white text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-colors"
            aria-label="Cancel and return to list"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-2xs">
          <TaxConfigForm
            onSubmit={handleSubmit}
            isLoading={isCreating}
            error={formError}
          />
        </div>
      </div>
    );
  }

  // View: Version History Listing
  return (
    <div className="space-y-6 text-neutral-900 antialiased">
      {/* Header & Primary Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base font-bold text-neutral-900 tracking-tight">
            Tax Engine Configurations
          </h1>
          <p className="text-xs text-neutral-500">
            Version history for statutory PAYE tax bands and statutory relief
            rules.
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="text-xs font-semibold"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          New Tax Version
        </Button>
      </div>

      {/* Statutory Engine Info Callout */}
      <div className="flex items-start gap-3 rounded-xl border border-neutral-200/80 bg-neutral-50 p-4 shadow-2xs">
        <History className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
        <div className="text-xs text-neutral-600 space-y-1">
          <span className="font-semibold text-neutral-900">
            PITA Compliance & Effective Dating
          </span>
          <p className="leading-relaxed">
            Payroll runs automatically lock to the tax configuration active
            during that pay period. Creating a new version will
            non-destructively version future calculations without altering past
            runs.
          </p>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white p-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="h-4 w-36 bg-neutral-100 rounded animate-pulse" />
                <div className="h-4 w-24 bg-neutral-100 rounded animate-pulse" />
                <div className="h-4 w-20 bg-neutral-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Alert */}
      {isError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/60 p-4 text-xs text-red-900 shadow-2xs">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div className="space-y-0.5">
            <span className="font-semibold">Failed to Load Tax Versions</span>
            <p className="text-red-700">
              {(error as { data?: { message?: string } })?.data?.message ??
                "An unexpected network error occurred."}
            </p>
          </div>
        </div>
      )}

      {/* Main Table View */}
      {!isLoading && !isError && (
        <>
          {taxConfigs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 p-10 text-center">
              <FileCode className="mx-auto h-8 w-8 text-neutral-300 stroke-[1.5]" />
              <h3 className="mt-2 text-xs font-semibold text-neutral-900">
                No Tax Rules Defined
              </h3>
              <p className="mt-0.5 text-xs text-neutral-500">
                Get started by creating your initial tax configuration version.
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="mt-4 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                Add First Version
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200/80 bg-neutral-50/70 text-[11px] font-semibold text-neutral-500">
                    <th className="px-4 py-3">Rule Version Label</th>
                    <th className="px-4 py-3">Effective From</th>
                    <th className="px-4 py-3">Effective To</th>
                    <th className="px-4 py-3 text-right">Engine Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {taxConfigs.map((config) => (
                    <tr
                      key={config._id}
                      className="hover:bg-neutral-50/60 transition-colors"
                    >
                      <td className="px-4 py-3.5 font-semibold text-neutral-900">
                        {config.label}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-600 font-mono text-[11px]">
                        {formatDate(config.effectiveFrom)}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-600 font-mono text-[11px]">
                        {config.effectiveTo
                          ? formatDate(config.effectiveTo)
                          : "Present (Ongoing)"}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {config.isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Active Rule
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600">
                            Historical
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
