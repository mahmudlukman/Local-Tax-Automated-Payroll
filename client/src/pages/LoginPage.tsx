import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginForm, { type LoginFormValues } from "../components/auth/LoginForm";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(values: LoginFormValues) {
    setIsLoading(true);
    setError(null);

    // TODO: replace with the login mutation from redux/api/authApi once it
    // exists, e.g.:
    //   const [login] = useLoginMutation();
    //   try { await login(values).unwrap(); navigate('/dashboard'); }
    //   catch (err) { setError(getErrorMessage(err)); }
    setTimeout(() => {
      setIsLoading(false);
      if (values.email && values.password) {
        navigate("/dashboard");
      } else {
        setError("Invalid credentials");
      }
    }, 400);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-lg font-medium text-gray-900">Payroll</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
        </div>

        <LoginForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
        />

        <p className="mt-6 text-center text-sm text-gray-500">
          Setting up payroll for your company for the first time?{" "}
          <Link
            to="/register"
            className="text-gray-900 underline underline-offset-2"
          >
            Register your company
          </Link>
        </p>
      </div>
    </div>
  );
}
