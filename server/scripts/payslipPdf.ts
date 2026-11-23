import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";
import { PayrollBreakdown } from "../payrollEngine/payrollEngine";

export interface PayslipPdfInput {
  id?: string; // used for the statement number badge, e.g. "#A8B59B99"
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
  if (!acct || acct.length < 4) return "-";
  return `•••• ${acct.slice(-4)}`;
}

// --- Palette (Tailwind neutral / emerald / amber / red, converted to 0-1 rgb) ---
const neutral900 = rgb(0.09, 0.09, 0.09);
const neutral700 = rgb(0.251, 0.251, 0.251);
const neutral600 = rgb(0.322, 0.322, 0.322);
const neutral500 = rgb(0.451, 0.451, 0.451);
const neutral400 = rgb(0.639, 0.639, 0.639);
const neutral200 = rgb(0.898, 0.898, 0.898);
const neutral100 = rgb(0.961, 0.961, 0.961);
const neutral50 = rgb(0.98, 0.98, 0.98);
const white = rgb(1, 1, 1);

const emerald50 = rgb(0.925, 0.992, 0.961);
const emerald200 = rgb(0.655, 0.953, 0.816);
const emerald700 = rgb(0.016, 0.471, 0.341);

const amber50 = rgb(1, 0.984, 0.922);
const amber200 = rgb(0.992, 0.902, 0.541);
const amber700 = rgb(0.706, 0.325, 0.035);

const red600 = rgb(0.863, 0.149, 0.149);

/** Builds a rounded-rect SVG path, corners clamped so radius never exceeds half the shorter side. */
function roundedRectPath(w: number, h: number, r: number): string {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  return [
    `M ${radius},0`,
    `L ${w - radius},0`,
    `Q ${w},0 ${w},${radius}`,
    `L ${w},${h - radius}`,
    `Q ${w},${h} ${w - radius},${h}`,
    `L ${radius},${h}`,
    `Q 0,${h} 0,${h - radius}`,
    `L 0,${radius}`,
    `Q 0,0 ${radius},0`,
    "Z",
  ].join(" ");
}

/** x,y is the TOP-LEFT corner of the rect, in normal PDF (y-up) page coordinates. */
function drawRoundedRect(
  page: PDFPage,
  opts: {
    x: number;
    y: number;
    width: number;
    height: number;
    radius?: number;
    color?: ReturnType<typeof rgb>;
    borderColor?: ReturnType<typeof rgb>;
    borderWidth?: number;
  },
) {
  const {
    x,
    y,
    width,
    height,
    radius = 6,
    color,
    borderColor,
    borderWidth,
  } = opts;
  page.drawSvgPath(roundedRectPath(width, height, radius), {
    x,
    y,
    color,
    borderColor,
    borderWidth,
  });
}

/**
 * Generates a one-page payslip PDF as raw bytes. Pure function - no DB or
 * file-system dependency - so it's easy to unit test and reuse whether the
 * caller wants to stream it in an HTTP response or attach it to an email.
 *
 * Visually mirrors the PayslipDetailPage React component: status badge,
 * hero period title, gross/deductions/net calculation bar, itemized
 * earnings and deductions sections, a dark "net take home" banner, and a
 * two-column footer (bank destination + employer contributions).
 */
