"use client";

import React from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface ToastNotificationProps {
  successMessage?: string | null;
  errorMessage?: string | null;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  successMessage,
  errorMessage,
  onClose,
}) => {
  if (!successMessage && !errorMessage) return null;

  const isSuccess = Boolean(successMessage);
  const message = successMessage || errorMessage;

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-200 pointer-events-auto">
      <div
        className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3.5 backdrop-blur-md transition-all ${
          isSuccess
            ? "bg-emerald-50/95 border-emerald-300 text-emerald-950 shadow-emerald-900/10"
            : "bg-rose-50/95 border-rose-300 text-rose-950 shadow-rose-900/10"
        }`}
      >
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
            isSuccess
              ? "bg-emerald-600 text-white shadow-emerald-200"
              : "bg-rose-600 text-white shadow-rose-200"
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <h4
            className={`text-xs font-black uppercase tracking-wider ${
              isSuccess ? "text-emerald-800" : "text-rose-800"
            }`}
          >
            {isSuccess ? "Operation Succeeded" : "Action Failed"}
          </h4>
          <p className="text-xs font-semibold leading-relaxed mt-0.5 break-words">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className={`p-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
            isSuccess
              ? "text-emerald-600 hover:text-emerald-900 hover:bg-emerald-100"
              : "text-rose-600 hover:text-rose-900 hover:bg-rose-100"
          }`}
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;
