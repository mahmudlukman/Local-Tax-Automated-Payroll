import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Wallet,
  FileText,
  Building2,
  Landmark,
  LogOut,
  type LucideIcon,
} from 'lucide-react';

export type UserRole = 'super_admin' | 'company_admin' | 'hr' | 'employee';

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super admin',
  company_admin: 'Company admin',
  hr: 'HR',
  employee: 'Employee',
};

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Omit to show for every role */
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Employees', to: '/employees', icon: Users, roles: ['company_admin', 'hr'] },
  { label: 'Payroll runs', to: '/payroll', icon: Wallet, roles: ['company_admin', 'hr'] },
  { label: 'Payslips', to: '/payslips', icon: FileText },
  { label: 'Company', to: '/company', icon: Building2, roles: ['company_admin'] },
  { label: 'Tax config', to: '/tax-config', icon: Landmark, roles: ['super_admin'] },
];

export interface SidebarProps {
  companyName?: string;
  role?: UserRole;
  onLogout?: () => void;
}

export default function Sidebar({
  companyName = 'Your company',
  role = 'company_admin',
  onLogout,
}: SidebarProps) {
  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <aside className="flex w-56 flex-shrink-0 flex-col border-r border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100 px-3 py-5">
      <div className="mb-5 truncate px-2.5 text-sm font-medium text-gray-900">{companyName}</div>

      <nav className="flex flex-1 flex-col gap-0.5">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-200/70 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={1.75} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 border-t border-gray-200 pt-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-200/70 hover:text-gray-900"
        >
          <LogOut className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={1.75} />
          Log out
        </button>
      </div>
    </aside>
  );
}