export async function generatePayslipPdf(
  input: PayslipPdfInput,
): Promise<Uint8Array> {
  const { company, employee, period, breakdown, bankSnapshot, id } = input;

  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const mono = await doc.embedFont(StandardFonts.Courier);
  const monoBold = await doc.embedFont(StandardFonts.CourierBold);

  const pageMargin = 32;
  const cardX = pageMargin;
  const cardWidth = width - pageMargin * 2;
  const pad = 22; // inner card padding, ~ p-6

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
      color: opts.color ?? neutral900,
    });
  };

  const drawRightAligned = (
    text: string,
    rightX: number,
    yPos: number,
    opts: { size?: number; f?: PDFFont; color?: ReturnType<typeof rgb> } = {},
  ) => {
    const size = opts.size ?? 10;
    const f = opts.f ?? font;
    const textWidth = f.widthOfTextAtSize(text, size);
    drawText(text, rightX - textWidth, yPos, opts);
  };

  const drawHLine = (
    x1: number,
    x2: number,
    yPos: number,
    color = neutral200,
  ) => {
    page.drawLine({
      start: { x: x1, y: yPos },
      end: { x: x2, y: yPos },
      thickness: 0.75,
      color,
    });
  };

  const drawVLine = (x: number, y1: number, y2: number, color = neutral200) => {
    page.drawLine({
      start: { x, y: y1 },
      end: { x, y: y2 },
      thickness: 0.75,
      color,
    });
  };

  /** Small pill-shaped chip (badges like "Paid Statement", "Opted Out", "Exempt"). */
  const drawChip = (
    text: string,
    x: number,
    yPos: number,
    opts: {
      bg: ReturnType<typeof rgb>;
      border: ReturnType<typeof rgb>;
      textColor: ReturnType<typeof rgb>;
    },
  ): number => {
    const size = 7.5;
    const textWidth = bold.widthOfTextAtSize(text, size);
    const chipW = textWidth + 14;
    const chipH = 13;
    drawRoundedRect(page, {
      x,
      y: yPos + chipH,
      width: chipW,
      height: chipH,
      radius: chipH / 2,
      color: opts.bg,
      borderColor: opts.border,
      borderWidth: 0.75,
    });
    drawText(text, x + 7, yPos + 3.5, { size, f: bold, color: opts.textColor });
    return chipW;
  };

  // ============ Outer statement card ============
  // Height is computed top-down as we go, so start by laying out content
  // on a scratch cursor, then draw the enclosing card border last of all
  // isn't practical without pre-measuring - instead we draw the card
  // border AFTER computing total height via a first pass. Simpler: we
  // reserve a generous fixed card top/bottom and draw content within it.
  const cardTop = height - pageMargin;
  let y = cardTop - pad;

  // --- Header ---
  const headerTopY = y;
  const chipWidth = drawChip("Paid Statement", cardX + pad, y - 10, {
    bg: emerald50,
    border: emerald200,
    textColor: emerald700,
  });
  if (id) {
    drawText(
      `#${id.slice(-8).toUpperCase()}`,
      cardX + pad + chipWidth + 8,
      y - 7,
      { size: 8, f: mono, color: neutral400 },
    );
  }
  y -= 26;

  drawText(`${MONTH_NAMES[period.month - 1]} ${period.year}`, cardX + pad, y, {
    size: 18,
    f: bold,
    color: neutral900,
  });
  y -= 16;

  drawText(
    `${employee.firstName} ${employee.lastName}  ·  ID: ${employee.employeeId}`,
    cardX + pad,
    y,
    { size: 9, f: font, color: neutral600 },
  );

  // Right-aligned "HR" badge + caption, vertically centered against the header block
  const hrBoxSize = 26;
  const hrBoxX = cardX + cardWidth - pad - hrBoxSize;
  const hrBoxY = headerTopY - 4;
  drawRoundedRect(page, {
    x: hrBoxX,
    y: hrBoxY,
    width: hrBoxSize,
    height: hrBoxSize,
    radius: 6,
    color: neutral900,
  });
  const hrLabel = "HR";
  const hrLabelWidth = bold.widthOfTextAtSize(hrLabel, 9);
  drawText(
    hrLabel,
    hrBoxX + (hrBoxSize - hrLabelWidth) / 2,
    hrBoxY - hrBoxSize + 10,
    {
      size: 9,
      f: bold,
      color: white,
    },
  );
  drawRightAligned(
    "Salary Remittance",
    cardX + cardWidth - pad,
    hrBoxY - hrBoxSize - 6,
    {
      size: 7.5,
      color: neutral500,
    },
  );

  y -= 16;
  drawHLine(cardX + pad, cardX + cardWidth - pad, y);
  y -= 20;

  // --- Calculation bar (Gross / Deductions / Net) ---
  const barHeight = 46;
  drawRoundedRect(page, {
    x: cardX + pad,
    y,
    width: cardWidth - pad * 2,
    height: barHeight,
    radius: 8,
    color: neutral50,
    borderColor: neutral200,
    borderWidth: 0.75,
  });
  const barInnerY = y - 16;
  const colWidth = (cardWidth - pad * 2) / 3;
  const col1X = cardX + pad + 12;
  const col2X = col1X + colWidth;
  const col3X = col2X + colWidth;

  drawText("Gross Pay", col1X, barInnerY, { size: 7.5, color: neutral500 });
  drawText(formatMoney(breakdown.monthlyGross), col1X, barInnerY - 15, {
    size: 10.5,
    f: monoBold,
    color: neutral900,
  });

  drawText("Total Deductions", col2X, barInnerY, {
    size: 7.5,
    color: neutral500,
  });
  drawText(
    `-${formatMoney(breakdown.totalMonthlyDeductions)}`,
    col2X,
    barInnerY - 15,
    {
      size: 10.5,
      f: monoBold,
      color: red600,
    },
  );

  drawVLine(col3X - 10, y - 10, y - barHeight + 10, neutral200);
  drawText("Net Disbursement", col3X, barInnerY, {
    size: 7.5,
    f: bold,
    color: neutral900,
  });
  drawText(formatMoney(breakdown.netPay), col3X, barInnerY - 15, {
    size: 10.5,
    f: monoBold,
    color: emerald700,
  });

  y -= barHeight + 22;

  // --- Section header helper (icon box omitted - pdf-lib has no built-in
  // icon set; a plain neutral chip stands in for the Lucide icon glyph) ---
  const drawSectionHeader = (title: string, subtitle: string) => {
    drawRoundedRect(page, {
      x: cardX + pad,
      y: y + 4,
      width: 20,
      height: 20,
      radius: 5,
      color: neutral100,
    });
    drawText(title, cardX + pad + 28, y - 3, {
      size: 8.5,
      f: bold,
      color: neutral900,
    });
    drawText(subtitle, cardX + pad + 28, y - 13, {
      size: 7,
      color: neutral500,
    });
    y -= 22;
    drawHLine(cardX + pad, cardX + cardWidth - pad, y);
    y -= 14;
  };

  const drawRow = (
    label: string,
    value: string,
    opts: {
      bold?: boolean;
      negative?: boolean;
      chip?: {
        text: string;
        bg: ReturnType<typeof rgb>;
        border: ReturnType<typeof rgb>;
        textColor: ReturnType<typeof rgb>;
      };
    } = {},
  ) => {
    const labelF = opts.bold ? bold : font;
    const labelColor = opts.bold ? neutral900 : neutral600;
    drawText(label, cardX + pad, y, {
      size: 8.5,
      f: labelF,
      color: labelColor,
    });

    if (opts.chip) {
      const labelWidth = labelF.widthOfTextAtSize(label, 8.5);
      drawChip(opts.chip.text, cardX + pad + labelWidth + 8, y - 4, {
        bg: opts.chip.bg,
        border: opts.chip.border,
        textColor: opts.chip.textColor,
      });
    }

    const valueText = `${opts.negative ? "- " : ""}${value}`;
    const valueColor = opts.bold
      ? neutral900
      : opts.negative
        ? red600
        : neutral700;
    drawRightAligned(valueText, cardX + cardWidth - pad, y, {
      size: 8.5,
      f: opts.bold ? monoBold : mono,
      color: valueColor,
    });
    y -= 15;
  };

  // --- Earnings Breakdown ---
  drawSectionHeader(
    "Earnings Breakdown",
    "Base salary structure and statutory monthly allowances",
  );
  drawRow("Basic Salary", formatMoney(breakdown.basic));
  drawRow("Housing Allowance", formatMoney(breakdown.housing));
  drawRow("Transport Allowance", formatMoney(breakdown.transport));
  if (breakdown.taxableAllowances > 0) {
    drawRow(
      "Other Taxable Allowances",
      formatMoney(breakdown.taxableAllowances),
    );
  }
  if (breakdown.nonTaxableAllowances > 0) {
    drawRow(
      "Other Non-Taxable Allowances",
      formatMoney(breakdown.nonTaxableAllowances),
      {
        chip: {
          text: "Exempt",
          bg: neutral100,
          border: neutral200,
          textColor: neutral600,
        },
      },
    );
  }
  y -= 2;
  drawHLine(cardX + pad, cardX + cardWidth - pad, y, neutral100);
  y -= 12;
  drawRow("Total Monthly Gross Pay", formatMoney(breakdown.monthlyGross), {
    bold: true,
  });
  y -= 8;

  // --- Statutory Deductions & Taxes ---
  drawSectionHeader(
    "Statutory Deductions & Taxes",
    "Itemized PAYE tax withholdings and employee pension contributions",
  );
  drawRow("PAYE Tax Withholding", formatMoney(breakdown.paye.monthly), {
    negative: true,
  });
  drawRow(
    "Pension Contribution (Employee)",
    formatMoney(breakdown.pension.employeeMonthly),
    {
      negative: true,
      chip: breakdown.pension.optedOut
        ? {
            text: "Opted Out",
            bg: amber50,
            border: amber200,
            textColor: amber700,
          }
        : undefined,
    },
  );
  drawRow("National Housing Fund (NHF)", formatMoney(breakdown.nhf.monthly), {
    negative: true,
    chip: breakdown.nhf.optedOut
      ? {
          text: "Opted Out",
          bg: amber50,
          border: amber200,
          textColor: amber700,
        }
      : undefined,
  });
  y -= 2;
  drawHLine(cardX + pad, cardX + cardWidth - pad, y, neutral100);
  y -= 12;
  drawRow(
    "Total Monthly Deductions",
    formatMoney(breakdown.totalMonthlyDeductions),
    {
      bold: true,
      negative: true,
    },
  );
  y -= 10;

  // --- Net Take Home hero banner ---
  const heroHeight = 40;
  drawRoundedRect(page, {
    x: cardX + pad,
    y,
    width: cardWidth - pad * 2,
    height: heroHeight,
    radius: 10,
    color: neutral900,
  });
  drawText("Total Net Salary Paid", cardX + pad + 14, y - 15, {
    size: 8,
    color: neutral400,
  });
  drawText("Credited directly to bank account", cardX + pad + 14, y - 26, {
    size: 7,
    color: neutral400,
  });
  drawRightAligned(
    formatMoney(breakdown.netPay),
    cardX + cardWidth - pad - 14,
    y - 21,
    {
      size: 13,
      f: monoBold,
      color: white,
    },
  );
  y -= heroHeight + 18;

  // --- Footer: two columns (Disbursement Account / Employer Contributions) ---
  const footerColGap = 12;
  const footerColWidth = (cardWidth - pad * 2 - footerColGap) / 2;
  const footerBoxHeight = 58;
  const footerBoxY = y;
  const col1BoxX = cardX + pad;
  const col2BoxX = col1BoxX + footerColWidth + footerColGap;

  if (bankSnapshot) {
    drawRoundedRect(page, {
      x: col1BoxX,
      y: footerBoxY,
      width: footerColWidth,
      height: footerBoxHeight,
      radius: 8,
      borderColor: neutral200,
      borderWidth: 0.75,
    });
    let by = footerBoxY - 16;
    drawText("Disbursement Account", col1BoxX + 12, by, {
      size: 8,
      f: bold,
      color: neutral900,
    });
    by -= 14;
    drawText("Bank:", col1BoxX + 12, by, { size: 7.5, color: neutral600 });
    drawRightAligned(
      bankSnapshot.bankName || "-",
      col1BoxX + footerColWidth - 12,
      by,
      {
        size: 7.5,
        f: bold,
        color: neutral900,
      },
    );
    by -= 12;
    drawText("Account Number:", col1BoxX + 12, by, {
      size: 7.5,
      color: neutral600,
    });
    drawRightAligned(
      maskAccountNumber(bankSnapshot.accountNumber),
      col1BoxX + footerColWidth - 12,
      by,
      {
        size: 7.5,
        f: monoBold,
        color: neutral900,
      },
    );
  }

  drawRoundedRect(page, {
    x: col2BoxX,
    y: footerBoxY,
    width: footerColWidth,
    height: footerBoxHeight,
    radius: 8,
    borderColor: neutral200,
    borderWidth: 0.75,
  });
  let ey = footerBoxY - 16;
  drawText("Employer Contributions", col2BoxX + 12, ey, {
    size: 8,
    f: bold,
    color: neutral900,
  });
  ey -= 14;
  drawText("Employer Pension Match:", col2BoxX + 12, ey, {
    size: 7.5,
    color: neutral600,
  });
  drawRightAligned(
    formatMoney(breakdown.pension.employerMonthly || 0),
    col2BoxX + footerColWidth - 12,
    ey,
    { size: 7.5, f: monoBold, color: neutral900 },
  );
  ey -= 13;
  drawText("Employer match is remitted directly to your", col2BoxX + 12, ey, {
    size: 6,
    color: neutral400,
  });
  ey -= 8;
  drawText("Pension Fund Administrator (PFA).", col2BoxX + 12, ey, {
    size: 6,
    color: neutral400,
  });

  y = footerBoxY - footerBoxHeight - 20;

  // --- Outer card border, drawn last now that we know the full content height ---
  const cardHeight = cardTop - y;
  drawRoundedRect(page, {
    x: cardX,
    y: cardTop,
    width: cardWidth,
    height: cardHeight,
    radius: 12,
    borderColor: neutral200,
    borderWidth: 0.75,
  });

  // --- Page footer (audit metadata, outside the statement card - the
  // frontend doesn't render this, but it's useful provenance for a PDF) ---
  const auditY = y - 16;
  drawText(company.name, cardX, auditY, {
    size: 7,
    f: bold,
    color: neutral500,
  });
  drawText(
    `Generated ${new Date().toISOString().slice(0, 10)} · system-generated, no signature required · Tax config: ${
      breakdown.taxConfigLabel || "N/A"
    }`,
    cardX,
    auditY - 10,
    { size: 6.5, color: neutral400 },
  );

  return doc.save();
}
