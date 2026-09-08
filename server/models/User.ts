import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config";

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  COMPANY_ADMIN = "company_admin",
  HR = "hr",
  EMPLOYEE = "employee",
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  company?: mongoose.Types.ObjectId;
  employee?: mongoose.Types.ObjectId;
  isActive?: boolean;
  lastLoginAt?: Date;
  passwordChangedAt?: Date;
  resetPasswordToken?: string;
  resetPasswordTime?: Date;
  getJwtToken(): string;
  getRefreshToken(): string;
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false, // never return password by default
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.EMPLOYEE,
    },
    // super_admin has no company (manages tax config across the platform)
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: function () {
        return this.role !== "super_admin";
      },
    },
    // Only set when role === 'employee' and they have self-service access
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
    passwordChangedAt: Date,
    resetPasswordToken: String,
    resetPasswordTime: Date,
  },
  { timestamps: true },
);
// Hash password
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password") || this.$locals.skipHash) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);

  if (!this.isNew) {
    this.passwordChangedAt = new Date();
  }

  next();
});

// JWT token
UserSchema.methods.getJwtToken = function (): string {
  return jwt.sign({ id: this._id }, config.JWT_SECRET_KEY as string, {
    expiresIn: config.JWT_EXPIRES || "15m",
  });
};

// JWT Refresh Token (long-lived)
UserSchema.methods.getRefreshToken = function (): string {
  return jwt.sign({ id: this._id }, config.REFRESH_TOKEN_SECRET as string, {
    expiresIn: config.REFRESH_TOKEN_EXPIRES || "7d",
  });
};

// Compare password
UserSchema.methods.comparePassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
