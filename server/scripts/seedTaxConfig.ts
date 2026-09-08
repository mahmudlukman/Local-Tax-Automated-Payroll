/**
 * Seeds the current (Jan 2026-effective) tax configuration so payroll runs
 * have something to calculate against out of the box.
 *
 * Run with: npm run seed:tax-config
 */

import mongoose from "mongoose";
import TaxConfig from "../models/TaxConfig";

async function seed(): Promise<void> {
  await mongoose.connect(process.env.MONGO_URI as string);

  const existing = await TaxConfig.findOne({
    label: "Nigeria Tax Act 2025 (effective Jan 2026)",
  });

  if (existing) {
    console.log("Tax config already seeded:", existing._id);
    await mongoose.disconnect();
    return;
  }

  const config = await TaxConfig.create({
    label: "Nigeria Tax Act 2025 (effective Jan 2026)",
    effectiveFrom: new Date("2026-01-01"),
    effectiveTo: null,
    isActive: true,
    payeBands: [
      { upTo: 800000, rate: 0 },
      { upTo: 3000000, rate: 0.15 },
      { upTo: 12000000, rate: 0.18 },
      { upTo: 25000000, rate: 0.21 },
      { upTo: 50000000, rate: 0.23 },
      { upTo: null, rate: 0.25 },
    ],
    rentReliefRate: 0.2,
    rentReliefCap: 500000,
    pensionEmployeeRate: 0.08,
    pensionEmployerRate: 0.1,
    nhfRate: 0.025,
    itfRate: 0.01,
    nsitfRate: 0.01,
  });

  console.log("Seeded tax config:", config._id);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
