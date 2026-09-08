"use client";

import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  sublabel,
  icon,
  iconBgColor = "bg-indigo-50 text-indigo-600",
  onClick,
  className = "",
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs transition-all ${
        onClick ? "hover:border-indigo-300 hover:shadow-md cursor-pointer group" : ""
      } ${className}`}
    >
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-xl ${iconBgColor} transition-colors`}>
          {icon}
        </div>
      </div>
      <div className="mt-2 text-2xl font-black text-slate-900">{value}</div>
      {sublabel && <div className="text-[11px] text-slate-400 mt-0.5">{sublabel}</div>}
    </div>
  );
};
