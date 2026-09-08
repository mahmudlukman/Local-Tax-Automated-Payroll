import { catchAsyncError } from "../middlewares/catchAsyncErrors";
import { NextFunction, Request, Response } from "express";
import Company from "../models/Company";
import ErrorHandler from "../utils/errorHandler";

const EDITABLE_FIELDS = [
  "name",
  "rcNumber",
  "industry",
  "address",
  "state",
  "contactEmail",
  "contactPhone",
  "itfApplicable",
  "nsitfApplicable",
] as const;

/**
 * @desc    Get the caller's own company (or a specific one, if super_admin)
 * @route   GET /api/companies/:id
 * @access  Private
 */
export const getCompany = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const companyId =
      req.user!.role === "super_admin" ? req.params.id : req.user!.company;

    const company = await Company.findById(companyId);
    if (!company) {
      return next(new ErrorHandler("Company not found", 404));
    }
    res.status(200).json({ success: true, company });
  },
);

/**
 * @desc    List all companies (platform-level view)
 * @route   GET /api/companies
 * @access  Private (super_admin only)
 */
export const listCompanies = catchAsyncError(
  async (_req: Request, res: Response, next: NextFunction) => {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, companies });
  },
);

/**
 * @desc    Update the caller's own company profile
 * @route   PUT /api/companies/:id
 * @access  Private (company_admin, super_admin)
 */
export const updateCompany = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const companyId =
      req.user!.role === "super_admin" ? req.params.id : req.user!.company;

    const company = await Company.findById(companyId);
    if (!company) {
      return next(new ErrorHandler("Company not found", 404));
    }

    EDITABLE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        (company as unknown as Record<string, unknown>)[field] =
          req.body[field];
      }
    });

    const updatedCompany = await company.save();
    res
      .status(200)
      .json({
        success: true,
        message: "Company updated successfully",
        updatedCompany,
      });
  },
);
