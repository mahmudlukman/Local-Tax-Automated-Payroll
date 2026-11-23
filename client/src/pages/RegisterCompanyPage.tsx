import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RegisterCompanyForm, {
  type RegisterCompanyFormValues,
} from "../components/auth/RegisterCompanyForm";

export default function RegisterCompanyPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(values: RegisterCompanyFormValues) {
    setIsLoading(true);
    setError(null);

    // TODO: replace with the registerCompany mutation from
    // redux/api/authApi once it exists. Your backend logs the new admin
    // straight in (sendToken on success), so a successful call here should
    // go directly to /dashboard, not back to /login.
    setTimeout(() => {
      setIsLoading(false);
      if (values.companyName && values.adminEmail) {
        navigate("/dashboard");
      } else {
        setError("Something went wrong. Please check the form and try again.");
      }
    }, 400);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-lg font-medium text-gray-900">
            Register your company
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            You'll be set up as the company admin
          </p>
        </div>

        <RegisterCompanyForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
        />

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-gray-900 underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
