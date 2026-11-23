import { Toaster } from "react-hot-toast";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { useTokenRefresh } from "./utils/userRefreshToken";
import PrivateRoute from "./components/auth/PrivateRoute";

import DashboardPage from "./pages/DashboardPage";
import EmployeeListPage from "./pages/EmployeeListPage";
import EmployeeDetailsPage from "./pages/EmployeeDetailsPage";
import EmployeeFormPage from "./pages/EmployeeFormPage";
import PayrollRunListPage from "./pages/PayrollRunListPage";
import PayrollRunDetailsPage from "./pages/PayrollRunDetailsPage";
import CompanyProfilePage from "./pages/CompanyProfilePage";
import TaxConfigListPage from "./pages/TaxConfigListPage";
import MyPayslipsPage from "./pages/MyPayslipsPage";
import PayslipDetailPage from "./pages/PayslipDetailPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SingUp";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

const ALL_AUTHENTICATED = [
  "super_admin",
  "company_admin",
  "hr",
  "employee",
] as const;

const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/signup", element: <SignUp /> },

  // Authenticated users (all roles)
  {
    element: <PrivateRoute allowedRoles={[...ALL_AUTHENTICATED]} />,
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "payslips", element: <MyPayslipsPage /> },
      { path: "payslips/:id", element: <PayslipDetailPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },

  // HR + admins
  {
    element: (
      <PrivateRoute allowedRoles={["super_admin", "company_admin", "hr"]} />
    ),
    children: [
      { path: "employees", element: <EmployeeListPage /> },
      { path: "employee/new", element: <EmployeeFormPage /> },
      { path: "employee/:id", element: <EmployeeDetailsPage /> },
      { path: "employee/:id/edit", element: <EmployeeFormPage /> },
      { path: "payroll", element: <PayrollRunListPage /> },
      { path: "payroll/:id", element: <PayrollRunDetailsPage /> },
    ],
  },

  // Company admin only
  {
    element: <PrivateRoute allowedRoles={["company_admin"]} />,
    children: [{ path: "company", element: <CompanyProfilePage /> }],
  },

  // Super admin only
  {
    element: <PrivateRoute allowedRoles={["super_admin"]} />,
    children: [{ path: "tax-config", element: <TaxConfigListPage /> }],
  },

  // Fallback: unknown paths → if logged in go to dashboard, else login
  { path: "/dashboard", element: <Navigate to="/dashboard" replace /> },
  { path: "*", element: <NotFound /> },
]);

const App = () => {
  useTokenRefresh();

  return (
    <>
      <RouterProvider router={router} />
      <Toaster toastOptions={{ style: { fontSize: "13px" } }} />
    </>
  );
};

export default App;
