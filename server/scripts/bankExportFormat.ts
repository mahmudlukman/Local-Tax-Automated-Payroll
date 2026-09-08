import {
  BankExportFormatId,
  BankExportFormatter,
  BankExportResult,
  PaymentInstruction,
} from "./Nibss";
import { toCsv } from "./csv";

/**
 * Baseline format covering the fields every bank's bulk-upload template
 * needs in some order: account number, bank code, amount, narration,
 * beneficiary name. Safe to hand to a bank's support team as a starting
 * point, or to re-column-order for whichever portal you're mapping to.
 */
const genericFormatter: BankExportFormatter = {
  id: "generic",
  label: "Generic NUBAN CSV",
  verified: true,
  generate(
    instructions: PaymentInstruction[],
    periodLabel: string,
  ): BankExportResult {
    const headers = [
      "AccountNumber",
      "BankCode",
      "Amount",
      "Narration",
      "BeneficiaryName",
      "EmployeeID",
    ];
    const rows = instructions.map((i) => [
      i.accountNumber,
      i.bankCode,
      i.amount.toFixed(2),
      i.narration,
      i.beneficiaryName,
      i.employeeId,
    ]);
    return {
      filename: `payroll-export-generic-${periodLabel}.csv`,
      mimeType: "text/csv",
      content: toCsv(headers, rows),
    };
  },
};

/**
 * Illustrative GTBank-style layout. GTBank's corporate bulk-payment upload
 * template is only published inside their corporate banking portal, so
 * this column set is a best-guess starting point — confirm the exact
 * headers/order with GTBank (or your pilot customer's relationship
 * manager) before using this in production.
 */
const gtbankFormatter: BankExportFormatter = {
  id: "gtbank",
  label: "GTBank-style CSV (unverified - confirm with bank)",
  verified: false,
  generate(
    instructions: PaymentInstruction[],
    periodLabel: string,
  ): BankExportResult {
    const headers = [
      "Beneficiary Account Number",
      "Beneficiary Bank Code",
      "Amount",
      "Payment Reference",
      "Beneficiary Name",
    ];
    const rows = instructions.map((i) => [
      i.accountNumber,
      i.bankCode,
      i.amount.toFixed(2),
      i.narration,
      i.beneficiaryName,
    ]);
    return {
      filename: `payroll-export-gtbank-${periodLabel}.csv`,
      mimeType: "text/csv",
      content: toCsv(headers, rows),
    };
  },
};

/**
 * Illustrative Zenith-style layout, same caveat as above.
 */
const zenithFormatter: BankExportFormatter = {
  id: "zenith",
  label: "Zenith-style CSV (unverified - confirm with bank)",
  verified: false,
  generate(
    instructions: PaymentInstruction[],
    periodLabel: string,
  ): BankExportResult {
    const headers = [
      "S/N",
      "Beneficiary Name",
      "Account Number",
      "Bank Code",
      "Amount",
      "Narration",
    ];
    const rows = instructions.map((i, idx) => [
      idx + 1,
      i.beneficiaryName,
      i.accountNumber,
      i.bankCode,
      i.amount.toFixed(2),
      i.narration,
    ]);
    return {
      filename: `payroll-export-zenith-${periodLabel}.csv`,
      mimeType: "text/csv",
      content: toCsv(headers, rows),
    };
  },
};

const registry: Record<BankExportFormatId, BankExportFormatter> = {
  generic: genericFormatter,
  gtbank: gtbankFormatter,
  zenith: zenithFormatter,
};

export const getFormatter = (id: string): BankExportFormatter | undefined => {
  return registry[id as BankExportFormatId];
};

export const listFormatters = (): {
  id: BankExportFormatId;
  label: string;
  verified: boolean;
}[] => {
  return Object.values(registry).map(({ id, label, verified }) => ({
    id,
    label,
    verified,
  }));
};
