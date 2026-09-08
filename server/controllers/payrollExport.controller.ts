import { catchAsyncError } from "../middlewares/catchAsyncErrors";
import { NextFunction, Request, Response } from "express";
import PayrollRun from "../models/PayrollRun";
import Payslip, { IPayslip } from "../models/Payslip";
import { PaymentInstruction } from "../scripts/nibss";
import { getFormatter, listFormatters } from "../scripts/bankExportFormat";
import ErrorHandler from "../utils/errorHandler";

const resolveCompanyScope = (req: Request): string | undefined => {
  if (req.user!.role === "super_admin") {
    return (req.query.company as string) || req.body.company;
  }
  return req.user!.company?.toString();
};

interface PopulatedEmployeeRef {
  _id: unknown;
  employeeId: string;
  firstName: string;
  lastName: string;
}

/**
 * Builds one PaymentInstruction per payslip, using the bank details
 * snapshot stored at payslip-generation time (not live employee data,
 * which may have changed since). Flags any payslip missing usable bank
 * details rather than silently emitting a broken row.
 */
function buildInstructions(payslips: IPayslip[]): {
  instructions: PaymentInstruction[];
  missingBankDetails: string[];
} {
  const instructions: PaymentInstruction[] = [];
  const missingBankDetails: string[] = [];

  for (const slip of payslips) {
    const employee = slip.employee as unknown as PopulatedEmployeeRef;
    const bank = slip.bankSnapshot;

    if (!bank?.accountNumber || !bank?.bankCode) {
      missingBankDetails.push(
        employee?.employeeId
          ? `${employee.employeeId} (${employee.firstName} ${employee.lastName})`
          : String(slip.employee),
      );
      continue;
    }

    instructions.push({
      employeeId: employee?.employeeId ?? "",
      beneficiaryName:
        bank.accountName ||
        `${employee?.firstName ?? ""} ${employee?.lastName ?? ""}`.trim(),
      accountNumber: bank.accountNumber,
      bankCode: bank.bankCode,
      bankName: bank.bankName,
      amount: slip.netPay,
      narration: `Salary ${slip.period.month}/${slip.period.year}`,
    });
  }

  return { instructions, missingBankDetails };
}

/**
 * @desc    List available bank export formats
 * @route   GET /api/payroll/runs/export-formats
 * @access  Private (company_admin, hr)
 */
export const getExportFormats = catchAsyncError(
  async (_req: Request, res: Response) => {
    res.json(listFormatters());
  },
);

/**
 * @desc    Export an approved payroll run as a bulk bank-transfer file.
 *          Requires the run to be 'approved' (or 'paid', for re-download) -
 *          a draft run's figures aren't final enough to send to a bank.
 * @route   GET /api/payroll/runs/:id/export?format=generic
 * @access  Private (company_admin only)
 */
export const exportPayrollRun = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const company = resolveCompanyScope(req);
    const formatId = (req.query.format as string) || "generic";

    const formatter = getFormatter(formatId);
    if (!formatter) {
      return next(
        new ErrorHandler(
          `Unknown export format '${formatId}'. Available: ${listFormatters()
            .map((f) => f.id)
            .join(", ")}`,
          400,
        ),
      );
    }

    const run = await PayrollRun.findOne({ _id: req.params.id, company });
    if (!run) {
      return next(new ErrorHandler("Payroll run not found", 404));
    }

    if (run.status === "draft") {
      return next(
        new ErrorHandler(
          "This payroll run is still a draft. Approve it before exporting a bank transfer file.",
          409,
        ),
      );
    }

    const payslips = await Payslip.find({ payrollRun: run._id }).populate(
      "employee",
      "firstName lastName employeeId",
    );

    const { instructions, missingBankDetails } = buildInstructions(payslips);

    if (missingBankDetails.length > 0) {
      return next(
        new ErrorHandler(
          `Cannot export: missing bank details for: ${missingBankDetails.join(", ")}. Update their records and re-run payroll before exporting.`,
          422,
        ),
      );
    }

    const periodLabel = `${run.period.year}-${String(run.period.month).padStart(2, "0")}`;
    const result = formatter.generate(instructions, periodLabel);

    if (!formatter.verified) {
      // Surface the caveat as a response header rather than silently baking
      // an unverified template into a file the customer trusts blindly.
      res.setHeader("X-Export-Format-Verified", "false");
    }

    res.setHeader("Content-Type", result.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${result.filename}"`,
    );
    res.send(result.content);
  },
);
