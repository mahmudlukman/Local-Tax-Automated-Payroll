import express from "express";
import {
  registerCompany,
  createCompanyUser,
  login,
  getMe,
  logout,
} from "../controllers/auth.controller";
import { isAuthenticated, authorizeRoles } from "../middlewares/auth";
import { UserRole } from "../models/User";

const authRouter = express.Router();

authRouter.post("/register-company", registerCompany);
authRouter.post("/login", login);
authRouter.get("/logout", isAuthenticated, logout);
authRouter.get("/me", isAuthenticated, getMe);
authRouter.post(
  "/create/company/user",
  isAuthenticated,
  authorizeRoles(UserRole.COMPANY_ADMIN),
  createCompanyUser,
);

export default authRouter;
