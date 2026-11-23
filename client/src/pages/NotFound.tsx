import { Link } from "react-router-dom";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 text-center text-neutral-900 antialiased">
      {/* Background Accent Glow */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <div className="h-96 w-96 rounded-full bg-neutral-200/50 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md space-y-6">
        {/* Icon & Error Code Visual */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-neutral-200/80 bg-white shadow-2xs">
          <FileQuestion className="h-8 w-8 text-neutral-400 stroke-[1.5]" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-400">
            Error 404
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Page Not Found
          </h1>
          <p className="text-xs text-neutral-500 sm:text-sm leading-relaxed">
            The resource or URL you are looking for doesn’t exist or has been
            relocated within the system.
          </p>
        </div>

        {/* Home Navigation Button */}
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="h-3.5 w-3.5 stroke-[2.5]" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
