import express from "express";
import {
  getCompany,
  listCompanies,
  updateCompany,
} from "../controllers/company.controller";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth";
import { UserRole } from "../models/User";

const companyRouter = express.Router();

companyRouter.use(isAuthenticated);

companyRouter.get(
  "/companies",
  authorizeRoles(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN),
  listCompanies,
);
companyRouter.get("/company/:id", getCompany);
companyRouter.put(
  "/company/:id/update",
  authorizeRoles(UserRole.COMPANY_ADMIN, UserRole.SUPER_ADMIN),
  updateCompany,
);

export default companyRouter;
