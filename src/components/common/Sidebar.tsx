import React from "react";
import { useAudit } from "../../context/AuditContext";
import { ActiveTab } from "../../types/audit";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Building2,
  CheckCircle2,
  LogOut,
  AlertTriangle,
  LifeBuoy,
  FileText,
  History,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    findings,
    capas,
    currentUser,
    logout,
    setActiveAuditId,
    setActiveFindingId,
    setActiveCapaId,
  } = useAudit();

  const openFindingsCount = findings.filter((f) => f.status === "Open" || f.status === "Rejected").length;
  const pendingCapasCount = capas.filter((c) => c.status === "Submitted").length;

  const navigateTo = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === "planning" || tab === "company-admin") setActiveAuditId(null);
    if (tab === "findings") setActiveFindingId(null);
    if (tab === "capa") setActiveCapaId(null);
  };

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "company-admin",
      label: "Audit Firm",
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: "templates",
      label: "Audit Templates",
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
    {
      id: "findings",
      label: "Findings",
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: openFindingsCount,
      badgeColor: "bg-rose-100 text-rose-800",
    },
    {
      id: "capa",
      label: "Corrective Actions",
      icon: <LifeBuoy className="w-4 h-4" />,
      badge: pendingCapasCount,
      badgeColor: "bg-purple-100 text-purple-800",
    },
    {
      id: "reports",
      label: "Audit Reports",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: "audit-trail",
      label: "Activity & Logs",
      icon: <History className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-md shadow-indigo-900/50">
            <CheckCircle2 className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="font-extrabold text-white text-sm tracking-tight flex items-center gap-1.5">
              <span>Audit App</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-indigo-500/30 text-indigo-300 rounded font-bold border border-indigo-400/20">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-slate-400 leading-none mt-0.5">
              Assurance & Compliance
            </div>
          </div>
        </div>
      </div>

      {/* Active User Card */}
      <div className="px-3.5 py-2.5 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700"
          />
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate leading-tight">
              {currentUser.name}
            </div>
            <div className="text-[9px] px-1.5 py-0.2 rounded border font-semibold inline-block truncate mt-0.5 bg-purple-900/60 text-purple-300 border-purple-700/50">
              Platform Admin
            </div>
          </div>
        </div>
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
          Platform Navigation
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-900"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={isActive ? "text-white" : "text-slate-400"}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                    isActive
                      ? "bg-indigo-700 text-white ring-1 ring-white/20"
                      : item.badgeColor || "bg-slate-800 text-slate-300"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
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
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-800 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700/60 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
