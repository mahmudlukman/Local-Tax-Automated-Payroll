import { useState, type FormEvent } from "react";
import { AlertCircle } from "lucide-react";

export interface RegisterCompanyFormValues {
  companyName: string;
  state: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface RegisterCompanyFormProps {
  onSubmit: (values: RegisterCompanyFormValues) => void;
  isLoading?: boolean;
  error?: string | null;
}

const INPUT_CLASS =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500";

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const emptyValues: RegisterCompanyFormValues = {
  companyName: "",
  state: "",
  adminName: "",
  adminEmail: "",
  adminPassword: "",
};

export default function RegisterCompanyForm({
  onSubmit,
  isLoading = false,
  error,
}: RegisterCompanyFormProps) {
  const [values, setValues] = useState<RegisterCompanyFormValues>(emptyValues);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  function update<K extends keyof RegisterCompanyFormValues>(
    key: K,
    value: RegisterCompanyFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (values.adminPassword !== confirmPassword) {
      setValidationError("Passwords don't match");
      return;
    }
    setValidationError(null);
    onSubmit(values);
  }

  const displayError = validationError || error;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      <div>
        <label
          htmlFor="companyName"
          className="mb-1.5 block text-sm text-gray-700"
        >
          Company name
        </label>
        <input
          id="companyName"
          required
          value={values.companyName}
          onChange={(e) => update("companyName", e.target.value)}
          placeholder="Acme Nigeria Ltd"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label htmlFor="state" className="mb-1.5 block text-sm text-gray-700">
          State
        </label>
        <select
          id="state"
          required
          value={values.state}
          onChange={(e) => update("state", e.target.value)}
          className={INPUT_CLASS}
        >
          <option value="" disabled>
            Select a state
          </option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="adminName"
          className="mb-1.5 block text-sm text-gray-700"
        >
          Your name
        </label>
        <input
          id="adminName"
          required
          value={values.adminName}
          onChange={(e) => update("adminName", e.target.value)}
          placeholder="Ada Obi"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label
          htmlFor="adminEmail"
          className="mb-1.5 block text-sm text-gray-700"
        >
          Work email
        </label>
        <input
          id="adminEmail"
          type="email"
          autoComplete="email"
          required
          value={values.adminEmail}
          onChange={(e) => update("adminEmail", e.target.value)}
          placeholder="ada@acme.ng"
          className={INPUT_CLASS}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="adminPassword"
            className="mb-1.5 block text-sm text-gray-700"
          >
            Password
          </label>
          <input
            id="adminPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={values.adminPassword}
            onChange={(e) => update("adminPassword", e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm text-gray-700"
          >
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      {displayError && (
        <div className="flex items-start gap-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800">
          <AlertCircle
            className="mt-0.5 h-4 w-4 flex-shrink-0"
            strokeWidth={1.75}
          />
          <span>{displayError}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
