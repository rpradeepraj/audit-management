import React from "react";
import { useAudit } from "../../context/AuditContext";
import { ActiveTab, UserRole } from "../../types/audit";
import { isModuleAllowedForRole } from "../../utils/rbac";
import {
  LayoutDashboard,
  FileSpreadsheet,
  CalendarCheck2,
  ClipboardList,
  AlertTriangle,
  LifeBuoy,
  FileText,
  History,
  Building2,
  CheckCircle2,
  ShieldCheck,
  LogOut,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    audits,
    findings,
    capas,
    currentUser,
    logout,
    setIsRoleMatrixModalOpen,
    setActiveAuditId,
    setActiveFindingId,
    setActiveCapaId,
  } = useAudit();

  const isCustUser = currentUser.role === "Customer Representative" || currentUser.role === "Customer Viewer";

  // Filter badges for role
  const inProgressAuditsCount = audits.filter((a) => a.status === "In Progress").length;
  const openFindingsCount = isCustUser
    ? findings.filter((f) => (f.status === "Open" || f.status === "Rejected") && f.customerName.includes("Apex")).length
    : findings.filter((f) => f.status === "Open" || f.status === "Rejected").length;

  const pendingCapasCount = isCustUser
    ? capas.filter((c) => c.status === "Draft" || c.status === "Submitted").length
    : capas.filter((c) => c.status === "Submitted").length;

  const navigateTo = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === "planning") setActiveAuditId(null);
    if (tab === "findings") setActiveFindingId(null);
    if (tab === "capa") setActiveCapaId(null);
  };

  // Define navigation items with explicit access check
  const allNavItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
    section: "overview" | "firm" | "workflow" | "governance";
  }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      section: "overview",
    },
    {
      id: "company-admin",
      label: "Audit Firm",
      icon: <Building2 className="w-4 h-4" />,
      section: "firm",
    },
    {
      id: "templates",
      label: "Audit Templates",
      icon: <FileSpreadsheet className="w-4 h-4" />,
      section: (currentUser.role === "Platform Admin" || currentUser.role === "Admin") ? "firm" : "workflow",
    },
    {
      id: "findings",
      label: "Findings",
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: openFindingsCount,
      badgeColor: "bg-rose-100 text-rose-800",
      section: "workflow",
    },
    {
      id: "capa",
      label: "Corrective Actions",
      icon: <LifeBuoy className="w-4 h-4" />,
      badge: pendingCapasCount,
      badgeColor: "bg-purple-100 text-purple-800",
      section: "workflow",
    },
    {
      id: "reports",
      label: "Audit Reports",
      icon: <FileText className="w-4 h-4" />,
      section: "workflow",
    },
    {
      id: "audit-trail",
      label: "Activity & Logs",
      icon: <History className="w-4 h-4" />,
      section: "governance",
    },
  ];

  // Filter only permitted items for this role
  const visibleItems = allNavItems.filter((item) => isModuleAllowedForRole(currentUser.role, item.id));

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case "Platform Admin":
      case "Admin":
        return "bg-purple-900/60 text-purple-300 border-purple-700/50";
      case "Company Admin":
        return "bg-blue-900/60 text-blue-300 border-blue-700/50";
      case "Audit Manager":
        return "bg-indigo-900/60 text-indigo-300 border-indigo-700/50";
      case "Auditor":
        return "bg-emerald-900/60 text-emerald-300 border-emerald-700/50";
      case "Customer Representative":
        return "bg-amber-900/60 text-amber-300 border-amber-700/50";
      case "Customer Viewer":
        return "bg-slate-800 text-slate-300 border-slate-700";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

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

      {/* Active User Card & RBAC Badge */}
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
            <div className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold inline-block truncate mt-0.5 ${getRoleBadgeStyle(currentUser.role)}`}>
              {currentUser.role}
            </div>
          </div>
        </div>
        {(currentUser.role === "Platform Admin" || currentUser.role === "Admin") && (
          <button
            onClick={() => setIsRoleMatrixModalOpen(true)}
            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            title="Inspect Role Access Matrix"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {(currentUser.role === "Platform Admin" || currentUser.role === "Admin") ? (
          /* Platform Admin Specific Navigation: Dashboard, Audit Firm, Audit Templates */
          <div className="space-y-1">
            {visibleItems.map((item) => {
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
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Workflow Navigation for other roles */
          <div className="space-y-4">
            {/* Overview */}
            {visibleItems.some((i) => i.section === "overview") && (
              <div>
                {visibleItems
                  .filter((i) => i.section === "overview")
                  .map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigateTo(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-900"
                            : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}

            {/* Audit Firm Admin items (if Company Admin) */}
            {visibleItems.some((i) => i.section === "firm") && (
              <div>
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Audit Firm
                </div>
                <div className="space-y-0.5">
                  {visibleItems
                    .filter((i) => i.section === "firm")
                    .map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => navigateTo(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                            isActive
                              ? "bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-900"
                              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-slate-400 group-hover:text-white">{item.icon}</span>
                            <span className="truncate">{item.label}</span>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Workflow modules */}
            {visibleItems.some((i) => i.section === "workflow") && (
              <div>
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {isCustUser ? "Client Portal" : "Audit Workflow"}
                </div>
                <div className="space-y-0.5">
                  {visibleItems
                    .filter((i) => i.section === "workflow")
                    .map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => navigateTo(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group cursor-pointer ${
                            isActive
                              ? "bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-900"
                              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-slate-400 group-hover:text-white">{item.icon}</span>
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
              </div>
            )}

            {/* Governance & Logs */}
            {visibleItems.some((i) => i.section === "governance") && (
              <div>
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Governance
                </div>
                <div className="space-y-0.5">
                  {visibleItems
                    .filter((i) => i.section === "governance")
                    .map((item) => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => navigateTo(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            isActive
                              ? "bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-900"
                              : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {item.icon}
                            <span>{item.label}</span>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer / Context info & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 space-y-2">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span className="truncate max-w-[140px]">{currentUser.companyName}</span>
          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/50">
            Active
          </span>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-800 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700/60 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out / Switch</span>
        </button>
      </div>
    </aside>
  );
};
