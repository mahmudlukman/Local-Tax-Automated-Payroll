import { Plus, Trash2 } from "lucide-react";
import type { Allowance, SalaryStructure } from "../../@types";

export interface SalaryStructureFieldsProps {
  value: SalaryStructure;
  onChange: (value: SalaryStructure) => void;
}

const INPUT_CLASS =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500";

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-gray-700">{label}</label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={INPUT_CLASS}
      />
    </div>
  );
}

export default function SalaryStructureFields({
  value,
  onChange,
}: SalaryStructureFieldsProps) {
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
        ...value.otherAllowances,
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
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <NumberField
          label="Basic salary (monthly)"
          value={value.basic}
          onChange={(n) => onChange({ ...value, basic: n })}
        />
        <NumberField
          label="Housing allowance"
          value={value.housing}
          onChange={(n) => onChange({ ...value, housing: n })}
        />
        <NumberField
          label="Transport allowance"
          value={value.transport}
          onChange={(n) => onChange({ ...value, transport: n })}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-gray-700">Other allowances</span>
          <button
            type="button"
            onClick={addAllowance}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            Add allowance
          </button>
        </div>

        {value.otherAllowances.length === 0 ? (
          <p className="text-sm text-gray-400">No additional allowances.</p>
        ) : (
          <div className="space-y-2">
            {value.otherAllowances.map((allowance, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Allowance name"
                  value={allowance.name}
                  onChange={(e) =>
                    updateAllowance(index, { name: e.target.value })
                  }
                  className={`${INPUT_CLASS} flex-1`}
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Amount"
                  value={allowance.amount}
                  onChange={(e) =>
                    updateAllowance(index, { amount: Number(e.target.value) })
                  }
                  className={`${INPUT_CLASS} w-32`}
                />
                <label className="flex items-center gap-1.5 whitespace-nowrap text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={allowance.taxable}
                    onChange={(e) =>
                      updateAllowance(index, { taxable: e.target.checked })
                    }
                    className="rounded border-gray-300"
                  />
                  Taxable
                </label>
                <button
                  type="button"
                  onClick={() => removeAllowance(index)}
                  className="text-gray-400 hover:text-gray-700"
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
