/**
 * Shared types for turning an approved payroll run into a bulk bank
 * transfer file. NIBSS itself does not publish one universal public bulk
 * -upload spec - each bank's corporate/bulk-payment portal (GTBank, Access,
 * Zenith, etc.) has its own column layout, though most converge on the same
 * underlying fields (NUBAN account number, bank code, amount, narration,
 * beneficiary name). Treat every formatter below except 'generic' as a
 * starting point to be confirmed against the target bank's actual template
 * before relying on it in production.
 */

export interface PaymentInstruction {
  employeeId: string; // company-internal staff ID, for reconciliation
  beneficiaryName: string;
  accountNumber: string;
  bankCode: string;
  bankName?: string;
  amount: number; // net pay for the period
  narration: string;
}

export interface BankExportResult {
  filename: string;
  mimeType: string;
  content: string;
}

export type BankExportFormatId = "generic" | "gtbank" | "zenith";

export interface BankExportFormatter {
  id: BankExportFormatId;
  label: string;
  /** True once this has been confirmed against the bank's real template. */
  verified: boolean;
  generate(
    instructions: PaymentInstruction[],
    periodLabel: string,
  ): BankExportResult;
}
