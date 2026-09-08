import { useState, type FormEvent } from 'react';
import { AlertCircle } from 'lucide-react';
import SalaryStructureFields from './SalaryStructureFields';
import { EMPTY_EMPLOYEE_FORM_VALUES, type EmployeeFormValues } from '../../@types';

export interface EmployeeFormProps {
  initialValues?: EmployeeFormValues;
  onSubmit: (values: EmployeeFormValues) => void;
  isLoading?: boolean;
  error?: string | null;
  /** Label for the submit button, e.g. "Save employee" vs "Add employee" */
  submitLabel?: string;
}

const INPUT_CLASS =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500';

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-gray-200 pb-2 text-sm font-medium text-gray-900">
      {children}
    </h2>
  );
}

export default function EmployeeForm({
  initialValues = EMPTY_EMPLOYEE_FORM_VALUES,
  onSubmit,
  isLoading = false,
  error,
  submitLabel = 'Save employee',
}: EmployeeFormProps) {
  const [values, setValues] = useState<EmployeeFormValues>(initialValues);

  function update<K extends keyof EmployeeFormValues>(key: K, value: EmployeeFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <section className="space-y-4">
        <SectionHeading>Personal details</SectionHeading>
        <div className="grid grid-cols-2 gap-4">
          <Field label="First name" htmlFor="firstName">
            <input
              id="firstName"
              required
              value={values.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Last name" htmlFor="lastName">
            <input
              id="lastName"
              required
              value={values.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Email" htmlFor="email">
            <input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => update('email', e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <input
              id="phone"
              value={values.phone}
              onChange={(e) => update('phone', e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading>Employment details</SectionHeading>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Employee ID" htmlFor="employeeId">
            <input
              id="employeeId"
              required
              placeholder="EMP-0001"
              value={values.employeeId}
              onChange={(e) => update('employeeId', e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Date of hire" htmlFor="dateOfHire">
            <input
              id="dateOfHire"
              type="date"
              required
              value={values.dateOfHire}
              onChange={(e) => update('dateOfHire', e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Job title" htmlFor="jobTitle">
            <input
              id="jobTitle"
              value={values.jobTitle}
              onChange={(e) => update('jobTitle', e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Department" htmlFor="department">
            <input
              id="department"
              value={values.department}
              onChange={(e) => update('department', e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading>Statutory details</SectionHeading>
        <div className="grid grid-cols-2 gap-4">
          <Field label="TIN" htmlFor="tin">
            <input
              id="tin"
              value={values.tin}
              onChange={(e) => update('tin', e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Pension PIN" htmlFor="pensionPIN">
            <input
              id="pensionPIN"
              value={values.pensionPIN}
              onChange={(e) => update('pensionPIN', e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Pension fund administrator" htmlFor="pensionFundAdministrator">
            <input
              id="pensionFundAdministrator"
              value={values.pensionFundAdministrator}
              onChange={(e) => update('pensionFundAdministrator', e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="State of residence" htmlFor="stateOfResidence">
            <input
              id="stateOfResidence"
              value={values.stateOfResidence}
              onChange={(e) => update('stateOfResidence', e.target.value)}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Annual rent paid" htmlFor="annualRentPaid">
            <input
              id="annualRentPaid"
              type="number"
              min={0}
              value={values.annualRentPaid}
              onChange={(e) => update('annualRentPaid', Number(e.target.value))}
              className={INPUT_CLASS}
            />
          </Field>
        </div>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={values.pensionOptOut}
              onChange={(e) => update('pensionOptOut', e.target.checked)}
              className="rounded border-gray-300"
            />
            Pension opt-out
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={values.nhfOptOut}
              onChange={(e) => update('nhfOptOut', e.target.checked)}
              className="rounded border-gray-300"
            />
            NHF opt-out
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading>Salary structure</SectionHeading>
        <SalaryStructureFields
          value={values.salary}
          onChange={(salary) => update('salary', salary)}
        />
      </section>

      <section className="space-y-4">
        <SectionHeading>Bank details</SectionHeading>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Bank name" htmlFor="bankName">
            <input
              id="bankName"
              value={values.bank.bankName ?? ''}
              onChange={(e) => update('bank', { ...values.bank, bankName: e.target.value })}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Bank code" htmlFor="bankCode">
            <input
              id="bankCode"
              value={values.bank.bankCode ?? ''}
              onChange={(e) => update('bank', { ...values.bank, bankCode: e.target.value })}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Account number" htmlFor="accountNumber">
            <input
              id="accountNumber"
              value={values.bank.accountNumber ?? ''}
              onChange={(e) =>
                update('bank', { ...values.bank, accountNumber: e.target.value })
              }
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Account name" htmlFor="accountName">
            <input
              id="accountName"
              value={values.bank.accountName ?? ''}
              onChange={(e) => update('bank', { ...values.bank, accountName: e.target.value })}
              className={INPUT_CLASS}
            />
          </Field>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end border-t border-gray-200 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}