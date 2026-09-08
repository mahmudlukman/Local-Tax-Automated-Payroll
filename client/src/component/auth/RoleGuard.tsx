import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import type { UserRole } from "../layout/Sidebar";

export interface RoleGuardProps {
  role: UserRole;
  allow: UserRole[];
  redirectTo?: string;
  /** If omitted, renders <Outlet /> - use for route-level guarding */
  children?: ReactNode;
}

/**
 * Route-level:
 *   <Route element={<RoleGuard role={role} allow={['super_admin']} />}>
 *     <Route path="/tax-config" element={<TaxConfigListPage />} />
 *   </Route>
 *
 * Inline, inside a page:
 *   <RoleGuard role={role} allow={['company_admin']}>
 *     <DeleteEmployeeButton />
 *   </RoleGuard>
 */
export default function RoleGuard({
  role,
  allow,
  redirectTo = "/dashboard",
  children,
}: RoleGuardProps) {
  if (!allow.includes(role)) {
    return children ? null : <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
