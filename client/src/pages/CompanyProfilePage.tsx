import { useState } from "react";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  MapPin,
  RefreshCw,
} from "lucide-react";
import CompanyForm from "../components/company/CompanyForm";
import type { CompanyFormValues } from "../@types";
import {
  useListCompaniesQuery,
  useUpdateCompanyMutation,
} from "../redux/features/company/companyApi";

export default function CompanyProfilePage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    data: companies,
    isLoading: isLoadingCompany,
    isError,
    error,
    refetch,
  } = useListCompaniesQuery();

  const [updateCompany, { isLoading: isSaving, error: saveError }] =
    useUpdateCompanyMutation();

  const company = companies?.[0];

  if (isLoadingCompany) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 text-neutral-900 antialiased">
        <div className="h-6 w-48 rounded bg-neutral-200 animate-pulse" />
        <div className="h-28 w-full rounded-xl bg-neutral-100 animate-pulse" />
        <div className="h-96 w-full rounded-xl bg-neutral-100 animate-pulse" />
      </div>
    );
  }

  if (isError || !company) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-neutral-200/80 bg-white p-8 text-center shadow-2xs antialiased">
        <AlertCircle className="mx-auto h-8 w-8 text-neutral-400" />
        <h3 className="mt-3 text-sm font-semibold text-neutral-900">
          Failed to Load Company Profile
        </h3>
        <p className="mt-1 text-xs text-neutral-500">
          {(error as { data?: { message?: string } })?.data?.message ??
            "There was a problem retrieving company settings."}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const initialValues: CompanyFormValues = {
    name: company.name,
    rcNumber: company.rcNumber,
    industry: company.industry,
    address: company.address,
    state: company.state,
    contactEmail: company.contactEmail,
    contactPhone: company.contactPhone,
    itfApplicable: company.itfApplicable,
    nsitfApplicable: company.nsitfApplicable,
  };

  async function handleSubmit(values: CompanyFormValues) {
    setSuccessMessage(null);
    try {
      await updateCompany({ id: company!._id, data: values }).unwrap();
      setSuccessMessage("Company profile updated successfully.");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch {
      // surface error via saveError
    }
  }

  const errorMessage = saveError
    ? ((saveError as { data?: { message?: string } })?.data?.message ??
      "Failed to save company settings.")
    : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 text-neutral-900 antialiased">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b border-neutral-200/80 pb-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white font-semibold text-sm">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
              Company Profile
            </h1>
            <p className="text-xs text-neutral-500">
              Manage core entity records, tax compliance rules, and statutory
              contacts.
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200/80 bg-emerald-50/60 p-3 text-xs text-emerald-800 shadow-2xs">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Entity Status Snapshot Deck */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-neutral-500">
            Registered Entity
          </div>
          <div className="mt-1 truncate font-semibold text-sm text-neutral-900">
            {company.name}
          </div>
          <div className="mt-2 inline-flex items-center gap-1 font-mono text-[11px] text-neutral-500">
            <FileCheck2 className="h-3 w-3 text-neutral-400" />
            RC: {company.rcNumber || "Not Specified"}
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-neutral-500">
            Primary Operating Location
          </div>
          <div className="mt-1 font-semibold text-sm text-neutral-900">
            {company.state || "Unassigned"} State
          </div>
          <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-neutral-500 truncate">
            <MapPin className="h-3 w-3 shrink-0 text-neutral-400" />
            <span className="truncate">
              {company.address || "No address provided"}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-semibold text-neutral-500">
            Statutory Deductions Status
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                company.itfApplicable
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  : "bg-neutral-100 text-neutral-600"
              }`}
            >
              ITF {company.itfApplicable ? "Active" : "Exempt"}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                company.nsitfApplicable
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  : "bg-neutral-100 text-neutral-600"
              }`}
            >
              NSITF {company.nsitfApplicable ? "Active" : "Exempt"}
            </span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-neutral-500">
            <ShieldCheck className="h-3 w-3 text-neutral-400" />
            Compliance Verified
          </div>
        </div>
      </div>

      {/* Main Settings Form Block */}
      <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-xs">
        <CompanyForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          isLoading={isSaving}
          error={errorMessage}
        />
      </div>
    </div>
  );
}
