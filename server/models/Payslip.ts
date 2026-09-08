import mongoose, { Schema, Document } from "mongoose";
import { PayrollBreakdown } from "../payrollEngine/payrollEngine";
import { IBankDetails } from "./Employee";

/**
 * A Payslip is a frozen snapshot of the payroll engine's output for one
 * employee in one run. It is never recalculated in place - if a correction
 * is needed, the PayrollRun should be reverted to draft, edited, and
 * re-run, which replaces the payslip rather than silently mutating history.
 */
export interface IPayslip extends Document {
  company: mongoose.Types.ObjectId;
  payrollRun: mongoose.Types.ObjectId;
  employee: mongoose.Types.ObjectId;
  period: { month: number; year: number };

  // Full breakdown object returned by calculateEmployeePayroll(), stored
  // verbatim so the payslip is reproducible even if engine logic or tax
  // config changes later.
  breakdown: PayrollBreakdown;

  netPay: number;

  // Snapshot of bank details at time of payslip generation, since an
  // employee's bank details could change after this payslip was issued
  bankSnapshot: IBankDetails;

  pdfUrl?: string;
  deliveredVia: {
    email: { sent: boolean; sentAt?: Date };
    whatsapp: { sent: boolean; sentAt?: Date };
  };

  createdAt: Date;
  updatedAt: Date;
}

const payslipSchema = new Schema<IPayslip>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    payrollRun: {
      type: Schema.Types.ObjectId,
      ref: "PayrollRun",
      required: true,
      index: true,
    },
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    period: {
      month: { type: Number, required: true },
      year: { type: Number, required: true },
    },

    breakdown: { type: Schema.Types.Mixed, required: true },

    netPay: { type: Number, required: true },

    bankSnapshot: {
      bankName: String,
      bankCode: String,
      accountNumber: String,
      accountName: String,
    },

    pdfUrl: { type: String },
    deliveredVia: {
      email: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
      },
      whatsapp: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
      },
    },
  },
  { timestamps: true },
);

payslipSchema.index({ payrollRun: 1, employee: 1 }, { unique: true });

export default mongoose.model<IPayslip>("Payslip", payslipSchema);
