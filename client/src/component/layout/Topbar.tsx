import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';

export interface TopbarProps {
  title: string;
  userName?: string;
  userRoleLabel?: string;
  onLogout?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Topbar({
  title,
  userName = 'User',
  userRoleLabel = 'Company admin',
  onLogout,
}: TopbarProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-base font-medium text-gray-900">{title}</h1>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-100"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-700">
            {getInitials(userName)}
          </span>
          <span className="text-left leading-tight">
            <span className="block text-sm text-gray-900">{userName}</span>
            <span className="block text-xs text-gray-500">{userRoleLabel}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" strokeWidth={1.75} />
        </button>

        {open && (
          <div className="absolute right-0 z-10 mt-1 w-44 rounded-md border border-gray-200 bg-white py-1">
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}