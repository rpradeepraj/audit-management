"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAudit } from "@/shared/context/AuditContext";
import { ActiveTab } from "@/shared/types/audit";
import {
  LayoutDashboard,
  Building2,
  FileText,
  CheckCircle2,
  LogOut,
} from "lucide-react";

import { APP_ROUTES } from "@/shared/routes";
import { UserAvatar } from "@/shared/components/ui";

interface NavItemConfig {
  id: ActiveTab;
  href: string;
  label: string;
  icon: React.ReactNode;
  aliases?: string[];
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    activeTab,
    setActiveTab,
    currentUser,
    logout,
    setActiveAuditId,
    setActiveFindingId,
    setActiveCapaId,
  } = useAudit();

  // The 3 Clean Core Platform Navigation Items
  const navItems: NavItemConfig[] = [
    {
      id: "dashboard",
      href: APP_ROUTES.DASHBOARD,
      label: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      aliases: [APP_ROUTES.HOME],
    },
    {
      id: "company-admin",
      href: APP_ROUTES.AUDIT_FIRMS,
      label: "Audit Firm",
      icon: <Building2 className="w-4 h-4" />,
      aliases: [APP_ROUTES.COMPANY_ADMIN, "/customers", "/planning"],
    },
    {
      id: "templates",
      href: APP_ROUTES.TEMPLATES,
      label: "Audit Templates",
      icon: <FileText className="w-4 h-4" />,
      aliases: ["/audit-execution", "/perform", "/findings", "/capa", "/reports", "/audit-trail"],
    },
  ];

  // Sync activeTab with current pathname
  useEffect(() => {
    const match = navItems.find(
      (item) => item.href === pathname || (item.aliases && item.aliases.includes(pathname))
    );
    if (match && match.id !== activeTab) {
      setActiveTab(match.id);
    }
  }, [pathname]);

  const handleNavClick = (item: NavItemConfig) => {
    setActiveTab(item.id);
    if (item.id === "company-admin") setActiveAuditId(null);
    if (item.id === "dashboard") {
      setActiveFindingId(null);
      setActiveCapaId(null);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isItemActive = (item: NavItemConfig) => {
    if (pathname === item.href) return true;
    if (item.aliases && item.aliases.includes(pathname)) return true;
    if (pathname === "/" && item.id === "dashboard") return true;
    return activeTab === item.id;
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 transition-all duration-300 ease-in-out select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0 group cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-md shadow-indigo-900/50 shrink-0 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-white text-sm tracking-tight flex items-center gap-1.5 truncate">
              <span>Audit App</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-indigo-500/30 text-indigo-300 rounded font-bold border border-indigo-400/20">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-slate-400 leading-none mt-0.5 truncate">
              Assurance & Compliance
            </div>
          </div>
        </Link>
      </div>

      {/* Active User Card */}
      <div className="px-3.5 py-2.5 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <UserAvatar
            src={currentUser.avatar}
            name={currentUser.name}
            size="sm"
          />
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate leading-tight">
              {currentUser.name}
            </div>
            <div className="text-[9px] px-1.5 py-0.2 rounded border font-semibold inline-block truncate mt-0.5 bg-purple-900/60 text-purple-300 border-purple-700/50">
              {currentUser.role || "Platform Admin"}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          PLATFORM NAVIGATION
        </div>
        {navItems.map((item) => {
          const active = isItemActive(item);
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => handleNavClick(item)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                active
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span className={active ? "text-white" : "text-slate-400"}>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer / Context info & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 space-y-2">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span className="truncate max-w-[140px]">{currentUser.companyName || "Audit Firm"}</span>
          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/50">
            Active
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-800 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700/60 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
