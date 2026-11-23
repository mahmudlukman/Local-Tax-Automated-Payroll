import { useState, useEffect, type FormEvent, type ReactNode } from "react";
import {
  User,
  Briefcase,
  ShieldCheck,
  CreditCard,
  Building2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import SalaryStructureFields from "./SalaryStructureFields";
import {
  EMPTY_EMPLOYEE_FORM_VALUES,
  type EmployeeFormValues,
} from "../../@types";

export interface EmployeeFormProps {
  initialValues?: EmployeeFormValues;
  onSubmit: (values: EmployeeFormValues) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string | null;
  /** Label for the submit button, e.g. "Save employee" vs "Add employee" */
  submitLabel?: ReactNode;
}

type TabKey = "personal" | "employment" | "statutory" | "salary" | "bank";

interface TabConfig {
  id: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const TABS: TabConfig[] = [
  { id: "personal", label: "Personal Details", icon: User },
  { id: "employment", label: "Employment", icon: Briefcase },
  { id: "statutory", label: "Statutory & Tax", icon: ShieldCheck },
  { id: "salary", label: "Salary Structure", icon: CreditCard },
  { id: "bank", label: "Bank Details", icon: Building2 },
];

const INPUT_CLASS =
  "w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-colors shadow-2xs";

function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={htmlFor}
          className="block text-xs font-semibold text-neutral-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {hint && <span className="text-[11px] text-neutral-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export default function EmployeeForm({
  initialValues = EMPTY_EMPLOYEE_FORM_VALUES,
  onSubmit,
  onCancel,
  isLoading = false,
  error,
  submitLabel = "Save employee",
}: EmployeeFormProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("personal");
  const [values, setValues] = useState<EmployeeFormValues>(initialValues);

  // Sync state if initialValues changes asynchronously
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setValues(initialValues);
    });

    return () => cancelAnimationFrame(frame);
  }, [initialValues]);

  function update<K extends keyof EmployeeFormValues>(
    key: K,
    value: EmployeeFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(values);
  }

  const activeTabIndex = TABS.findIndex((tab) => tab.id === activeTab);
  const isLastTab = activeTabIndex === TABS.length - 1;
  const isFirstTab = activeTabIndex === 0;

  const goToNextTab = () => {
    if (!isLastTab) {
      setActiveTab(TABS[activeTabIndex + 1].id);
    }
  };

  const goToPrevTab = () => {
    if (!isFirstTab) {
      setActiveTab(TABS[activeTabIndex - 1].id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Navigation Tabs Header */}
      <div className="border-b border-neutral-200/80">
        <nav
          className="-mb-px flex space-x-1 overflow-x-auto scrollbar-none"
          aria-label="Form Sections"
        >
          {TABS.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isCompleted = idx < activeTabIndex;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition-all ${
                  isActive
                    ? "border-neutral-900 text-neutral-900"
                    : isCompleted
                      ? "border-transparent text-neutral-700 hover:border-neutral-300 hover:text-neutral-900"
                      : "border-transparent text-neutral-400 hover:border-neutral-300 hover:text-neutral-600"
                }`}
              >
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full transition-colors ${
                    isActive
                      ? "bg-neutral-900 text-white"
                      : isCompleted
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Icon className="h-3 w-3" strokeWidth={2} />
                  )}
                </div>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="min-h-[320px] py-2">
        {/* TAB 1: PERSONAL DETAILS */}
        {activeTab === "personal" && (
          <div className="animate-in fade-in-50 duration-150 space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="First Name" htmlFor="firstName" required>
                <input
                  id="firstName"
                  required
                  placeholder="e.g. Adewale"
                  value={values.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="Last Name" htmlFor="lastName" required>
                <input
                  id="lastName"
                  required
                  placeholder="e.g. Ciroma"
                  value={values.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="Work Email Address" htmlFor="email">
                <input
                  id="email"
                  type="email"
                  placeholder="adewale@company.com"
                  value={values.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="Phone Number" htmlFor="phone">
                <input
                  id="phone"
                  placeholder="+234 800 000 0000"
                  value={values.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
            </div>
          </div>
        )}

        {/* TAB 2: EMPLOYMENT DETAILS */}
        {activeTab === "employment" && (
          <div className="animate-in fade-in-50 duration-150 space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                label="Employee ID"
                htmlFor="employeeId"
                required
                hint="Unique organizational ID"
              >
                <input
                  id="employeeId"
                  required
                  placeholder="EMP-0001"
                  value={values.employeeId}
                  onChange={(e) => update("employeeId", e.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="Date of Hire" htmlFor="dateOfHire" required>
                <input
                  id="dateOfHire"
                  type="date"
                  required
                  value={values.dateOfHire}
                  onChange={(e) => update("dateOfHire", e.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="Job Title" htmlFor="jobTitle">
                <input
                  id="jobTitle"
                  placeholder="e.g. Senior Software Engineer"
                  value={values.jobTitle}
                  onChange={(e) => update("jobTitle", e.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="Department" htmlFor="department">
                <input
                  id="department"
                  placeholder="e.g. Engineering"
                  value={values.department}
                  onChange={(e) => update("department", e.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>
            </div>
          </div>
        )}

        {/* TAB 3: STATUTORY DETAILS */}
        {activeTab === "statutory" && (
          <div className="animate-in fade-in-50 duration-150 space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Tax Identification Number (TIN)" htmlFor="tin">
                <input
                  id="tin"
                  placeholder="10-digit TIN"
                  value={values.tin}
                  onChange={(e) => update("tin", e.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="Pension PIN" htmlFor="pensionPIN">
                <input
                  id="pensionPIN"
                  placeholder="PEN100XXXXXXXXX"
                  value={values.pensionPIN}
                  onChange={(e) => update("pensionPIN", e.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>

              <Field
                label="Pension Fund Administrator (PFA)"
                htmlFor="pensionFundAdministrator"
              >
                <input
                  id="pensionFundAdministrator"
                  placeholder="e.g. Stanbic IBTC Pension Managers"
                  value={values.pensionFundAdministrator}
                  onChange={(e) =>
                    update("pensionFundAdministrator", e.target.value)
                  }
                  className={INPUT_CLASS}
                />
              </Field>

              <Field
                label="State of Residence"
                htmlFor="stateOfResidence"
                hint="Used for PAYE remittance"
              >
                <input
                  id="stateOfResidence"
                  placeholder="e.g. Lagos State"
                  value={values.stateOfResidence}
                  onChange={(e) => update("stateOfResidence", e.target.value)}
                  className={INPUT_CLASS}
                />
              </Field>

              <Field
                label="Annual Rent Paid (₦)"
                htmlFor="annualRentPaid"
                hint="For statutory tax relief calculation"
              >
                <input
                  id="annualRentPaid"
                  type="number"
                  min={0}
                  placeholder="0.00"
                  value={values.annualRentPaid || ""}
                  onChange={(e) =>
                    update("annualRentPaid", Number(e.target.value))
                  }
                  className={INPUT_CLASS}
                />
              </Field>
            </div>

            <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4 space-y-3">
              <span className="block text-xs font-semibold text-neutral-800">
                Statutory Deductions Exemptions
              </span>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 text-xs text-neutral-700 hover:border-neutral-300 shadow-2xs">
                  <input
                    type="checkbox"
                    checked={values.pensionOptOut}
                    onChange={(e) => update("pensionOptOut", e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <div>
                    <span className="font-semibold text-neutral-900">
                      Pension Opt-Out
                    </span>
                    <p className="text-[11px] text-neutral-500">
                      Exempt employee from statutory pension contributions
                    </p>
                  </div>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 text-xs text-neutral-700 hover:border-neutral-300 shadow-2xs">
                  <input
                    type="checkbox"
                    checked={values.nhfOptOut}
                    onChange={(e) => update("nhfOptOut", e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  />
                  <div>
                    <span className="font-semibold text-neutral-900">
                      NHF Opt-Out
                    </span>
                    <p className="text-[11px] text-neutral-500">
                      Exempt employee from National Housing Fund contributions
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SALARY STRUCTURE */}
        {activeTab === "salary" && (
          <div className="animate-in fade-in-50 duration-150">
            <SalaryStructureFields
              value={values.salary}
              onChange={(salary) => update("salary", salary)}
            />
          </div>
        )}

        {/* TAB 5: BANK DETAILS */}
        {activeTab === "bank" && (
          <div className="animate-in fade-in-50 duration-150 space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Bank Name" htmlFor="bankName">
                <input
                  id="bankName"
                  placeholder="e.g. Zenith Bank"
                  value={values.bank.bankName ?? ""}
                  onChange={(e) =>
                    update("bank", { ...values.bank, bankName: e.target.value })
                  }
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="Bank Code" htmlFor="bankCode" hint="CBN Sort Code">
                <input
                  id="bankCode"
                  placeholder="e.g. 057"
                  value={values.bank.bankCode ?? ""}
                  onChange={(e) =>
                    update("bank", { ...values.bank, bankCode: e.target.value })
                  }
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="Account Number" htmlFor="accountNumber">
                <input
                  id="accountNumber"
                  placeholder="10-digit NUBAN"
                  value={values.bank.accountNumber ?? ""}
                  onChange={(e) =>
                    update("bank", {
                      ...values.bank,
                      accountNumber: e.target.value,
                    })
                  }
                  className={INPUT_CLASS}
                />
              </Field>

              <Field label="Account Name" htmlFor="accountName">
                <input
                  id="accountName"
                  placeholder="Verified account holder name"
                  value={values.bank.accountName ?? ""}
                  onChange={(e) =>
                    update("bank", {
                      ...values.bank,
                      accountName: e.target.value,
                    })
                  }
                  className={INPUT_CLASS}
                />
              </Field>
            </div>
          </div>
        )}
      </div>

      {/* Form Error Notice */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/70 p-3.5 text-xs text-red-800">
          <AlertCircle
            className="h-4 w-4 shrink-0 text-red-600"
            strokeWidth={1.75}
          />
          <span>{error}</span>
        </div>
      )}

      {/* Action Footer Bar */}
      <div className="flex items-center justify-between border-t border-neutral-200/80 pt-5">
        <div className="flex items-center gap-2">
          {!isFirstTab && (
            <button
              type="button"
              onClick={goToPrevTab}
              className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>
          )}

          {!isLastTab && (
            <button
              type="button"
              onClick={goToNextTab}
              className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-800 shadow-2xs hover:bg-neutral-50"
            >
              Next Step <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
