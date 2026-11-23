import type { ReactNode } from "react";
import { Briefcase, ShieldCheck } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-neutral-50 px-4 py-12 text-neutral-900 antialiased sm:px-6">
      {/* Background Ambient Glow & Grid Accent */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-neutral-200/50 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      {/* Main Authentication Card */}
      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-md">
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-base font-bold tracking-tight text-neutral-900">
              Tax Engine
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 border border-neutral-200/80 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              Secure Portal
            </span>
          </div>
        </div>

        {/* Auth Form Container Box */}
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-6 sm:p-8 shadow-sm">
          {children}
        </div>

        {/* Minimal Footer */}
        <p className="text-center text-[11px] text-neutral-400">
          Protected by end-to-end statutory encryption &bull; &copy;{" "}
          {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
