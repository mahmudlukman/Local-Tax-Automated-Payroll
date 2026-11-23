import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Pencil,
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  CreditCard,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";
import type { EmploymentStatus } from "../@types";
import { useGetEmployeeQuery } from "../redux/features/employee/employeeApi";

const STATUS_TONE: Record<EmploymentStatus, "solid" | "outline"> = {
  active: "solid",
  suspended: "outline",
  terminated: "outline",
};

// Copyable text badge helper
function CopyableValue({ value }: { value?: string }) {
  const [copied, setCopied] = useState(false);

  if (!value) return <span className="text-neutral-400">—</span>;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group flex items-center gap-2">
      <span className="font-mono text-sm text-neutral-900">{value}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded p-1 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-neutral-100 hover:text-neutral-700"
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-600" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium uppercase tracking-wider text-neutral-400">
        {label}
      </div>
      <div className="text-sm font-medium text-neutral-900">
        {value || <span className="text-neutral-400">—</span>}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-xs transition-all hover:border-neutral-300/80">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: employee,
    isLoading,
    isError,
    error,
  } = useGetEmployeeQuery(id!, { skip: !id });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div className="h-6 w-32 rounded bg-neutral-200 animate-pulse" />
        <div className="h-32 w-full rounded-xl bg-neutral-100 animate-pulse" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="h-48 rounded-xl bg-neutral-100 animate-pulse" />
          <div className="h-48 rounded-xl bg-neutral-100 animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !employee) {
    const message =
      (error as { data?: { message?: string } })?.data?.message ??
      "Employee record not found.";

    return (
      <div className="mx-auto max-w-xl py-12">
        <div className="rounded-xl border border-neutral-200/80 bg-white p-8 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
            <AlertCircle className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <h3 className="mt-4 text-base font-semibold text-neutral-900">
            Record Unavailable
          </h3>
          <p className="mt-1 text-sm text-neutral-500">{message}</p>
          <div className="mt-6">
            <Link
              to="/employees"
              className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 hover:text-neutral-600"
            >
              <ArrowLeft className="h-4 w-4" /> Back to employees
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initials =
    `${employee.firstName?.[0] || ""}${employee.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 text-neutral-900 antialiased">
      {/* Top Breadcrumb Navigation */}
      <div>
        <Link
          to="/employees"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Employees
        </Link>
      </div>

      {/* Header Profile Hero Card */}
      <div className="flex flex-col gap-6 rounded-xl border border-neutral-200/80 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-lg font-semibold text-white shadow-inner">
            {initials}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
                {employee.firstName} {employee.lastName}
              </h1>
              <Badge tone={STATUS_TONE[employee.employmentStatus]}>
                {employee.employmentStatus}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
              <span className="font-mono text-neutral-600">
                ID: {employee.employeeId}
              </span>
              <span>•</span>
              <span>{employee.jobTitle || "No Title"}</span>
              <span>•</span>
              <span>{employee.department || "General"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate(`/employee/${employee._id}/edit`)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-800 shadow-2xs hover:bg-neutral-50"
          >
            <Pencil className="h-4 w-4" strokeWidth={1.75} />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Main Info Sections */}
      <div className="space-y-6">
        {/* Section 1: Personal Details */}
        <Section title="Personal details">
          <InfoRow
            label="Email Address"
            value={
              employee.email ? (
                <a
                  href={`mailto:${employee.email}`}
                  className="inline-flex items-center gap-1.5 text-neutral-900 hover:underline"
                >
                  <Mail className="h-3.5 w-3.5 text-neutral-400" />
                  {employee.email}
                </a>
              ) : null
            }
          />
          <InfoRow
            label="Phone Number"
            value={
              employee.phone ? (
                <a
                  href={`tel:${employee.phone}`}
                  className="inline-flex items-center gap-1.5 text-neutral-900 hover:underline"
                >
                  <Phone className="h-3.5 w-3.5 text-neutral-400" />
                  {employee.phone}
                </a>
              ) : null
            }
          />
          <InfoRow
            label="Date of Hire"
            value={formatDate(employee.dateOfHire)}
          />
        </Section>

        {/* Section 2: Employment Details */}
        <Section title="Employment details">
          <InfoRow label="Job Title" value={employee.jobTitle} />
          <InfoRow label="Department" value={employee.department} />
          <InfoRow
            label="State of Residence"
            value={employee.stateOfResidence}
          />
        </Section>

        {/* Section 3: Statutory Details */}
        <Section title="Statutory & Compliance">
          <InfoRow
            label="Tax Identification (TIN)"
            value={<CopyableValue value={employee.tin} />}
          />
          <InfoRow
            label="Pension PIN"
            value={<CopyableValue value={employee.pensionPIN} />}
          />
          <InfoRow
            label="PFA Administrator"
            value={employee.pensionFundAdministrator}
          />
          <InfoRow
            label="Pension Status"
            value={
              <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                {employee.pensionOptOut ? (
                  <>
                    <XCircle className="h-4 w-4 text-amber-600" />
                    <span className="text-neutral-600">Opted out</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-neutral-900">Enrolled</span>
                  </>
                )}
              </span>
            }
          />
          <InfoRow
            label="NHF Status"
            value={
              <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                {employee.nhfOptOut ? (
                  <>
                    <XCircle className="h-4 w-4 text-amber-600" />
                    <span className="text-neutral-600">Opted out</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-neutral-900">Enrolled</span>
                  </>
                )}
              </span>
            }
          />
          <InfoRow
            label="Annual Rent Paid"
            value={
              <span className="font-mono">
                {formatCurrency(employee.annualRentPaid)}
              </span>
            }
          />
        </Section>

        {/* Section 4: Salary Structure */}
        <Section title="Salary breakdown (Monthly)">
          <InfoRow
            label="Basic Salary"
            value={
              <span className="font-mono font-semibold">
                {formatCurrency(employee.salary.basic)}
              </span>
            }
          />
          <InfoRow
            label="Housing Allowance"
            value={
              <span className="font-mono">
                {formatCurrency(employee.salary.housing)}
              </span>
            }
          />
          <InfoRow
            label="Transport Allowance"
            value={
              <span className="font-mono">
                {formatCurrency(employee.salary.transport)}
              </span>
            }
          />
          {employee.salary.otherAllowances.map((allowance, i) => (
            <InfoRow
              key={i}
              label={`${allowance.name} (${allowance.taxable ? "Taxable" : "Non-taxable"})`}
              value={
                <span className="font-mono">
                  {formatCurrency(allowance.amount)}
                </span>
              }
            />
          ))}
        </Section>

        {/* Section 5: Bank Details */}
        <Section title="Disbursement Bank Details">
          <InfoRow
            label="Bank Name"
            value={
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-neutral-400" />
                <span>{employee.bank.bankName}</span>
              </div>
            }
          />
          <InfoRow
            label="Bank Code"
            value={<CopyableValue value={employee.bank.bankCode} />}
          />
          <InfoRow
            label="Account Number"
            value={<CopyableValue value={employee.bank.accountNumber} />}
          />
          <InfoRow
            label="Account Holder Name"
            value={
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-neutral-400" />
                <span>{employee.bank.accountName}</span>
              </div>
            }
          />
        </Section>
      </div>
    </div>
  );
}
