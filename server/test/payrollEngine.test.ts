/**
 * Plain TS test script (no framework) so it runs with minimal dependencies:
 * `npm test` (runs via ts-node)
 */
import assert from "assert";
import {
  calculateAnnualPAYE,
  calculateEmployeePayroll,
  calculateEmployerLevies,
  TaxConfigLike,
  EmployeeLike,
} from "../payrollEngine/payrollEngine";

const TAX_CONFIG_2026: TaxConfigLike = {
  label: "Nigeria Tax Act 2025 (effective Jan 2026)",
  payeBands: [
    { upTo: 800000, rate: 0 },
    { upTo: 3000000, rate: 0.15 },
    { upTo: 12000000, rate: 0.18 },
    { upTo: 25000000, rate: 0.21 },
    { upTo: 50000000, rate: 0.23 },
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

let passed = 0;
function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  PASS  ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL  ${name}`);
    console.error(`        ${(err as Error).message}`);
    process.exitCode = 1;
  }
}

function round(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

console.log("calculateAnnualPAYE");

test("income entirely within the 0% band pays no tax", () => {
  assert.strictEqual(calculateAnnualPAYE(500000, TAX_CONFIG_2026.payeBands), 0);
});

test("income exactly at the first threshold pays no tax", () => {
  assert.strictEqual(calculateAnnualPAYE(800000, TAX_CONFIG_2026.payeBands), 0);
});

test("income spanning two bands is taxed progressively", () => {
  // 800,000 at 0% + 200,000 at 15% = 30,000
  assert.strictEqual(
    calculateAnnualPAYE(1000000, TAX_CONFIG_2026.payeBands),
    30000,
  );
});

test("income in the top open-ended band", () => {
  // Bands up to 50,000,000: 0 + 2,200,000*0.15 + 9,000,000*0.18 +
  // 13,000,000*0.21 + 25,000,000*0.23 = 330,000 + 1,620,000 + 2,730,000 + 5,750,000 = 10,430,000
  // Remaining 10,000,000 above 50,000,000 at 25% = 2,500,000
  // Total = 12,930,000
  assert.strictEqual(
    calculateAnnualPAYE(60000000, TAX_CONFIG_2026.payeBands),
    12930000,
  );
});

console.log("calculateEmployeePayroll");

test("mid-level employee - full worked example", () => {
  const employee: EmployeeLike = {
    salary: {
      basic: 400000,
      housing: 100000,
      transport: 50000,
      otherAllowances: [
        { name: "Data allowance", amount: 10000, taxable: true },
      ],
    },
    pensionOptOut: false,
    nhfOptOut: false,
    annualRentPaid: 1200000,
  };

  const result = calculateEmployeePayroll(employee, TAX_CONFIG_2026);

  assert.strictEqual(result.pension.employeeAnnual, 528000);
  assert.strictEqual(result.nhf.annual, 120000);
  assert.strictEqual(result.rentReliefApplied, 240000);
  assert.strictEqual(result.annualGross, 6720000);
  assert.strictEqual(result.annualChargeableIncome, 5832000);
  assert.strictEqual(result.paye.annual, 839760);
  assert.strictEqual(result.paye.monthly, 69980);
  assert.strictEqual(result.netPay, 436020);
});

test("pension and NHF opt-outs are respected", () => {
  const employee: EmployeeLike = {
    salary: { basic: 300000, housing: 0, transport: 0, otherAllowances: [] },
    pensionOptOut: true,
    nhfOptOut: true,
    annualRentPaid: 0,
  };
  const result = calculateEmployeePayroll(employee, TAX_CONFIG_2026);
  assert.strictEqual(result.pension.employeeAnnual, 0);
  assert.strictEqual(result.nhf.annual, 0);
});

test("non-taxable allowances add to net pay but not to chargeable income", () => {
  const employee: EmployeeLike = {
    salary: {
      basic: 200000,
      housing: 0,
      transport: 0,
      otherAllowances: [
        { name: "Reimbursement", amount: 15000, taxable: false },
      ],
    },
    pensionOptOut: true,
    nhfOptOut: true,
    annualRentPaid: 0,
  };
  const result = calculateEmployeePayroll(employee, TAX_CONFIG_2026);
  assert.strictEqual(result.monthlyGross, 215000);
  assert.strictEqual(result.annualChargeableIncome, 200000 * 12);
});

console.log("calculateEmployerLevies");

test("ITF and NSITF only apply when the company flag is set", () => {
  const levies = calculateEmployerLevies(
    5000000,
    { itfApplicable: true, nsitfApplicable: false },
    TAX_CONFIG_2026,
  );
  assert.strictEqual(levies.itf.applicable, true);
  assert.strictEqual(levies.itf.annual, round(5000000 * 12 * 0.01));
  assert.strictEqual(levies.nsitf.applicable, false);
  assert.strictEqual(levies.nsitf.annual, 0);
});

console.log(`\n${passed} test(s) passed.`);
if (process.exitCode) {
  console.error("Some tests FAILED.");
} else {
  console.log("All tests passed.");
}
