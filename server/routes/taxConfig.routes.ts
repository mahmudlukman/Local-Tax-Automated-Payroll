import express from "express";
import {
  createTaxConfig,
  listTaxConfigs,
  getActiveTaxConfig,
} from "../controllers/taxConfig.controller";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth";
import { UserRole } from "../models/User";

const taxConfigRouter = express.Router();

taxConfigRouter.use(isAuthenticated);

taxConfigRouter.get("/tax-config/active", getActiveTaxConfig);

taxConfigRouter.post(
  "/create/tax-config",
  authorizeRoles(UserRole.SUPER_ADMIN),
  createTaxConfig,
);

taxConfigRouter.get(
  "/tax-configs",
  authorizeRoles(UserRole.SUPER_ADMIN),
  listTaxConfigs,
);

export default taxConfigRouter;
