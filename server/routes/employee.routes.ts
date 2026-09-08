import express from "express";
import {
  createEmployee,
  listEmployees,
  getEmployee,
  updateEmployee,
  deactivateEmployee,
} from "../controllers/employee.controller";
import {
  isAuthenticated,
  authorizeRoles,
  scopeToOwnCompany,
} from "../middlewares/auth";
import { UserRole } from "../models/User";

const employeeRouter = express.Router();

employeeRouter.use(isAuthenticated);

employeeRouter.post(
  "/create/employee",
  authorizeRoles(UserRole.COMPANY_ADMIN, UserRole.HR),
  createEmployee,
);

employeeRouter.get(
  "/employees",
  authorizeRoles(UserRole.COMPANY_ADMIN, UserRole.HR),
  listEmployees,
);

employeeRouter.get(
  "/employee/:id",
  authorizeRoles(UserRole.COMPANY_ADMIN, UserRole.HR, UserRole.EMPLOYEE),
  getEmployee,
);

employeeRouter.put(
  "/employee/:id/update",
  authorizeRoles(UserRole.COMPANY_ADMIN, UserRole.HR),
  updateEmployee,
);

employeeRouter.delete(
  "/employee/:id/deactivate",
  authorizeRoles(UserRole.COMPANY_ADMIN),
  deactivateEmployee,
);

export default employeeRouter;
