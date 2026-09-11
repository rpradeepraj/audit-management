"use client";

import React, { useState } from "react";
import { useAudit } from "../../../shared/context/AuditContext";
import {
  Search,
  ChevronDown,
  RotateCcw,
  LogOut,
} from "lucide-react";
import { UserAvatar } from "../ui";

export const Header: React.FC = () => {
  const {
    currentUser,
    logout,
    searchQuery,
    setSearchQuery,
    resetAllData,
  } = useAudit();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Search and Brand identity */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search audits, findings, templates, customers, or standards (e.g. ISO 9001)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 pl-2 pr-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all text-left cursor-pointer"
          >
            <UserAvatar
              src={currentUser.avatar}
              name={currentUser.name}
              size="sm"
            />
            <div className="hidden lg:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {currentUser.name}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] px-1.5 py-0.2 font-medium rounded border bg-purple-100 text-purple-800 border-purple-200">
                  {currentUser.role || "Platform Admin"}
                </span>
                <span className="text-[10px] text-slate-500 truncate max-w-[110px]">
                  • {currentUser.companyName || "Audit Firm"}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Profile Menu */}
          {roleMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setRoleMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-3 px-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <UserAvatar
                    src={currentUser.avatar}
                    name={currentUser.name}
                    size="md"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {currentUser.email}
                    </div>
                    <div className="mt-1">
                      <span className="text-[10px] px-2 py-0.5 font-medium rounded border bg-purple-100 text-purple-800 border-purple-200">
                        {currentUser.role || "Platform Admin"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Organization:</span>
                    <span className="font-semibold text-slate-800">{currentUser.companyName}</span>
                  </div>
                  {currentUser.department && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Department:</span>
                      <span className="font-medium text-slate-700">{currentUser.department}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setRoleMenuOpen(false);
                      logout();
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>

                  <button
                    onClick={() => {
                      resetAllData();
                      setRoleMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                    title="Reset sample data"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
