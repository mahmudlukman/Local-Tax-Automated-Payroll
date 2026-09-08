import { Navigate, Outlet, useLocation } from "react-router-dom";

export interface ProtectedRouteProps {
  isAuthenticated: boolean;
  /** True while a silent auth check (e.g. token refresh) is in flight */
  isLoading?: boolean;
  redirectTo?: string;
}

/**
 * Wrap protected route groups with this in the router config:
 *   <Route element={<ProtectedRoute isAuthenticated={...} />}>
 *     <Route element={<AppShell .../>}>...</Route>
 *   </Route>
 */
export default function ProtectedRoute({
  isAuthenticated,
  isLoading = false,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <span className="text-sm text-gray-500">Loading…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
