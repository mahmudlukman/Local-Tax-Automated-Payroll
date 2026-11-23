import { useMemo } from "react";
import { Plus, Trash2, Coins, Receipt } from "lucide-react";
import type { Allowance, SalaryStructure } from "../../@types";
import { formatCurrency } from "../../utils/formatCurrency";

export interface SalaryStructureFieldsProps {
  value: SalaryStructure;
  onChange: (value: SalaryStructure) => void;
}

const INPUT_CLASS =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 shadow-2xs transition-colors";

function NumberField({
  label,
  value,
  onChange,
  placeholder = "0.00",
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-neutral-700">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          min={0}
          step="any"
          placeholder={placeholder}
          value={value === 0 ? "" : value}
          onChange={(e) => {
            const val = e.target.value === "" ? 0 : Number(e.target.value);
            onChange(isNaN(val) ? 0 : val);
          }}
          className={INPUT_CLASS}
        />
      </div>
    </div>
  );
}

export default function SalaryStructureFields({
  value,
  onChange,
}: SalaryStructureFieldsProps) {
  // Real-time calculation of total monthly gross salary
  const totalGross = useMemo(() => {
    const basic = value.basic || 0;
    const housing = value.housing || 0;
    const transport = value.transport || 0;
    const other = (value.otherAllowances || []).reduce(
      (sum, item) => sum + (item.amount || 0),
      0,
    );
    return basic + housing + transport + other;
  }, [value]);

  function updateAllowance(index: number, patch: Partial<Allowance>) {
    const next = value.otherAllowances.map((a, i) =>
      i === index ? { ...a, ...patch } : a,
    );
    onChange({ ...value, otherAllowances: next });
  }

  function addAllowance() {
    onChange({
      ...value,
      otherAllowances: [
        ...(value.otherAllowances || []),
        { name: "", amount: 0, taxable: true },
      ],
    });
  }

  function removeAllowance(index: number) {
    onChange({
      ...value,
      otherAllowances: value.otherAllowances.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="space-y-6 text-neutral-900 antialiased">
      {/* Live Estimated Monthly Gross Calculation Header */}
      <div className="flex items-center justify-between rounded-xl border border-neutral-200/80 bg-neutral-50 p-4 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-neutral-200 text-neutral-700 shadow-2xs">
            <Coins className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Total Monthly Gross
            </span>
            <p className="text-xs text-neutral-500">
              Sum of basic pay and active allowance line items
            </p>
          </div>
        </div>
        <div className="font-mono text-base font-bold text-neutral-900">
          {formatCurrency(totalGross)}
        </div>
      </div>

      {/* Core Salary Breakdown Inputs */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900">
          <Receipt className="h-3.5 w-3.5 text-neutral-500" />
          Primary Allowance Distribution
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <NumberField
            label="Basic Salary"
            value={value.basic}
            onChange={(n) => onChange({ ...value, basic: n })}
          />
          <NumberField
            label="Housing Allowance"
            value={value.housing}
            onChange={(n) => onChange({ ...value, housing: n })}
          />
          <NumberField
            label="Transport Allowance"
            value={value.transport}
            onChange={(n) => onChange({ ...value, transport: n })}
          />
        </div>
      </div>

      {/* Dynamic Additional Allowances Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-200/80 pb-2">
          <span className="text-xs font-semibold text-neutral-900">
            Custom / Supplementary Allowances
          </span>
          <button
            type="button"
            onClick={addAllowance}
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 hover:text-neutral-900 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Add Allowance Item
          </button>
        </div>

        {value.otherAllowances.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-6 text-center">
            <p className="text-xs text-neutral-500">
              No additional allowance items attached.
            </p>
            <button
              type="button"
              onClick={addAllowance}
              className="mt-2 text-xs font-medium text-neutral-900 underline underline-offset-2"
            >
              Add a custom benefit allowance
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {value.otherAllowances.map((allowance, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg border border-neutral-200/80 bg-white p-2.5 shadow-2xs"
              >
                <input
                  type="text"
                  placeholder="Allowance label (e.g. Utility, Medical)"
                  value={allowance.name}
                  onChange={(e) =>
                    updateAllowance(index, { name: e.target.value })
                  }
                  className={`${INPUT_CLASS} flex-1`}
                />

                <div className="w-36">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    placeholder="Amount"
                    value={allowance.amount === 0 ? "" : allowance.amount}
                    onChange={(e) => {
                      const val =
                        e.target.value === "" ? 0 : Number(e.target.value);
                      updateAllowance(index, {
                        amount: isNaN(val) ? 0 : val,
                      });
                    }}
                    className={INPUT_CLASS}
                  />
                </div>

                <label
                  className={`flex cursor-pointer select-none items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    allowance.taxable
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={allowance.taxable}
                    onChange={(e) =>
                      updateAllowance(index, { taxable: e.target.checked })
                    }
                    className="sr-only"
                  />
                  <span>{allowance.taxable ? "Taxable" : "Exempt"}</span>
                </label>

                <button
                  type="button"
                  onClick={() => removeAllowance(index)}
                  className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
                  aria-label="Remove allowance"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
