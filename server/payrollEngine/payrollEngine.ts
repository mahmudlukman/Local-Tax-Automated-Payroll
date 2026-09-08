/**
 * Pure payroll calculation functions.
 *
 * Deliberately has zero dependency on Mongoose/Express so it can be unit
 * tested in isolation against known figures and reused unchanged if the
 * app is ever split into a separate service. Inputs are plain interfaces
 * (not Mongoose Documents) so both real DB docs and plain test fixtures
 * satisfy them.
 *
 * Method used: "annualize-then-de-annualize". Monthly taxable income is
 * multiplied by 12, PAYE is computed on the annual figure using the
 * progressive bands, then divided back down to a monthly amount. This
 * matches how the bands are published (annual chargeable income) but does
 * NOT do true month-by-month cumulative PAYE (which re-bases as pay
 * changes mid-year, e.g. bonuses). For employees with stable monthly pay
 * this produces the same annual total; for variable pay (bonuses, mid-year
 * raises) a cumulative engine should be layered on top before go-live.
 */

export interface PayeBand {
  upTo: number | null;
  rate: number;
}

export interface AllowanceLike {
  name: string;
  amount: number;
  taxable: boolean;
}

export interface EmployeeLike {
  salary: {
    basic: number;
    housing: number;
    transport: number;
    otherAllowances: AllowanceLike[];
  };
  pensionOptOut?: boolean;
  nhfOptOut?: boolean;
  annualRentPaid?: number;
}

export interface TaxConfigLike {
  _id?: unknown;
  label?: string;
  payeBands: PayeBand[];
  rentReliefRate: number;
  rentReliefCap: number;
  pensionEmployeeRate: number;
  pensionEmployerRate: number;
  nhfRate: number;
  itfRate: number;
  nsitfRate: number;
}

export interface CompanyLike {
  itfApplicable?: boolean;
  nsitfApplicable?: boolean;
}

export interface PensionBreakdown {
  pensionableMonthly: number;
  employeeMonthly: number;
  employeeAnnual: number;
  employerMonthly: number;
  employerAnnual: number;
  optedOut: boolean;
}

export interface NhfBreakdown {
  monthly: number;
  annual: number;
  optedOut: boolean;
}

export interface PayeBreakdown {
  annual: number;
  monthly: number;
}

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

  pension: PensionBreakdown;
  nhf: NhfBreakdown;
  paye: PayeBreakdown;

  totalMonthlyDeductions: number;
  netPay: number;

  taxConfigId: unknown;
  taxConfigLabel: string | null;
}

export interface EmployerLevyLine {
  applicable: boolean;
  annual: number;
  monthly: number;
}

