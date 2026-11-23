import { ChevronDown, LayoutDashboard, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";

interface ProfileDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  companyLogo?: string;
  companyName: string;
  email: string;
  onLogout: () => void;
}

export default function ProfileDropdown({
  isOpen,
  onToggle,
  companyLogo,
  companyName,
  email,
  onLogout,
}: ProfileDropdownProps) {
  const initial = companyName ? companyName.charAt(0).toUpperCase() : "C";

  return (
    <div className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-neutral-100/80 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-1"
      >
        {companyLogo ? (
          <img
            src={companyLogo}
            alt={`${companyName} Logo`}
            className="h-8 w-8 rounded-lg object-cover border border-neutral-200/80"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-xs font-bold text-white shadow-2xs">
            {initial}
          </div>
        )}

        <div className="hidden text-left sm:block">
          <p className="text-xs font-semibold text-neutral-900 leading-tight truncate max-w-[140px]">
            {companyName || "Organization"}
          </p>
          <p className="text-[11px] text-neutral-400 leading-tight truncate max-w-[140px]">
            {email}
          </p>
        </div>

        <ChevronDown
          className={`h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-neutral-700" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-neutral-200/80 bg-white p-1.5 shadow-lg ring-1 ring-black/5 z-50 animate-in fade-in-50 zoom-in-95 duration-100">
          {/* User Info Header */}
          <div className="border-b border-neutral-100 px-3 py-2.5 mb-1">
            <p className="text-xs font-bold text-neutral-900 truncate">
              {companyName || "Organization"}
            </p>
            <p className="text-[11px] text-neutral-400 truncate">{email}</p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-0.5">
            <Link
              to="/dashboard"
              onClick={onToggle}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-neutral-400 stroke-[1.75]" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/profile"
              onClick={onToggle}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            >
              <User className="h-4 w-4 text-neutral-400 stroke-[1.75]" />
              <span>View Profile</span>
            </Link>
          </div>

          {/* Sign Out Action */}
          <div className="border-t border-neutral-100 mt-1 pt-1">
            <button
              type="button"
              onClick={() => {
                onToggle();
                onLogout();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4 text-red-500 stroke-[1.75]" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
