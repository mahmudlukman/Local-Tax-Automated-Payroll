import type { ReactNode } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Tailwind max-width class, e.g. 'max-w-sm' (default), 'max-w-lg' */
  maxWidth?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-sm",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4">
      <div
        className={`w-full ${maxWidth} rounded-lg border border-gray-200 bg-white p-5`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        {children}

        {footer && (
          <div className="mt-5 flex justify-end gap-2 border-t border-gray-200 pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
