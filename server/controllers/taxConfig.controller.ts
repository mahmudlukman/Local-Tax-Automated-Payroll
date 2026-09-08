import { catchAsyncError } from "../middlewares/catchAsyncErrors";
import { NextFunction, Request, Response } from "express";
import TaxConfig from "../models/TaxConfig";
import ErrorHandler from "../utils/errorHandler";

/**
 * @desc    Create a new tax config version. Does NOT edit existing configs -
 *          rate changes are always a new version, so past payroll runs stay
 *          reproducible against the rules that applied at the time.
 * @route   POST /api/tax-configs
 * @access  Private (super_admin only)
 */
export const createTaxConfig = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const config = await TaxConfig.create(req.body);
    res.status(201).json({ success: true, config });
  },
);

/**
 * @desc    List all tax config versions
 * @route   GET /api/tax-configs
 * @access  Private (super_admin only)
 */
export const listTaxConfigs = catchAsyncError(
  async (_req: Request, res: Response) => {
    const configs = await TaxConfig.find().sort({ effectiveFrom: -1 });
    res.status(200).json({ success: true, configs });
  },
);

/**
 * @desc    Get whichever tax config is active on a given date (defaults to now)
 * @route   GET /api/tax-configs/active?date=2026-03-01
 * @access  Private (any authenticated role - needed to preview calculations)
 */
export const getActiveTaxConfig = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const onDate = req.query.date
      ? new Date(req.query.date as string)
      : new Date();
    const config = await TaxConfig.getActiveConfig(onDate);

    if (!config) {
      return next(
        new ErrorHandler(
          "No active tax configuration found for this date",
          404,
        ),
      );
    }
    res.status(200).json({ success: true, config });
  },
);
