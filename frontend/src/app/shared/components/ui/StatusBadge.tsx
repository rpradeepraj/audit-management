"use client";

import React from "react";
import { AuditStatus } from "../../../shared/types/audit";

interface StatusBadgeProps {
  status: AuditStatus | string;
  size?: "sm" | "md";
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "sm",
  className = "",
}) => {
  const getStyle = (st: string) => {
    switch (st) {
      case "Scheduled":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "In Progress":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Under Review":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Completed":
      case "Closed":
      case "Accepted":
      case "Active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Open":
      case "Rejected":
      case "Critical":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Major":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Minor":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Observation":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Submitted":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Draft":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border ${getStyle(
        status
      )} ${sizeClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70 shrink-0" />
      {status}
    </span>
  );
};
