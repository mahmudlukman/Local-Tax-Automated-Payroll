import mongoose, { Schema, Document } from "mongoose";

export interface IAllowance {
  name: string;
  amount: number;
  taxable: boolean;
}

export interface ISalary {
  basic: number;
  housing: number;
  transport: number;
  otherAllowances: IAllowance[];
}

export interface IBankDetails {
  bankName?: string;
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
}

export type EmploymentStatus = "active" | "suspended" | "terminated";

export interface IEmployee extends Document {
  company: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  employeeId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  dateOfHire: Date;
  jobTitle?: string;
  department?: string;
  employmentStatus: EmploymentStatus;

  // Statutory identifiers
  tin?: string; // Tax Identification Number
  pensionPIN?: string; // RSA PIN
  pensionFundAdministrator?: string;
  stateOfResidence?: string;

  salary: ISalary;

  pensionOptOut: boolean;
  nhfOptOut: boolean;
  annualRentPaid: number;

  bank: IBankDetails;

  createdAt: Date;
  updatedAt: Date;
}

const allowanceSchema = new Schema<IAllowance>(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    taxable: { type: Boolean, default: true },
  },
  { _id: false },
);

const employeeSchema = new Schema<IEmployee>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    employeeId: {
      // company-internal staff ID, e.g. EMP-0001
      type: String,
      required: true,
      trim: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    dateOfBirth: { type: Date },
    dateOfHire: { type: Date, required: true },
    jobTitle: { type: String, trim: true },
    department: { type: String, trim: true },

    employmentStatus: {
      type: String,
      enum: ["active", "suspended", "terminated"],
      default: "active",
    },

    tin: { type: String, trim: true },
    pensionPIN: { type: String, trim: true },
    pensionFundAdministrator: { type: String, trim: true },
    stateOfResidence: { type: String, trim: true },

    salary: {
      basic: { type: Number, required: true, min: 0 },
      housing: { type: Number, default: 0, min: 0 },
      transport: { type: Number, default: 0, min: 0 },
      otherAllowances: { type: [allowanceSchema], default: [] },
    },

    pensionOptOut: { type: Boolean, default: false },
    nhfOptOut: { type: Boolean, default: false },
    annualRentPaid: {
      // used for rent relief calc (20% of rent, capped at NGN 500,000)
      type: Number,
      default: 0,
      min: 0,
    },

    bank: {
      bankName: { type: String, trim: true },
      bankCode: { type: String, trim: true },
      accountNumber: { type: String, trim: true },
      accountName: { type: String, trim: true },
    },
  },
  { timestamps: true },
);

// Prevent duplicate employeeId within the same company
employeeSchema.index({ company: 1, employeeId: 1 }, { unique: true });

export default mongoose.model<IEmployee>("Employee", employeeSchema);
