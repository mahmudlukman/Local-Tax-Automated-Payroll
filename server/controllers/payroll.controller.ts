import { catchAsyncError } from "../middlewares/catchAsyncErrors";
import { NextFunction, Request, Response } from "express";
import PayrollRun, { IPayrollTotals } from "../models/PayrollRun";
import Payslip from "../models/Payslip";
import Employee from "../models/Employee";
import Company from "../models/Company";
import TaxConfig from "../models/TaxConfig";
import {
  calculateEmployeePayroll,
  calculateEmployerLevies,
  round2,
} from "../payrollEngine/payrollEngine";
import ErrorHandler from "../utils/errorHandler";

const resolveCompanyScope = (req: Request): string | undefined => {
  if (req.user!.role === "super_admin") {
    return (req.query.company as string) || req.body.company;
  }
  return req.user!.company?.toString();
};

/**
 * @desc    Run payroll for a company for a given month/year. Calculates
 *          every active employee through the payroll engine and stores a
 *          Payslip snapshot for each, plus company-level totals on the run.
 *          Safe to call again on a 'draft' run - it recalculates and
 *          overwrites that run's payslips (e.g. after fixing an employee's
 *          salary before approval). Cannot be re-run once 'approved'.
 * @route   POST /api/payroll/runs
 * @body    { month, year }
 * @access  Private (company_admin, hr)
 */
export const runPayroll = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const company = resolveCompanyScope(req);
    const { month, year } = req.body as { month?: number; year?: number };

    if (!company || !month || !year) {
      return next(
        new ErrorHandler("company, month and year are required", 400),
      );
    }

    const companyDoc = await Company.findById(company);
    if (!companyDoc) {
      return next(new ErrorHandler("Company not found", 404));
    }

    const periodDate = new Date(year, month - 1, 1);
    const taxConfig = await TaxConfig.getActiveConfig(periodDate);
    if (!taxConfig) {
      return next(
        new ErrorHandler(
          `No active tax configuration found for ${month}/${year}. Create one before running payroll.`,
          422,
        ),
      );
    }

    let payrollRun = await PayrollRun.findOne({
      company,
      "period.month": month,
      "period.year": year,
    });

    if (payrollRun && payrollRun.status !== "draft") {
      res.status(409);
      throw new Error(
        `Payroll for ${month}/${year} is already '${payrollRun.status}' and cannot be re-run. Revert it to draft first if a correction is needed.`,
      );
    }

    if (!payrollRun) {
      payrollRun = await PayrollRun.create({
        company,
        period: { month, year },
        taxConfig: taxConfig._id,
        runBy: req.user!._id,
        status: "draft",
      });
    } else {
      payrollRun.taxConfig = taxConfig._id as any;
      payrollRun.runBy = req.user!._id as any;
    }

    const employees = await Employee.find({
      company,
      employmentStatus: "active",
    });

    if (employees.length === 0) {
      res.status(422);
      throw new Error("No active employees found for this company");
    }

    // Clear any prior payslips for this run before regenerating (idempotent re-run)
    await Payslip.deleteMany({ payrollRun: payrollRun._id });

    const totals: IPayrollTotals = {
      employeeCount: 0,
      totalGross: 0,
      totalPAYE: 0,
      totalEmployeePension: 0,
      totalEmployerPension: 0,
      totalNHF: 0,
      totalNetPay: 0,
      itf: 0,
      nsitf: 0,
    };

    const payslipDocs = [];

    for (const employee of employees) {
      const breakdown = calculateEmployeePayroll(employee, taxConfig);

      payslipDocs.push({
        company,
        payrollRun: payrollRun._id,
        employee: employee._id,
        period: { month, year },
        breakdown,
        netPay: breakdown.netPay,
        bankSnapshot: employee.bank,
      });

      totals.employeeCount += 1;
      totals.totalGross = round2(totals.totalGross + breakdown.monthlyGross);
      totals.totalPAYE = round2(totals.totalPAYE + breakdown.paye.monthly);
      totals.totalEmployeePension = round2(
        totals.totalEmployeePension + breakdown.pension.employeeMonthly,
      );
      totals.totalEmployerPension = round2(
        totals.totalEmployerPension + breakdown.pension.employerMonthly,
      );
      totals.totalNHF = round2(totals.totalNHF + breakdown.nhf.monthly);
      totals.totalNetPay = round2(totals.totalNetPay + breakdown.netPay);
    }

    await Payslip.insertMany(payslipDocs);

    const levies = calculateEmployerLevies(
      totals.totalGross,
      companyDoc,
      taxConfig,
    );
    totals.itf = levies.itf.monthly;
    totals.nsitf = levies.nsitf.monthly;

    payrollRun.totals = totals;
    payrollRun.status = "draft";
    await payrollRun.save();

    const payslips = await Payslip.find({
      payrollRun: payrollRun._id,
    }).populate("employee", "firstName lastName employeeId");

    res.status(201).json({ payrollRun, payslips });
  },
);

/**
 * @desc    List payroll runs for a company
 * @route   GET /api/payroll/runs
 * @access  Private (company_admin, hr)
 */
export const listPayrollRuns = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const company = resolveCompanyScope(req);
    const runs = await PayrollRun.find({ company }).sort({
      "period.year": -1,
      "period.month": -1,
    });
    res.status(200).json(runs);
  },
);

/**
 * @desc    Get a payroll run with all its payslips
 * @route   GET /api/payroll/runs/:id
 * @access  Private (company_admin, hr)
 */
export const getPayrollRun = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const company = resolveCompanyScope(req);

    const run = await PayrollRun.findOne({ _id: req.params.id, company });
    if (!run) {
      return next(new ErrorHandler("Payroll run not found", 404));
    }

    const payslips = await Payslip.find({ payrollRun: run._id }).populate(
      "employee",
      "firstName lastName employeeId department",
    );

    res.status(200).json({ payrollRun: run, payslips });
  },
);

/**
 * @desc    Approve a draft payroll run, locking it so it can move to bank
 *          export / payslip delivery. Cannot be edited or re-run after this.
 * @route   POST /api/payroll/runs/:id/approve
 * @access  Private (company_admin only)
 */
export const approvePayrollRun = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const company = resolveCompanyScope(req);

    const run = await PayrollRun.findOne({ _id: req.params.id, company });
    if (!run) {
      return next(new ErrorHandler("Payroll run not found", 404));
    }
    if (run.status !== "draft") {
      return next(
        new ErrorHandler(
          `Only draft runs can be approved (current status: ${run.status})`,
          409,
        ),
      );
    }

    run.status = "approved";
    run.approvedBy = req.user!._id as any;
    run.approvedAt = new Date();
    await run.save();

    res.status(200).json(run);
  },
);

/**
 * @desc    Mark an approved payroll run as paid, once the bank transfer has
 *          gone through. This is the gate before payslips get sent out.
 * @route   POST /api/payroll/runs/:id/mark-paid
 * @access  Private (company_admin only)
 */
export const markPayrollRunPaid = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const company = resolveCompanyScope(req);

    const run = await PayrollRun.findOne({ _id: req.params.id, company });
    if (!run) {
      return next(new ErrorHandler("Payroll run not found", 404));
    }
    if (run.status !== "approved") {
      return next(
        new ErrorHandler(
          `Only approved runs can be marked as paid (current status: ${run.status})`,
          409,
        ),
      );
    }

    run.status = "paid";
    run.paidAt = new Date();
    await run.save();

    res.status(200).json(run);
  },
);
