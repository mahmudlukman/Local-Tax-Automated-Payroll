import { NextFunction, Request, Response } from "express";
import { catchAsyncError } from "./catchAsyncErrors";
import jwt, { JwtPayload } from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler";
import User, { UserRole } from "../models/User";
import config from "../config";

// Authenticated user
export const isAuthenticated = catchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token as string;

    if (!access_token) {
      return next(
        new ErrorHandler("Please login to access this resource", 401),
      );
    }

    try {
      // Verify access token
      const decoded = jwt.verify(
        access_token,
        config.JWT_SECRET_KEY as string,
      ) as JwtPayload;

      if (!decoded || !decoded.id) {
        return next(new ErrorHandler("Access token is not valid", 401));
      }

      // Get user from database
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      // Check if account is active
      if (!user.isActive) {
        return next(
          new ErrorHandler(
            "This account has been suspended! Try to contact the admin",
            403,
          ),
        );
      }

      // Check whether password was changed after token was issued
      if (user.passwordChangedAt && decoded.iat) {
        const passwordChangedAtSeconds = Math.floor(
          user.passwordChangedAt.getTime() / 1000,
        );

        if (decoded.iat < passwordChangedAtSeconds) {
          return next(
            new ErrorHandler(
              "Password was recently changed. Please login again.",
              401,
            ),
          );
        }
      }

      // Attach authenticated user to request
      req.user = user;

      next();
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return next(
          new ErrorHandler(
            "Access token expired. Please refresh your token",
            401,
          ),
        );
      }

      if (error.name === "JsonWebTokenError") {
        return next(new ErrorHandler("Invalid access token", 401));
      }

      if (error.name === "NotBeforeError") {
        return next(new ErrorHandler("Access token not active yet", 401));
      }

      return next(new ErrorHandler("Authentication failed", 401));
    }
  },
);

// Validate user role
export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ErrorHandler("User not authenticated", 401));
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return next(
        new ErrorHandler(
          `Role (${req.user.role}) is not allowed to access this resource`,
          403,
        ),
      );
    }

    next();
  };
};

// Restrict users to their own company
export const scopeToOwnCompany = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  // Super admin can access any company
  if (req.user.role === UserRole.SUPER_ADMIN) {
    return next();
  }

  // Normal company users must belong to a company
  if (!req.user.company) {
    return next(new ErrorHandler("User is not associated with a company", 403));
  }

  const requestedCompanyId =
    req.params.companyId || req.body?.company || req.query.company;

  // If a company was explicitly requested,
  // it must match the authenticated user's company.
  if (
    requestedCompanyId &&
    requestedCompanyId.toString() !== req.user.company.toString()
  ) {
    return next(
      new ErrorHandler("Not authorized to access another company's data", 403),
    );
  }

  next();
};
