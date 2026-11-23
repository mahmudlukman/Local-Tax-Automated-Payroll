import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Briefcase, LogOut, Menu, X, ShieldCheck } from "lucide-react";

import { NAVIGATION_MENU } from "../../utils/data";
import ProfileDropdown from "./ProfileDropdown";

import { useSelector } from "react-redux";
import { useLogoutMutation } from "../../redux/features/auth/authApi";
import type { RootState } from "../../redux/store";
import type { ServerError } from "../../@types";
import toast from "react-hot-toast";

interface NavigationItemType {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavigationItemProps {
  item: NavigationItemType;
  isActive: boolean;
  onClick: (id: string) => void;
  isCollapsed: boolean;
}

const NavigationItem = ({
  item,
  isActive,
  onClick,
  isCollapsed,
}: NavigationItemProps) => {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => onClick(item.id)}
      className={`group flex w-full items-center rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
        isActive
          ? "bg-neutral-900 text-white shadow-2xs"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
      }`}
    >
      <Icon
        className={`h-4 w-4 shrink-0 transition-colors ${
          isActive
            ? "text-white"
            : "text-neutral-400 group-hover:text-neutral-700"
        }`}
      />

      {!isCollapsed && <span className="ml-3 truncate">{item.name}</span>}
    </button>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const [logout] = useLogoutMutation();

  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const activeNavItem = location.pathname.split("/")[1] || "dashboard";

  // Responsive Layout Detector
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Profile Dropdown Outside Click Listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const handleNavigation = (itemId: string) => {
    navigate(`/${itemId}`);
    if (isMobile) setSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      navigate("/");
    } catch (err: unknown) {
      const serverError = err as ServerError;
      toast.error(
        serverError?.data?.message ||
          serverError?.message ||
          "Failed to process logout request.",
      );
    }
  };

  const sidebarCollapsed = false;

  const visibleMenuItems = NAVIGATION_MENU.filter((item) =>
    item.visible.some((role) => role === user?.role),
  );

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 text-neutral-900 antialiased">
      {/* Sidebar Navigation Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-neutral-200/80 bg-white transition-transform duration-200 ease-in-out ${
          isMobile
            ? sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        } ${sidebarCollapsed ? "w-16" : "w-60"}`}
      >
        {/* Workspace Brand Header */}
        <div className="flex h-14 items-center border-b border-neutral-200/80 px-4">
          <Link
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
            to="/dashboard"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 text-white shadow-2xs">
              <Briefcase className="h-4 w-4" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-sm font-bold tracking-tight text-neutral-900">
                Tax Engine
              </span>
            )}
          </Link>
        </div>

        {/* Navigation Item Links */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {visibleMenuItems.map((item) => (
            <NavigationItem
              key={item.id}
              item={item}
              isActive={activeNavItem === item.id}
              onClick={handleNavigation}
              isCollapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        {/* Role Badge & Logout Section */}
        <div className="border-t border-neutral-200/80 p-3 space-y-2">
          {user?.role && !sidebarCollapsed && (
            <div className="flex items-center gap-1.5 rounded-md bg-neutral-100 px-2.5 py-1.5 text-[11px] font-medium text-neutral-600">
              <ShieldCheck className="h-3.5 w-3.5 text-neutral-500" />
              <span className="capitalize">{user.role} Tier</span>
            </div>
          )}

          <button
            type="button"
            className="flex w-full items-center rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 shrink-0 stroke-[2]" />
            {!sidebarCollapsed && <span className="ml-3">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content Viewport */}
      <div
        className={`flex flex-1 flex-col overflow-hidden transition-all duration-200 ${
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-60"
        }`}
      >
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-200/80 bg-white/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200/80 bg-white text-neutral-600 hover:bg-neutral-50"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle navigation drawer"
              >
                {sidebarOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </button>
            )}

            <div>
              <h1 className="text-xs font-bold text-neutral-900 tracking-tight sm:text-sm">
                Welcome back, {user?.name ?? "Administrator"}
              </h1>
            </div>
          </div>

          {/* Profile Controls Container */}
          <div className="relative" ref={profileRef}>
            <ProfileDropdown
              isOpen={profileDropdownOpen}
              onToggle={() => setProfileDropdownOpen((prev) => !prev)}
              companyName={user?.name || "Company Account"}
              email={user?.email || ""}
              onLogout={handleLogout}
            />
          </div>
        </header>

        {/* Dynamic Route Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
