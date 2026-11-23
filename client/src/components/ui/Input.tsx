import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: string;
  icon?: LucideIcon;
  rightAction?: ReactNode;
  error?: string | null;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      name,
      icon: Icon,
      rightAction,
      error,
      helperText,
      className = "",
      disabled,
      ...props
    },
    ref,
  ) => {
    const errorId = `${name}-error`;
    const helperId = `${name}-helper`;

    return (
      <div className="w-full space-y-1.5 text-neutral-900 antialiased">
        {label && (
          <label
            htmlFor={name}
            className="block text-xs font-semibold text-neutral-700"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {Icon && (
            <div className="pointer-events-none absolute left-3 flex items-center justify-center">
              <Icon className="h-4 w-4 text-neutral-400" />
            </div>
          )}

          <input
            ref={ref}
            id={name}
            name={name}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            {...props}
            className={`w-full rounded-xl border bg-white py-2 text-xs text-neutral-900 placeholder:text-neutral-400 shadow-2xs transition-colors focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400 ${
              error
                ? "border-red-300 focus:border-red-600 focus:ring-red-600"
                : "border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900"
            } ${Icon ? "pl-9" : "pl-3.5"} ${
              rightAction ? "pr-10" : "pr-3.5"
            } ${className}`}
          />

          {rightAction && (
            <div className="absolute right-3 flex items-center justify-center">
              {rightAction}
            </div>
          )}
        </div>

        {error ? (
          <p id={errorId} className="text-[11px] font-medium text-red-600">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-[11px] text-neutral-400">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
