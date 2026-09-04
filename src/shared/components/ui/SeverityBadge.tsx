"use client";

import React from "react";
import { FindingSeverity } from "../../../shared/types/audit";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

interface SeverityBadgeProps {
  severity: FindingSeverity | string;
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = "sm",
  showIcon = true,
  className = "",
}) => {
  const getStyle = (sev: string) => {
    switch (sev) {
      case "Critical":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          icon: <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />,
        };
      case "Major":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />,
        };
      case "Minor":
        return {
          bg: "bg-yellow-50 text-yellow-800 border-yellow-200",
          icon: <AlertCircle className="w-3 h-3 text-yellow-600 shrink-0" />,
        };
      case "Observation":
      default:
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          icon: <Info className="w-3 h-3 text-blue-600 shrink-0" />,
        };
    }
  };

  const style = getStyle(severity);
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-md border ${style.bg} ${sizeClasses} ${className}`}
    >
      {showIcon && style.icon}
      <span>{severity}</span>
    </span>
  );
};
