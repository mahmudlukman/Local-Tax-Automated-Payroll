import { useState, type FormEvent } from "react";
import { AlertCircle, Plus, Trash2, ShieldCheck, Layers } from "lucide-react";
import FormField, { INPUT_CLASS } from "../ui/FormField";
import Button from "../ui/Button";
import {
  EMPTY_TAX_CONFIG_FORM_VALUES,
  type PayeBand,
  type TaxConfigFormValues,
} from "../../@types";

export interface TaxConfigFormProps {
  initialValues?: TaxConfigFormValues;
  onSubmit: (values: TaxConfigFormValues) => void;
  isLoading?: boolean;
  error?: string | null;
}

// Rates are stored as fractions (0.08) but edited as human percentages (8)
const toPercent = (rate: number): number => {
  const pct = rate * 100;
  return Number.isNaN(pct) ? 0 : Math.round(pct * 100) / 100;
};

const fromPercent = (percent: number): number => {
  const val = percent / 100;
  return Number.isNaN(val) ? 0 : val;
};

function RateField({
  label,
  htmlFor,
  value,
  onChange,
}: {
  label: string;
  htmlFor: string;
  value: number;
  onChange: (rate: number) => void;
}) {
  return (
    <FormField label={label} htmlFor={htmlFor}>
      <div className="relative flex items-center">
        <input
          id={htmlFor}
          type="number"
          min={0}
          max={100}
          step={0.01}
          value={toPercent(value)}
          onChange={(e) =>
            onChange(fromPercent(parseFloat(e.target.value) || 0))
          }
          className={`${INPUT_CLASS} pr-8 font-mono text-xs`}
        />
        <span className="pointer-events-none absolute right-3 text-xs font-semibold text-neutral-400">
          %
        </span>
      </div>
    </FormField>
  );
}

