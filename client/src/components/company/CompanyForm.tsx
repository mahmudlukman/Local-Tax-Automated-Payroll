import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  Building,
  ShieldCheck,
  Info,
  Save,
} from "lucide-react";
import FormField, { INPUT_CLASS } from "../ui/FormField";
import Button from "../ui/Button";
import { NIGERIAN_STATES } from "../../utils/data";
import {
  EMPTY_COMPANY_FORM_VALUES,
  type CompanyFormValues,
} from "../../@types";

export interface CompanyFormProps {
  initialValues?: CompanyFormValues;
  onSubmit: (values: CompanyFormValues) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function CompanyForm({
  initialValues = EMPTY_COMPANY_FORM_VALUES,
  onSubmit,
  isLoading = false,
  error,
}: CompanyFormProps) {
  const [values, setValues] = useState<CompanyFormValues>(initialValues);

  function update<K extends keyof CompanyFormValues>(
    key: K,
    value: CompanyFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8 antialiased">
      {/* Error Alert Box */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50/60 p-3.5 text-xs text-red-900 shadow-2xs">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div className="space-y-0.5">
            <span className="font-semibold">
              Unable to Save Company Settings
            </span>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Section 1: General Organization Profile */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-2.5">
          <Building className="h-4 w-4 text-neutral-500" />
          <h2 className="text-xs font-semibold text-neutral-900 tracking-tight">
            Organization Identity & Location
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Company Name" htmlFor="name">
            <input
              id="name"
              required
              placeholder="e.g. Acme Corporation Nig. Ltd."
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              className={INPUT_CLASS}
            />
          </FormField>

          <FormField label="CAC RC / BN Number" htmlFor="rcNumber">
            <input
              id="rcNumber"
              placeholder="e.g. RC1234567"
              value={values.rcNumber}
              onChange={(e) => update("rcNumber", e.target.value)}
              className={INPUT_CLASS}
            />
          </FormField>

          <FormField label="Industry Sector" htmlFor="industry">
            <input
              id="industry"
              placeholder="e.g. Financial Services / Fintech"
              value={values.industry}
              onChange={(e) => update("industry", e.target.value)}
              className={INPUT_CLASS}
            />
          </FormField>

          <FormField label="Primary State" htmlFor="state">
            <select
              id="state"
              value={values.state}
              onChange={(e) => update("state", e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">Select operating state</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Registered Corporate Address" htmlFor="address">
          <input
            id="address"
            placeholder="e.g. Plot 12, Commercial Avenue, Victoria Island"
            value={values.address}
            onChange={(e) => update("address", e.target.value)}
            className={INPUT_CLASS}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Official Contact Email" htmlFor="contactEmail">
            <input
              id="contactEmail"
              type="email"
              placeholder="payroll@company.com"
              value={values.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
              className={INPUT_CLASS}
            />
          </FormField>

          <FormField label="Official Phone Number" htmlFor="contactPhone">
            <input
              id="contactPhone"
              placeholder="+234 800 000 0000"
              value={values.contactPhone}
              onChange={(e) => update("contactPhone", e.target.value)}
              className={INPUT_CLASS}
            />
          </FormField>
        </div>
      </section>

      {/* Section 2: Statutory Employer Contributions */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-2.5">
          <ShieldCheck className="h-4 w-4 text-neutral-500" />
          <h2 className="text-xs font-semibold text-neutral-900 tracking-tight">
            Statutory Employer Contributions (ITF & NSITF)
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* ITF Toggle Card */}
          <div
            onClick={() => update("itfApplicable", !values.itfApplicable)}
            className={`cursor-pointer rounded-xl border p-4 transition-all shadow-2xs ${
              values.itfApplicable
                ? "border-neutral-900 bg-neutral-900/5 ring-1 ring-neutral-900"
                : "border-neutral-200/80 bg-white hover:border-neutral-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-900">
                ITF (Industrial Training Fund)
              </span>
              <input
                type="checkbox"
                checked={values.itfApplicable}
                onChange={(e) => update("itfApplicable", e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-neutral-500 leading-relaxed">
              Mandatory 1% annual payroll contribution for employers with 5+
              staff or ₦50m+ annual turnover.
            </p>
          </div>

          {/* NSITF Toggle Card */}
          <div
            onClick={() => update("nsitfApplicable", !values.nsitfApplicable)}
            className={`cursor-pointer rounded-xl border p-4 transition-all shadow-2xs ${
              values.nsitfApplicable
                ? "border-neutral-900 bg-neutral-900/5 ring-1 ring-neutral-900"
                : "border-neutral-200/80 bg-white hover:border-neutral-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-900">
                NSITF (ECA Workplace Compensation)
              </span>
              <input
                type="checkbox"
                checked={values.nsitfApplicable}
                onChange={(e) => update("nsitfApplicable", e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-neutral-500 leading-relaxed">
              Mandatory 1% monthly gross payroll contribution under Employees’
              Compensation Act.
            </p>
          </div>
        </div>

        {/* Regulatory Guidance Callout */}
        <div className="flex items-start gap-2 rounded-lg bg-neutral-50 p-3 border border-neutral-200/60 text-[11px] text-neutral-600">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
          <span>
            Enabling these toggles automatically calculates statutory
            employer-side liabilities during monthly payroll runs without
            deducting from employee net pay.
          </span>
        </div>
      </section>

      {/* Form Submission Action Bar */}
      <div className="flex items-center justify-end border-t border-neutral-200/80 pt-4">
        <Button
          type="submit"
          isLoading={isLoading}
          className="text-xs font-semibold"
        >
          <Save className="h-3.5 w-3.5 stroke-[2]" />
          {isLoading ? "Saving Settings…" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
