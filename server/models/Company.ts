import mongoose, { Schema, Document } from "mongoose";

export interface ICompany extends Document {
  name: string;
  rcNumber?: string;
  industry?: string;
  address?: string;
  state?: string;
  contactEmail?: string;
  contactPhone?: string;
  itfApplicable: boolean;
  nsitfApplicable: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    rcNumber: { type: String, trim: true }, // CAC registration number
    industry: { type: String, trim: true },
    address: { type: String, trim: true },
    state: {
      // Determines which state IRS (e.g. LIRS) PAYE remittance applies to
      type: String,
      trim: true,
    },
    contactEmail: { type: String, trim: true, lowercase: true },
    contactPhone: { type: String, trim: true },
    itfApplicable: {
      // ITF applies to employers with 5+ staff or NGN 50m+ turnover
      type: Boolean,
      default: false,
    },
    nsitfApplicable: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model<ICompany>("Company", companySchema);
