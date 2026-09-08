import fs from "fs";
import {
  calculateEmployeePayroll,
  TaxConfigLike,
} from "../payrollEngine/payrollEngine";
import { generatePayslipPdf } from "../scripts/payslipPdf";

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

async function main() {
  const breakdown = calculateEmployeePayroll(
    {
      salary: {
        basic: 400000,
        housing: 100000,
        transport: 50000,
        otherAllowances: [
          { name: "Data allowance", amount: 10000, taxable: true },
          { name: "Transport reimbursement", amount: 15000, taxable: false },
        ],
      },
      pensionOptOut: false,
      nhfOptOut: false,
      annualRentPaid: 1200000,
    },
    TAX_CONFIG_2026,
  );

  const pdfBytes = await generatePayslipPdf({
    company: {
      name: "Acme Nigeria Ltd",
      address: "12 Admiralty Way, Lekki Phase 1, Lagos",
    },
    employee: {
      employeeId: "EMP-0002",
      firstName: "Chinedu",
      lastName: "Okafor",
      jobTitle: "Software Engineer",
      department: "Engineering",
      tin: "10000002-0001",
      pensionPIN: "PEN-0002",
    },
    period: { month: 9, year: 2026 },
    breakdown,
    bankSnapshot: { bankName: "GTBank", accountNumber: "0123456789" },
  });

  fs.writeFileSync("/tmp/sample-payslip.pdf", pdfBytes);
  console.log("Wrote /tmp/sample-payslip.pdf, size:", pdfBytes.length, "bytes");
  console.log("Net pay in breakdown:", breakdown.netPay, "(expect 436020)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
