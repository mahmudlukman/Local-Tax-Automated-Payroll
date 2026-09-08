import express from "express";
import {
  runPayroll,
  listPayrollRuns,
  getPayrollRun,
  approvePayrollRun,
  markPayrollRunPaid,
} from "../controllers/payroll.controller";
import {
  getExportFormats,
  exportPayrollRun,
} from "../controllers/payrollExport.controller";
import {
  isAuthenticated,
  authorizeRoles,
  scopeToOwnCompany,
} from "../middlewares/auth";
import { UserRole } from "../models/User";

const payrollRouter = express.Router();

payrollRouter.use(isAuthenticated, scopeToOwnCompany);

payrollRouter.post(
  "/run/payroll",
  authorizeRoles(UserRole.COMPANY_ADMIN, UserRole.HR),
  runPayroll,
);

payrollRouter.get(
  "/payroll-runs",
  authorizeRoles(UserRole.COMPANY_ADMIN, UserRole.HR),
  listPayrollRuns,
);

payrollRouter.get(
  "/export-formats",
  authorizeRoles(UserRole.COMPANY_ADMIN, UserRole.HR),
  getExportFormats,
);
payrollRouter.get(
  "/payroll-run/:id",
  authorizeRoles(UserRole.COMPANY_ADMIN, UserRole.HR),
  getPayrollRun,
);
payrollRouter.post(
  "/payroll-run/:id/approve",
  authorizeRoles(UserRole.COMPANY_ADMIN),
  approvePayrollRun,
);
payrollRouter.post(
  "/payroll-run/:id/mark-paid",
  authorizeRoles(UserRole.COMPANY_ADMIN),
  markPayrollRunPaid,
);
payrollRouter.get(
  "/payroll-run/:id/export",
  authorizeRoles(UserRole.COMPANY_ADMIN),
  exportPayrollRun,
);

export default payrollRouter;