export interface EmployerLevies {
  itf: EmployerLevyLine;
  nsitf: EmployerLevyLine;
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * @param annualChargeableIncome
 * @param payeBands ascending order
 * @returns annual PAYE liability
 */
export function calculateAnnualPAYE(
  annualChargeableIncome: number,
  payeBands: PayeBand[],
): number {
  if (annualChargeableIncome <= 0) return 0;

  let remaining = annualChargeableIncome;
  let lowerBound = 0;
  let tax = 0;

  for (const band of payeBands) {
    const bandCeiling = band.upTo === null ? Infinity : band.upTo;
    const bandWidth = bandCeiling - lowerBound;
    const amountInBand = Math.min(Math.max(remaining, 0), bandWidth);

    tax += amountInBand * band.rate;
    remaining -= amountInBand;
    lowerBound = bandCeiling;

    if (remaining <= 0) break;
  }

  return round2(tax);
}

/**
 * Computes the full monthly payroll breakdown for a single employee.
 */
export function calculateEmployeePayroll(
  employee: EmployeeLike,
  taxConfig: TaxConfigLike,
): PayrollBreakdown {
  const {
    basic = 0,
    housing = 0,
    transport = 0,
    otherAllowances = [],
  } = employee.salary || ({} as EmployeeLike["salary"]);

  const taxableAllowances = otherAllowances
    .filter((a) => a.taxable)
    .reduce((sum, a) => sum + a.amount, 0);
  const nonTaxableAllowances = otherAllowances
    .filter((a) => !a.taxable)
    .reduce((sum, a) => sum + a.amount, 0);

  // Pensionable earnings = basic + housing + transport only (Pension Reform Act)
  const pensionableMonthly = basic + housing + transport;
  const pensionableAnnual = pensionableMonthly * 12;

  const employeePensionAnnual = employee.pensionOptOut
    ? 0
    : round2(pensionableAnnual * taxConfig.pensionEmployeeRate);
  const employerPensionAnnual = employee.pensionOptOut
    ? 0
    : round2(pensionableAnnual * taxConfig.pensionEmployerRate);

  // NHF - 2.5% of basic salary
  const nhfAnnual = employee.nhfOptOut
    ? 0
    : round2(basic * 12 * taxConfig.nhfRate);

  // Rent relief - 20% of documented annual rent, capped
  const rentRelief = Math.min(
    (employee.annualRentPaid || 0) * taxConfig.rentReliefRate,
    taxConfig.rentReliefCap,
  );

  // Taxable gross = basic + housing + transport + taxable allowances
  const taxableMonthlyGross = basic + housing + transport + taxableAllowances;
  const taxableAnnualGross = taxableMonthlyGross * 12;

  const annualChargeableIncome = Math.max(
    taxableAnnualGross - employeePensionAnnual - nhfAnnual - rentRelief,
    0,
  );

  const annualPAYE = calculateAnnualPAYE(
    annualChargeableIncome,
    taxConfig.payeBands,
  );

  const monthlyGross = taxableMonthlyGross + nonTaxableAllowances;
  const monthlyPAYE = round2(annualPAYE / 12);
  const monthlyEmployeePension = round2(employeePensionAnnual / 12);
  const monthlyNHF = round2(nhfAnnual / 12);

  const totalMonthlyDeductions = round2(
    monthlyPAYE + monthlyEmployeePension + monthlyNHF,
  );
  const netPay = round2(monthlyGross - totalMonthlyDeductions);

  return {
    basic,
    housing,
    transport,
    taxableAllowances: round2(taxableAllowances),
    nonTaxableAllowances: round2(nonTaxableAllowances),

    monthlyGross: round2(monthlyGross),
    annualGross: round2(monthlyGross * 12),

    rentReliefApplied: round2(rentRelief),
    annualChargeableIncome: round2(annualChargeableIncome),

    pension: {
      pensionableMonthly: round2(pensionableMonthly),
      employeeMonthly: monthlyEmployeePension,
      employeeAnnual: employeePensionAnnual,
      employerMonthly: round2(employerPensionAnnual / 12),
      employerAnnual: employerPensionAnnual,
      optedOut: !!employee.pensionOptOut,
    },
    nhf: {
      monthly: monthlyNHF,
      annual: nhfAnnual,
      optedOut: !!employee.nhfOptOut,
    },
    paye: {
      annual: annualPAYE,
      monthly: monthlyPAYE,
    },

    totalMonthlyDeductions,
    netPay,

    taxConfigId: taxConfig._id ?? null,
    taxConfigLabel: taxConfig.label ?? null,
  };
}

/**
 * Employer-side levies computed across a whole payroll run (company level,
 * not per-employee) - ITF and NSITF are a percentage of total payroll, paid
 * by the employer, only applicable to companies that meet the threshold.
 */
export function calculateEmployerLevies(
  totalMonthlyGrossAcrossEmployees: number,
  company: CompanyLike,
  taxConfig: TaxConfigLike,
): EmployerLevies {
  const annualPayroll = totalMonthlyGrossAcrossEmployees * 12;

  return {
    itf: {
      applicable: !!company.itfApplicable,
      annual: company.itfApplicable
        ? round2(annualPayroll * taxConfig.itfRate)
        : 0,
      monthly: company.itfApplicable
        ? round2((annualPayroll * taxConfig.itfRate) / 12)
        : 0,
    },
    nsitf: {
      applicable: !!company.nsitfApplicable,
      annual: company.nsitfApplicable
        ? round2(annualPayroll * taxConfig.nsitfRate)
        : 0,
      monthly: company.nsitfApplicable
        ? round2((annualPayroll * taxConfig.nsitfRate) / 12)
        : 0,
    },
  };
}
