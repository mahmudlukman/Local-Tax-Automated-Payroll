import { catchAsyncError } from "../middlewares/catchAsyncErrors";
import { NextFunction, Request, Response } from "express";
import { User, UserRole } from "../models/User";
import Company from "../models/Company";
import ErrorHandler from "../utils/errorHandler";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwtToken";
import jwt, { Secret } from "jsonwebtoken";
import config from "../config";

/**
 * @desc    Register a new company + its first admin user (self-signup flow)
 * @route   POST /api/auth/register-company
 * @access  Public
 */

export const registerCompany = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { companyName, state, adminName, adminEmail, adminPassword } =
      req.body;

    if (!companyName || !adminName || !adminEmail || !adminPassword) {
      return next(
        new ErrorHandler(
          "companyName, adminName, adminEmail and adminPassword are all required",
          400,
        ),
      );
    }

    const existingUser = await User.findOne({
      email: adminEmail.toLowerCase(),
    });
    if (existingUser) {
      return next(
        new ErrorHandler("An account with this email already exists", 409),
      );
    }

    const company = await Company.create({ name: companyName, state });

    const adminUser = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: UserRole.COMPANY_ADMIN,
      company: company._id,
    });

    res.status(201).json({
      success: true,
      message: "Company and admin user created successfully",
      company: { id: company._id, name: company.name },
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
      },
      token: sendToken(adminUser, 200, res),
    });
  },
);

/**
 * @desc    Create an additional user (HR staff or employee self-service login)
 *          within the caller's own company.
 * @route   POST /api/auth/users
 * @access  Private (company_admin only)
 */
export const createCompanyUser = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, role, employeeId } = req.body;

    if (!["hr", "employee"].includes(role)) {
      return next(new ErrorHandler("role must be 'hr' or 'employee'", 400));
    }

    const existingUser = await User.findOne({ email: email?.toLowerCase() });
    if (existingUser) {
      return next(
        new ErrorHandler("An account with this email already exists", 409),
      );
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      company: req.user.company,
      employee: employeeId || undefined,
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  },
);

/**
 * @desc    Login
 * @route   POST /api/auth/login
 * @access  Public
 */
interface ILoginRequest {
  email: string;
  password: string;
}

export const login = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body as ILoginRequest;

    if (!email || !password) {
      return next(new ErrorHandler("Please enter email and password", 400));
    }

    const emailLowerCase = email.toLowerCase().trim();

    const user = await User.findOne({ email: emailLowerCase }).select(
      "+password",
    );

    if (!user) {
      return next(new ErrorHandler("Invalid credentials", 400));
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return next(new ErrorHandler("Invalid credentials", 400));
    }

    const { isActive } = user;
    if (!isActive) {
      return next(
        new ErrorHandler(
          "This account has been suspended! Try to contact the admin",
          403,
        ),
      );
    }

    sendToken(user, 200, res);
  },
);

/**
 * @desc    Logout user (clear cookies)
 * @route   POST /api/auth/logout
 * @access  Public
 */
export const logout = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    res.cookie("access_token", "", {
      maxAge: 1,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.cookie("refresh_token", "", {
      maxAge: 1,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  },
);

/**
 * @desc    Refresh access token using refresh token
 * @route   POST /api/auth/refresh-token
 * @access  Public
 */
export const refreshAccessToken = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const refresh_token = req.cookies.refresh_token as string;

    if (!refresh_token) {
      return next(
        new ErrorHandler("Please login to access this resource", 401),
      );
    }

    let decoded: { id: string; iat: number };
    try {
      decoded = jwt.verify(
        refresh_token,
        config.REFRESH_TOKEN_SECRET as Secret,
      ) as { id: string; iat: number };
    } catch (error: any) {
      return next(
        new ErrorHandler("Session expired. Please login again.", 401),
      );
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    if (!user.isActive) {
      return next(
        new ErrorHandler(
          "This account has been suspended! Try to contact the admin",
          403,
        ),
      );
    }

    if (user.passwordChangedAt) {
      const passwordChangedAtSeconds = Math.floor(
        user.passwordChangedAt.getTime() / 1000,
      );
      if (decoded.iat < passwordChangedAtSeconds) {
        return next(
          new ErrorHandler("Session expired. Please login again.", 401),
        );
      }
    }

    const newAccessToken = user.getJwtToken();
    const newRefreshToken = user.getRefreshToken();

    res.cookie("access_token", newAccessToken, accessTokenOptions);
    res.cookie("refresh_token", newRefreshToken, refreshTokenOptions);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  },
);

/**
 * @desc    Get the logged-in user's profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user?._id);
    if (!user) {
      return next(new ErrorHandler("User doesn't exists", 400));
    }

    res.status(200).json({
      success: true,
      user,
    });
  },
);
