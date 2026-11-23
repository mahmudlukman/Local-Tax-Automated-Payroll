import React, { useEffect, useState } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import { validateEmail } from "../../utils/helper";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../../redux/features/auth/authApi";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import Input from "../../components/ui/Input";
import {
  Building2,
  User,
  Mail,
  Lock,
  MapPin,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { NIGERIAN_STATES } from "../../utils/data";

export default function SignUp() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState("");
  const [adminName, setAdminName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  useEffect(() => {
    if (user && !isRegistering) {
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    }
  }, [user, navigate, isRegistering]);

  // Handle SignUp Form Submit
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      setError("Please enter your company name.");
      return;
    }

    if (!adminName.trim()) {
      setError("Please enter the admin's full name.");
      return;
    }

    if (!state) {
      setError("Please select your state or location.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid work email address.");
      return;
    }

    if (!password) {
      setError("Please enter a secure password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError(null);
    setIsRegistering(true);

    try {
      await register({
        companyName: companyName.trim(),
        adminEmail: email.trim(),
        adminPassword: password,
        state: state.trim(),
        adminName: adminName.trim(),
      }).unwrap();
      navigate("/login");
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const serverError = err as { data?: { message?: string } };
      if (serverError?.data?.message) {
        setError(serverError.data.message);
      } else {
        setError("Unable to complete registration. Please try again.");
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const isSubmitting = isLoading || isRegistering;

  return (
    <AuthLayout>
      <div className="w-full space-y-5 text-neutral-900 antialiased">
        {/* Header Title & Subtitle */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Register Your Company
          </h2>
          <p className="text-xs text-neutral-500">
            Set up your organization account and administrative details.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSignUp} className="space-y-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Company Name */}
            <div className="sm:col-span-2">
              <Input
                name="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                label="Company Name"
                placeholder="Acme Technologies Ltd"
                type="text"
                icon={Building2}
                required
              />
            </div>

            {/* Admin Name */}
            <Input
              name="adminName"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              label="Admin Full Name"
              placeholder="John Doe"
              type="text"
              icon={User}
              required
            />

            {/* State Select Dropdown */}
            <div className="space-y-1">
              <label
                htmlFor="state-select"
                className="block text-xs font-semibold text-neutral-700"
              >
                State / Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MapPin className="h-4 w-4 text-neutral-400 stroke-[1.75]" />
                </div>
                <select
                  id="state-select"
                  name="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  className="w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50/50 py-2.5 pl-9 pr-8 text-xs text-neutral-900 shadow-2xs transition-all placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 disabled:opacity-60"
                >
                  <option value="" disabled>
                    Select State
                  </option>
                  {NIGERIAN_STATES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5">
                  <ChevronDown className="h-4 w-4 text-neutral-400" />
                </div>
              </div>
            </div>

            {/* Work Email */}
            <div className="sm:col-span-2">
              <Input
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                label="Admin Work Email"
                placeholder="john@company.com"
                type="email"
                autoComplete="email"
                icon={Mail}
                required
              />
            </div>

            {/* Password Field */}
            <div className="sm:col-span-2">
              <Input
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label="Password"
                placeholder="Min 6 characters"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                icon={Lock}
                required
                rightAction={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-neutral-400 hover:text-neutral-700 focus:outline-none"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
              />
            </div>
          </div>

          {/* Validation / Server Error Alert */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/70 p-3 text-xs text-red-900 shadow-2xs">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <div className="space-y-0.5 leading-snug">
                <span className="font-semibold">Registration Failed</span>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 transition-all active:scale-[0.99]"
          >
            {isSubmitting && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-300" />
            )}
            <span>
              {isSubmitting ? "Creating Company Account…" : "Register Company"}
            </span>
          </button>

          {/* Footer Link */}
          <div className="border-t border-neutral-100 pt-3 text-center">
            <p className="text-xs text-neutral-500">
              Already have an account?{" "}
              <Link
                to="/"
                className="font-semibold text-neutral-900 underline underline-offset-4 hover:text-neutral-700 transition-colors"
              >
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
