import { PDFDocument, StandardFonts, rgb, PDFFont } from "pdf-lib";
import { PayrollBreakdown } from "../payrollEngine/payrollEngine";

export interface PayslipPdfInput {
  company: {
    name: string;
    address?: string;
    state?: string;
  };
  employee: {
    employeeId: string;
    firstName: string;
    lastName: string;
    jobTitle?: string;
    department?: string;
    tin?: string;
    pensionPIN?: string;
  };
  period: { month: number; year: number };
  breakdown: PayrollBreakdown;
  bankSnapshot?: {
    bankName?: string;
    accountNumber?: string;
  };
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const NAIRA = "NGN"; // avoid the ₦ glyph - not in StandardFonts, would render as a black box

function formatMoney(n: number): string {
  return `${NAIRA} ${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function maskAccountNumber(acct?: string): string {
  if (!acct || acct.length < 4) return acct || "-";
  return `****${acct.slice(-4)}`;
}

/**
 * Generates a one-page payslip PDF as raw bytes. Pure function - no DB or
 * file-system dependency - so it's easy to unit test and reuse whether the
 * caller wants to stream it in an HTTP response or attach it to an email.
 */
export async function generatePayslipPdf(
  input: PayslipPdfInput,
): Promise<Uint8Array> {
  const { company, employee, period, breakdown, bankSnapshot } = input;

  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  let y = height - margin;

  const darkGray = rgb(0.15, 0.15, 0.15);
  const midGray = rgb(0.45, 0.45, 0.45);
  const lineGray = rgb(0.85, 0.85, 0.85);
  const brandBlue = rgb(0.09, 0.29, 0.55);

  const drawText = (
    text: string,
    x: number,
    yPos: number,
    opts: { size?: number; f?: PDFFont; color?: ReturnType<typeof rgb> } = {},
  ) => {
    page.drawText(text, {
      x,
      y: yPos,
      size: opts.size ?? 10,
      font: opts.f ?? font,
      color: opts.color ?? darkGray,
    });
  };

  const drawLine = (yPos: number) => {
    page.drawLine({
      start: { x: margin, y: yPos },
      end: { x: width - margin, y: yPos },
      thickness: 0.75,
      color: lineGray,
    });
  };

  // --- Header ---
  drawText(company.name, margin, y, { size: 16, f: bold, color: brandBlue });
  y -= 16;
  if (company.address) {
    drawText(company.address, margin, y, { size: 9, color: midGray });
    y -= 20;
  } else {
    y -= 10;
  }

  drawText("PAYSLIP", width - margin - 80, height - margin, {
    size: 14,
    f: bold,
  });
  drawText(
    `${MONTH_NAMES[period.month - 1]} ${period.year}`,
    width - margin - 80,
    height - margin - 16,
    {
      size: 10,
      color: midGray,
    },
  );

  drawLine(y);
  y -= 20;

  // --- Employee details, two columns ---
  const col2X = margin + 280;
  const rowH = 14;

  const leftRows: [string, string][] = [
    ["Employee Name", `${employee.firstName} ${employee.lastName}`],
    ["Employee ID", employee.employeeId],
    ["Job Title", employee.jobTitle || "-"],
    ["Department", employee.department || "-"],
  ];
  const rightRows: [string, string][] = [
    ["TIN", employee.tin || "-"],
    ["Pension PIN", employee.pensionPIN || "-"],
    ["Bank", bankSnapshot?.bankName || "-"],
    ["Account", maskAccountNumber(bankSnapshot?.accountNumber)],
  ];

  let rowY = y;
  for (let i = 0; i < leftRows.length; i++) {
    drawText(leftRows[i][0], margin, rowY, { size: 9, color: midGray });
    drawText(leftRows[i][1], margin + 90, rowY, { size: 10, f: bold });
    drawText(rightRows[i][0], col2X, rowY, { size: 9, color: midGray });
    drawText(rightRows[i][1], col2X + 90, rowY, { size: 10, f: bold });
    rowY -= rowH;
  }
  y = rowY - 12;
  drawLine(y);
  y -= 22;

  // --- Earnings table ---
  const drawSectionTitle = (title: string) => {
    drawText(title, margin, y, { size: 11, f: bold, color: brandBlue });
    y -= 16;
  };

  const drawKeyValueRow = (
    label: string,
    value: string,
    opts: { bold?: boolean } = {},
  ) => {
    drawText(label, margin + 10, y, { size: 10, f: opts.bold ? bold : font });
    drawText(value, width - margin - 120, y, {
      size: 10,
      f: opts.bold ? bold : font,
    });
    y -= 15;
  };

  drawSectionTitle("Earnings");
  drawKeyValueRow("Basic Salary", formatMoney(breakdown.basic));
  drawKeyValueRow("Housing Allowance", formatMoney(breakdown.housing));
  drawKeyValueRow("Transport Allowance", formatMoney(breakdown.transport));
  if (breakdown.taxableAllowances > 0) {
    drawKeyValueRow(
      "Other Allowances (taxable)",
      formatMoney(breakdown.taxableAllowances),
    );
  }
  if (breakdown.nonTaxableAllowances > 0) {
    drawKeyValueRow(
      "Other Allowances (non-taxable)",
      formatMoney(breakdown.nonTaxableAllowances),
    );
  }
  drawLine(y + 4);
  y -= 4;
  drawKeyValueRow("Gross Pay", formatMoney(breakdown.monthlyGross), {
    bold: true,
  });
  y -= 10;

  drawSectionTitle("Deductions");
  drawKeyValueRow("PAYE Tax", formatMoney(breakdown.paye.monthly));
  drawKeyValueRow(
    breakdown.pension.optedOut
      ? "Pension (opted out)"
      : "Pension Contribution (8%)",
    formatMoney(breakdown.pension.employeeMonthly),
  );
  drawKeyValueRow(
    breakdown.nhf.optedOut ? "NHF (opted out)" : "National Housing Fund (2.5%)",
    formatMoney(breakdown.nhf.monthly),
  );
  drawLine(y + 4);
  y -= 4;
  drawKeyValueRow(
    "Total Deductions",
    formatMoney(breakdown.totalMonthlyDeductions),
    { bold: true },
  );
  y -= 16;

  // --- Net pay banner ---
  page.drawRectangle({
    x: margin,
    y: y - 8,
    width: width - margin * 2,
    height: 34,
    color: rgb(0.93, 0.96, 0.99),
  });
  drawText("NET PAY", margin + 14, y + 8, {
    size: 12,
    f: bold,
    color: brandBlue,
  });
  drawText(formatMoney(breakdown.netPay), width - margin - 160, y + 8, {
    size: 14,
    f: bold,
    color: brandBlue,
  });
  y -= 44;

  // --- Employer contributions (informational, not deducted) ---
  drawSectionTitle("Employer Contributions (informational only)");
  drawKeyValueRow(
    "Employer Pension Contribution (10%)",
    formatMoney(breakdown.pension.employerMonthly),
  );
  drawKeyValueRow(
    "Rent Relief Applied (annual)",
    formatMoney(breakdown.rentReliefApplied),
  );

  // --- Footer ---
  const footerY = margin;
  drawLine(footerY + 24);
  drawText(
    `Generated ${new Date().toISOString().slice(0, 10)} - system-generated payslip, no signature required.`,
    margin,
    footerY + 10,
    { size: 8, color: midGray },
  );
  drawText(
    `Tax config: ${breakdown.taxConfigLabel || "N/A"}`,
    margin,
    footerY,
    { size: 8, color: midGray },
  );

  return doc.save();
}
