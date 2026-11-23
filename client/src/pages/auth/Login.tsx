import React, { useEffect, useState } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/helper";
import { useLoginMutation } from "../../redux/features/auth/authApi";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import Input from "../../components/ui/Input";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

export default function Login() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Handle Login Form Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (!validateEmail(email)) {
      setError("Please enter a valid work email address.");
      return;
    }
    if (!password) {
      setError("Please enter your account password.");
      return;
    }

    setError(null);

    try {
      await login({ email: email.trim(), password }).unwrap();
    } catch (err: unknown) {
      const serverError = err as { data?: { message?: string } };
      if (serverError?.data?.message) {
        setError(serverError.data.message);
      } else {
        setError(
          "Unable to authenticate. Please check your credentials and try again.",
        );
      }
    }
  };

  return (
    <AuthLayout>
      <div className="w-full space-y-6 text-neutral-900 antialiased">
        {/* Header Title & Description */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Welcome Back
          </h2>
          <p className="text-xs text-neutral-500">
            Sign in to manage statutory tax compliance and payroll.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Work Email"
            placeholder="name@company.com"
            type="email"
            autoComplete="email"
            icon={Mail}
            required
          />

          <div className="space-y-1">
            <Input
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
              placeholder="••••••••••••"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              icon={Lock}
              required
              rightAction={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-neutral-400 hover:text-neutral-700 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />

            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
                onClick={() => {
                  /* Reset logic can be connected here */
                }}
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {/* Error Callout */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/70 p-3 text-xs text-red-900 shadow-2xs">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <div className="space-y-0.5 leading-snug">
                <span className="font-semibold">Authentication Error</span>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 transition-all active:scale-[0.99]"
          >
            {isLoading && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-300" />
            )}
            <span>{isLoading ? "Signing in…" : "Sign In to Dashboard"}</span>
          </button>

          {/* Sign Up Footer Navigation */}
          <div className="border-t border-neutral-100 pt-4 text-center">
            <p className="text-xs text-neutral-500">
              Setting up payroll for the first time?{" "}
              <Link
                to="/signup"
                className="font-semibold text-neutral-900 underline underline-offset-4 hover:text-neutral-700 transition-colors"
              >
                Register your company
              </Link>
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
