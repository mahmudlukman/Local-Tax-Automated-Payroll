import { catchAsyncError } from "../middlewares/catchAsyncErrors";
import { NextFunction, Request, Response } from "express";
import Payslip from "../models/Payslip";
import Company from "../models/Company";
import { IEmployee } from "../models/Employee";
import ErrorHandler from "../utils/errorHandler";
import { generatePayslipPdf } from "../scripts/payslipPdf";

const resolveCompanyScope = (req: Request): string | undefined => {
  if (req.user!.role === "super_admin") {
    return (
      (req.query.company as string) ||
      (req.body as { company?: string }).company
    );
  }
  return req.user!.company?.toString();
};

/**
 * @desc    List payslips. HR/admin see the whole company (optionally
 *          filtered by employee/period); an employee sees only their own.
 * @route   GET /api/payslips?employee=&month=&year=
 * @access  Private
 */
export const listPayslips = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const filter: Record<string, unknown> = {};

    if (req.user!.role === "employee") {
      if (!req.user!.employee) {
        return next(
          new ErrorHandler(
            "his account is not linked to an employee record",
            403,
          ),
        );
      }
      filter.employee = req.user!.employee;
    } else {
      const company = resolveCompanyScope(req);
      if (!company) {
        return next(new ErrorHandler("company is required", 400));
      }
      filter.company = company;
      if (req.query.employee) filter.employee = req.query.employee;
    }

    if (req.query.month) filter["period.month"] = Number(req.query.month);
    if (req.query.year) filter["period.year"] = Number(req.query.year);

    const payslips = await Payslip.find(filter)
      .populate("employee", "firstName lastName employeeId department")
      .sort({ "period.year": -1, "period.month": -1 });

    res.json(payslips);
  },
);

/**
 * Shared lookup + access check used by both the JSON and PDF routes.
 */
const findAuthorizedPayslip = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const payslip = await Payslip.findById(req.params.id).populate("employee");

  if (!payslip) {
    return next(new ErrorHandler("Payslip not found", 404));
  }

  if (req.user!.role === "employee") {
    if (req.user!.employee?.toString() !== payslip.employee._id.toString()) {
      return next(new ErrorHandler("Not authorized to view this payslip", 403));
    }
  } else {
    const company = resolveCompanyScope(req);
    if (payslip.company.toString() !== company) {
      return next(
        new ErrorHandler(
          "Not authorized to access another company's data",
          403,
        ),
      );
    }
  }

  return payslip;
};

/**
 * @desc    Get a single payslip as JSON (full breakdown)
 * @route   GET /api/payslips/:id
 * @access  Private (company_admin, hr, or the employee themself)
 */
export const getPayslip = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const payslip = await findAuthorizedPayslip(req, res, next);
    if (!payslip) {
      return next(new ErrorHandler("Payslip not found", 400));
    }
    res.status(200).json({ success: true, payslip });
  },
);

/**
 * @desc    Download a payslip as a PDF
 * @route   GET /api/payslips/:id/pdf
 * @access  Private (company_admin, hr, or the employee themself)
 */
export const getPayslipPdf = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const payslip = await findAuthorizedPayslip(req, res, next);
    if (!payslip) {
      return next(new ErrorHandler("Payslip not found", 404));
    }
    const employee = payslip.employee as unknown as IEmployee;

    const company = await Company.findById(payslip.company);
    if (!company) {
      return next(new ErrorHandler("Company not found", 404));
    }

    const pdfBytes = await generatePayslipPdf({
      company: {
        name: company.name,
        address: company.address,
        state: company.state,
      },
      employee: {
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        jobTitle: employee.jobTitle,
        department: employee.department,
        tin: employee.tin,
        pensionPIN: employee.pensionPIN,
      },
      period: payslip.period,
      breakdown: payslip.breakdown,
      bankSnapshot: payslip.bankSnapshot,
    });

    const filename = `payslip-${employee.employeeId}-${payslip.period.year}-${String(
      payslip.period.month,
    ).padStart(2, "0")}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(Buffer.from(pdfBytes));
  },
);
