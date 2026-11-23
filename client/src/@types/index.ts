export interface AuthState {
  token: string;
  user: User | null;
  isInitialized: boolean;
}

export interface LoadUserResponse {
  success: boolean;
  user: User;
  accessToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  user: User;
}

export interface Avatar {
  public_id: string;
  url: string;
  _id: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: Avatar;
  role: string;
  isActive?: boolean;
  createdAt: string;
}

export interface ServerError {
  status?: number;
  data?: {
    message?: string;
  };
  message?: string;
}

export interface Allowance {
  name: string;
  amount: number;
  taxable: boolean;
}

export interface SalaryStructure {
  basic: number;
  housing: number;
  transport: number;
  otherAllowances: Allowance[];
}

export interface BankDetails {
  bankName?: string;
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
}

export type EmploymentStatus = "active" | "suspended" | "terminated";

export interface Employee {
  _id: string;
  company: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfHire: string;
  jobTitle?: string;
  department?: string;
  employmentStatus: EmploymentStatus;
  tin?: string;
  pensionPIN?: string;
  pensionFundAdministrator?: string;
  stateOfResidence?: string;
  salary: SalaryStructure;
  pensionOptOut: boolean;
  nhfOptOut: boolean;
  annualRentPaid: number;
  bank: BankDetails;
}

/** Shape used by EmployeeForm - matches the create/update request body. */
export type EmployeeFormValues = Omit<
  Employee,
  "_id" | "company" | "employmentStatus"
>;

export const EMPTY_SALARY_STRUCTURE: SalaryStructure = {
  basic: 0,
  housing: 0,
  transport: 0,
  otherAllowances: [],
};

export const EMPTY_EMPLOYEE_FORM_VALUES: EmployeeFormValues = {
  employeeId: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfHire: "",
  jobTitle: "",
  department: "",
  tin: "",
  pensionPIN: "",
  pensionFundAdministrator: "",
  stateOfResidence: "",
  salary: EMPTY_SALARY_STRUCTURE,
  pensionOptOut: false,
  nhfOptOut: false,
  annualRentPaid: 0,
  bank: {},
};

// --- Payroll ---

export type PayrollRunStatus = "draft" | "approved" | "paid";

export interface PayrollTotals {
  employeeCount: number;
  totalGross: number;
  totalPAYE: number;
  totalEmployeePension: number;
  totalEmployerPension: number;
  totalNHF: number;
  totalNetPay: number;
  itf: number;
  nsitf: number;
}

export interface PayrollRun {
  _id: string;
  company: string;
  period: { month: number; year: number };
  taxConfig: string;
  status: PayrollRunStatus;
  runBy: string;
  approvedBy?: string;
  approvedAt?: string;
  paidAt?: string;
  totals: PayrollTotals;
}

/** Mirrors the payroll engine's breakdown shape, stored verbatim on each Payslip. */
export interface PayrollBreakdown {
  basic: number;
  housing: number;
  transport: number;
  taxableAllowances: number;
  nonTaxableAllowances: number;
  monthlyGross: number;
  annualGross: number;
  rentReliefApplied: number;
  annualChargeableIncome: number;
  pension: {
    pensionableMonthly: number;
    employeeMonthly: number;
    employeeAnnual: number;
    employerMonthly: number;
    employerAnnual: number;
    optedOut: boolean;
  };
  nhf: {
    monthly: number;
    annual: number;
    optedOut: boolean;
  };
  paye: {
    annual: number;
    monthly: number;
  };
  totalMonthlyDeductions: number;
  netPay: number;
  taxConfigId: string | null;
  taxConfigLabel: string | null;
}

/** The subset of Employee fields returned when a Payslip's employee ref is populated. */
export interface PayslipEmployeeRef {
  _id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  department?: string;
}

export interface Payslip {
  _id: string;
  company: string;
  payrollRun: string;
  employee: string | PayslipEmployeeRef;
  period: { month: number; year: number };
  breakdown: PayrollBreakdown;
  netPay: number;
  bankSnapshot?: BankDetails;
  pdfUrl?: string;
  deliveredVia?: {
    email: { sent: boolean; sentAt?: string };
    whatsapp: { sent: boolean; sentAt?: string };
  };
}

export type BankExportFormatId = "generic" | "gtbank" | "zenith";

export interface ExportFormatOption {
  id: BankExportFormatId;
  label: string;
  verified: boolean;
}

// --- Tax config ---

export interface PayeBand {
  upTo: number | null;
  rate: number;
}

export interface TaxConfig {
  _id: string;
  label: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  isActive: boolean;
  payeBands: PayeBand[];
  rentReliefRate: number;
  rentReliefCap: number;
  pensionEmployeeRate: number;
  pensionEmployerRate: number;
  nhfRate: number;
  itfRate: number;
  nsitfRate: number;
}

export type TaxConfigFormValues = Omit<TaxConfig, "_id">;

export const EMPTY_TAX_CONFIG_FORM_VALUES: TaxConfigFormValues = {
  label: "",
  effectiveFrom: "",
  effectiveTo: null,
  isActive: true,
  payeBands: [
    { upTo: 800000, rate: 0 },
    { upTo: null, rate: 0.25 },
  ],
  rentReliefRate: 0.2,
  rentReliefCap: 500000,
  pensionEmployeeRate: 0.08,
  pensionEmployerRate: 0.1,
  nhfRate: 0.025,
  itfRate: 0.01,
  nsitfRate: 0.01,
};

// --- Company ---

export interface Company {
  _id: string;
  name: string;
  rcNumber?: string;
  industry?: string;
  address?: string;
  state?: string;
  contactEmail?: string;
  contactPhone?: string;
  itfApplicable: boolean;
  nsitfApplicable: boolean;
  isActive: boolean;
}

export type CompanyFormValues = Omit<Company, "_id" | "isActive">;

export const EMPTY_COMPANY_FORM_VALUES: CompanyFormValues = {
  name: "",
  rcNumber: "",
  industry: "",
  address: "",
  state: "",
  contactEmail: "",
  contactPhone: "",
  itfApplicable: false,
  nsitfApplicable: false,
};

export type UserRole = "super_admin" | "company_admin" | "hr" | "employee";
