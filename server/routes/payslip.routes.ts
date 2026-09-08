import express from "express";
import {
  listPayslips,
  getPayslip,
  getPayslipPdf,
} from "../controllers/payslip.controller";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth";
import { UserRole } from "../models/User";

const payslipRouter = express.Router();

payslipRouter.use(isAuthenticated);

payslipRouter.get(
  "/payslips",
  authorizeRoles(UserRole.COMPANY_ADMIN, UserRole.HR, UserRole.EMPLOYEE),
  listPayslips,
);
payslipRouter.get(
  "/payslip/:id",
  authorizeRoles(UserRole.COMPANY_ADMIN, UserRole.HR, UserRole.EMPLOYEE),
  getPayslip,
);
payslipRouter.get(
  "/payslip/:id/pdf",
  authorizeRoles(UserRole.COMPANY_ADMIN, UserRole.HR, UserRole.EMPLOYEE),
  getPayslipPdf,
);

export default payslipRouter;
