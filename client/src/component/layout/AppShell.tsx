import { Outlet } from 'react-router-dom';
import Sidebar, { ROLE_LABELS, type UserRole } from './Sidebar';
import Topbar from './Topbar';

export interface AppShellProps {
  /** Current page title, shown in the topbar */
  title: string;
  companyName?: string;
  role?: UserRole;
  userName?: string;
  onLogout?: () => void;
}

/**
 * The authenticated app frame: sidebar + topbar around routed page content
 * (rendered via <Outlet />). `title` is passed in per-route for now -
 * once routing is wired up, this can instead read from route metadata.
 */
export default function AppShell({
  title,
  companyName,
  role = 'company_admin',
  userName,
  onLogout,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar companyName={companyName} role={role} onLogout={onLogout} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={title}
          userName={userName}
          userRoleLabel={ROLE_LABELS[role]}
          onLogout={onLogout}
        />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}