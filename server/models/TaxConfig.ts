import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayeBand {
  // Annual chargeable income up to this amount is taxed at `rate`.
  // The final band should have upTo: null to mean "and above".
  upTo: number | null;
  rate: number;
}

export interface ITaxConfig extends Document {
  label: string;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  isActive: boolean;

  payeBands: IPayeBand[];
  rentReliefRate: number;
  rentReliefCap: number;

  pensionEmployeeRate: number;
  pensionEmployerRate: number;

  nhfRate: number;

  itfRate: number;
  nsitfRate: number;
}

interface ITaxConfigModel extends Model<ITaxConfig> {
  getActiveConfig(onDate?: Date): Promise<ITaxConfig | null>;
}

const payeBandSchema = new Schema<IPayeBand>(
  {
    upTo: { type: Number, default: null },
    rate: { type: Number, required: true, min: 0, max: 1 },
  },
  { _id: false },
);

/**
 * A single versioned snapshot of Nigeria's statutory payroll rates.
 * Never mutate an existing config once payroll has been run against it -
 * create a new version instead, so historical payslips remain reproducible
 * and auditable against the rules that applied at the time.
 */
const taxConfigSchema = new Schema<ITaxConfig>(
  {
    label: {
      // e.g. "Nigeria Tax Act 2025 (effective Jan 2026)"
      type: String,
      required: true,
      trim: true,
    },
    effectiveFrom: { type: Date, required: true },
    effectiveTo: { type: Date, default: null }, // null = still current
    isActive: { type: Boolean, default: true },

    payeBands: {
      type: [payeBandSchema],
      required: true,
      validate: {
        validator: (bands: IPayeBand[]) => bands.length > 0,
        message: "At least one PAYE band is required",
      },
    },
    rentReliefRate: { type: Number, default: 0.2 }, // 20% of annual rent
    rentReliefCap: { type: Number, default: 500000 }, // NGN 500,000/yr

    pensionEmployeeRate: { type: Number, default: 0.08 },
    pensionEmployerRate: { type: Number, default: 0.1 },
    // Pension is calculated on basic + housing + transport, not gross

    nhfRate: { type: Number, default: 0.025 }, // 2.5% of basic

    itfRate: { type: Number, default: 0.01 }, // 1% of annual payroll
    nsitfRate: { type: Number, default: 0.01 }, // 1% of annual payroll
  },
  { timestamps: true },
);

/**
 * Returns the tax config that applies on a given date (defaults to now).
 */
taxConfigSchema.statics.getActiveConfig = async function (
  onDate: Date = new Date(),
): Promise<ITaxConfig | null> {
  return this.findOne({
    isActive: true,
    effectiveFrom: { $lte: onDate },
    $or: [{ effectiveTo: null }, { effectiveTo: { $gte: onDate } }],
  }).sort({ effectiveFrom: -1 });
};

export default mongoose.model<ITaxConfig, ITaxConfigModel>(
  "TaxConfig",
  taxConfigSchema,
);
