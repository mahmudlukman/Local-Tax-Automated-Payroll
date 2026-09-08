import mongoose, { Schema, Document } from "mongoose";

export type PayrollRunStatus = "draft" | "approved" | "paid";

export interface IPayrollTotals {
  employeeCount: number;
  totalGross: number;
  totalPAYE: number;
  totalEmployeePension: number;
  totalEmployerPension: number;
  totalNHF: number;
  totalNetPay: number;
  itf: number;
  nsitf: number;
}

export interface IPayrollRun extends Document {
  company: mongoose.Types.ObjectId;
  period: { month: number; year: number };
  taxConfig: mongoose.Types.ObjectId;
  status: PayrollRunStatus;
  runBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  paidAt?: Date;
  totals: IPayrollTotals;
  createdAt: Date;
  updatedAt: Date;
}

const payrollRunSchema = new Schema<IPayrollRun>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    // e.g. month: 9, year: 2026 -> September 2026
    period: {
      month: { type: Number, required: true, min: 1, max: 12 },
      year: { type: Number, required: true },
    },
    taxConfig: {
      type: Schema.Types.ObjectId,
      ref: "TaxConfig",
      required: true,
    },
    status: {
      // draft: calculated, editable/re-runnable
      // approved: locked, ready for bank export
      // paid: bank transfer confirmed, payslips sendable
      type: String,
      enum: ["draft", "approved", "paid"],
      default: "draft",
    },
    runBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    paidAt: { type: Date },

    totals: {
      employeeCount: { type: Number, default: 0 },
      totalGross: { type: Number, default: 0 },
      totalPAYE: { type: Number, default: 0 },
      totalEmployeePension: { type: Number, default: 0 },
      totalEmployerPension: { type: Number, default: 0 },
      totalNHF: { type: Number, default: 0 },
      totalNetPay: { type: Number, default: 0 },
      itf: { type: Number, default: 0 },
      nsitf: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

// Only one payroll run per company per calendar period
payrollRunSchema.index(
  { company: 1, "period.year": 1, "period.month": 1 },
  { unique: true },
);

export default mongoose.model<IPayrollRun>("PayrollRun", payrollRunSchema);