export default function TaxConfigForm({
  initialValues = EMPTY_TAX_CONFIG_FORM_VALUES,
  onSubmit,
  isLoading = false,
  error,
}: TaxConfigFormProps) {
  const [values, setValues] = useState<TaxConfigFormValues>(initialValues);

  function update<K extends keyof TaxConfigFormValues>(
    key: K,
    value: TaxConfigFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function updateBand(index: number, patch: Partial<PayeBand>) {
    setValues((prev) => ({
      ...prev,
      payeBands: prev.payeBands.map((band, i) =>
        i === index ? { ...band, ...patch } : band,
      ),
    }));
  }

  function addBand() {
    setValues((prev) => ({
      ...prev,
      payeBands: [...prev.payeBands, { upTo: 0, rate: 0 }],
    }));
  }

  function removeBand(index: number) {
    if (values.payeBands.length <= 1) return;
    setValues((prev) => ({
      ...prev,
      payeBands: prev.payeBands.filter((_, i) => i !== index),
    }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    // Normalize last bracket: always open-ended (`upTo = null`)
    const payeBands = values.payeBands.map((band, i) => ({
      ...band,
      upTo: i === values.payeBands.length - 1 ? null : Number(band.upTo || 0),
    }));
    onSubmit({ ...values, payeBands });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 antialiased">
      {/* Section 1: Version Details */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-2">
          <ShieldCheck className="h-4 w-4 text-neutral-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
            1. Version Metadata
          </h2>
        </div>

        <FormField label="Version Label" htmlFor="label">
          <input
            id="label"
            type="text"
            required
            placeholder="e.g. Nigeria Tax Act 2025 (Jan 2026 Revision)"
            value={values.label}
            onChange={(e) => update("label", e.target.value)}
            className={`${INPUT_CLASS} text-xs`}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Effective From" htmlFor="effectiveFrom">
            <input
              id="effectiveFrom"
              type="date"
              required
              value={values.effectiveFrom}
              onChange={(e) => update("effectiveFrom", e.target.value)}
              className={`${INPUT_CLASS} text-xs`}
            />
          </FormField>
          <FormField label="Effective To (Optional)" htmlFor="effectiveTo">
            <input
              id="effectiveTo"
              type="date"
              value={values.effectiveTo ?? ""}
              onChange={(e) => update("effectiveTo", e.target.value || null)}
              className={`${INPUT_CLASS} text-xs`}
            />
          </FormField>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            id="isActive"
            type="checkbox"
            checked={values.isActive}
            onChange={(e) => update("isActive", e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
          />
          <label
            htmlFor="isActive"
            className="text-xs font-medium text-neutral-700"
          >
            Set as active configuration rule for upcoming payroll calculations
          </label>
        </div>
      </section>

      {/* Section 2: PAYE Progressive Tax Bands */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200/80 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-neutral-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              2. PAYE Tax Brackets (Annual)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            {values.payeBands.length}{" "}
            {values.payeBands.length === 1 ? "Tier" : "Tiers"}
          </span>
        </div>

        <div className="space-y-2.5">
          {values.payeBands.map((band, index) => {
            const isLast = index === values.payeBands.length - 1;
            return (
              <div
                key={index}
                className="flex items-center gap-2.5 rounded-lg border border-neutral-200/80 bg-neutral-50/50 p-2.5 shadow-2xs"
              >
                <span className="w-5 text-center font-mono text-xs font-semibold text-neutral-400">
                  #{index + 1}
                </span>

                <div className="flex-1">
                  {isLast ? (
                    <div className="flex h-9 items-center rounded-lg border border-dashed border-neutral-300 bg-white px-3 text-xs font-medium text-neutral-500">
                      Balance (Above previous bracket)
                    </div>
                  ) : (
                    <div className="relative flex items-center">
                      <span className="pointer-events-none absolute left-3 text-xs font-semibold text-neutral-400">
                        Up to ₦
                      </span>
                      <input
                        type="number"
                        min={0}
                        placeholder="Limit (Annual Amount)"
                        value={band.upTo ?? ""}
                        onChange={(e) =>
                          updateBand(index, {
                            upTo: parseFloat(e.target.value) || 0,
                          })
                        }
                        className={`${INPUT_CLASS} pl-12 font-mono text-xs`}
                      />
                    </div>
                  )}
                </div>

                <div className="relative flex w-28 shrink-0 items-center">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={toPercent(band.rate)}
                    onChange={(e) =>
                      updateBand(index, {
                        rate: fromPercent(parseFloat(e.target.value) || 0),
                      })
                    }
                    className={`${INPUT_CLASS} pr-7 font-mono text-xs`}
                  />
                  <span className="pointer-events-none absolute right-3 text-xs font-semibold text-neutral-400">
                    %
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => removeBand(index)}
                  disabled={values.payeBands.length <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Remove tax bracket"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addBand}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 transition-colors"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          Add Tax Band
        </button>
      </section>

      {/* Section 3: Statutory Contributions & Deductions */}
      <section className="space-y-4">
        <div className="border-b border-neutral-200/80 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
            3. Statutory Rates & Exemptions
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RateField
            label="Rent Relief Rate"
            htmlFor="rentReliefRate"
            value={values.rentReliefRate}
            onChange={(r) => update("rentReliefRate", r)}
          />

          <FormField label="Rent Relief Annual Cap (₦)" htmlFor="rentReliefCap">
            <input
              id="rentReliefCap"
              type="number"
              min={0}
              value={values.rentReliefCap}
              onChange={(e) =>
                update("rentReliefCap", parseFloat(e.target.value) || 0)
              }
              className={`${INPUT_CLASS} font-mono text-xs`}
            />
          </FormField>

          <RateField
            label="Employee Pension Rate"
            htmlFor="pensionEmployeeRate"
            value={values.pensionEmployeeRate}
            onChange={(r) => update("pensionEmployeeRate", r)}
          />

          <RateField
            label="Employer Pension Rate"
            htmlFor="pensionEmployerRate"
            value={values.pensionEmployerRate}
            onChange={(r) => update("pensionEmployerRate", r)}
          />

          <RateField
            label="NHF Contribution Rate"
            htmlFor="nhfRate"
            value={values.nhfRate}
            onChange={(r) => update("nhfRate", r)}
          />

          <RateField
            label="ITF Levy Rate"
            htmlFor="itfRate"
            value={values.itfRate}
            onChange={(r) => update("itfRate", r)}
          />

          <RateField
            label="NSITF Contribution Rate"
            htmlFor="nsitfRate"
            value={values.nsitfRate}
            onChange={(r) => update("nsitfRate", r)}
          />
        </div>
      </section>

      {/* Error Alert Display */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/70 p-3.5 text-xs text-red-900 shadow-2xs">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div className="space-y-0.5">
            <span className="font-semibold">Validation Error</span>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Footer Submit Action */}
      <div className="flex items-center justify-end border-t border-neutral-200/80 pt-4">
        <Button
          type="submit"
          isLoading={isLoading}
          className="text-xs font-semibold"
        >
          {isLoading ? "Saving Tax Version…" : "Save Tax Configuration"}
        </Button>
      </div>
    </form>
  );
}
