import React from "react";
import { useAudit } from "../../context/AuditContext";
import {
  ShieldCheck,
  CalendarCheck2,
  AlertTriangle,
  LifeBuoy,
  FileText,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Layers,
  Building2,
  Users,
  FileSpreadsheet,
  Award,
  Plus,
} from "lucide-react";
import { ActiveTab } from "../../types/audit";
import { isModuleAllowedForRole, canCreateAuditPlan } from "../../utils/rbac";

export const DashboardView: React.FC = () => {
  const {
    audits,
    findings,
    capas,
    customers,
    templates,
    users,
    firmRoles,
    companyProfile,
    firms,
    selectedFirm,
    currentUser,
    setActiveTab,
    setActiveAuditId,
    setActiveFindingId,
    setActiveCapaId,
    setIsRoleMatrixModalOpen,
  } = useAudit();

  const isAdmin = currentUser.role === "Platform Admin" || currentUser.role === "Admin";
  const isCustomer = currentUser.role === "Customer Representative" || currentUser.role === "Customer Viewer";
  const isAuditor = currentUser.role === "Auditor";

  // Role-filtered metrics
  const scopedAudits = isCustomer
    ? audits.filter((a) => a.customerName.includes("Apex") || a.customerId === "cust_apex")
    : isAuditor
    ? audits.filter((a) => a.leadAuditorId === currentUser.id || a.auditorTeam?.some((t) => t.id === currentUser.id))
    : audits;

  const scopedFindings = isCustomer
    ? findings.filter((f) => f.customerName.includes("Apex"))
    : isAuditor
    ? findings.filter((f) => scopedAudits.some((a) => a.id === f.auditId))
    : findings;

  const scopedCapas = isCustomer
    ? capas.filter((c) => c.customerName.includes("Apex"))
    : isAuditor
    ? capas.filter((c) => scopedFindings.some((f) => f.id === c.findingId))
    : capas;

  const totalAudits = scopedAudits.length;
  const inProgressAudits = scopedAudits.filter((a) => a.status === "In Progress");
  const scheduledAudits = scopedAudits.filter((a) => a.status === "Scheduled");
  const underReviewAudits = scopedAudits.filter((a) => a.status === "Under Review");
  const completedAudits = scopedAudits.filter((a) => a.status === "Completed" || a.status === "Closed");

  const openFindings = scopedFindings.filter((f) => f.status === "Open" || f.status === "Rejected");
  const criticalFindings = scopedFindings.filter((f) => f.severity === "Critical" && f.status !== "Closed");
  const majorFindings = scopedFindings.filter((f) => f.severity === "Major" && f.status !== "Closed");
  const minorFindings = scopedFindings.filter((f) => f.severity === "Minor" && f.status !== "Closed");
  const observationFindings = scopedFindings.filter((f) => f.severity === "Observation" && f.status !== "Closed");

  const pendingCapas = scopedCapas.filter((c) => c.status === "Submitted");
  const resolvedCapas = scopedCapas.filter((c) => c.status === "Accepted");

  // Calculate average compliance score across completed/in-progress audits
  const auditsWithScores = scopedAudits.filter((a) => a.overallScore !== undefined && a.overallScore > 0);
  const avgCompliance =
    auditsWithScores.length > 0
      ? Math.round(
          auditsWithScores.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) /
            auditsWithScores.length
        )
      : 88;

  const navigateTo = (tab: ActiveTab, entityId?: string) => {
    if (!isModuleAllowedForRole(currentUser.role, tab)) {
      return;
    }
    setActiveTab(tab);
    if (entityId) {
      if (tab === "perform" || tab === "planning" || tab === "reports") {
        setActiveAuditId(entityId);
      } else if (tab === "findings") {
        setActiveFindingId(entityId);
      } else if (tab === "capa") {
        setActiveCapaId(entityId);
      }
    }
  };

  /* ------------------------------------------------------------- */
  /* ADMIN-LEVEL DASHBOARD VIEW                                    */
  /* ------------------------------------------------------------- */
  if (isAdmin) {
    const totalStaff = users.length;
    const auditorStaff = users.filter((u) => u.role === "Auditor").length;
    const managerStaff = users.filter((u) => u.role === "Audit Manager").length;

    return (
      <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Admin Header Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl border border-indigo-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Audit App • Root Administrative Governance</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Admin Governance Cockpit
            </h1>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
              Welcome, <span className="font-bold text-white">{currentUser.name}</span>. Overseeing{" "}
              <span className="font-semibold text-indigo-300">{companyProfile.name}</span> credentials, workforce roster, firm roles, and master template standards.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab("templates")}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-300" />
              <span>Audit Templates</span>
            </button>
          </div>
        </div>

        {/* Admin Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Accredited Audit Firms */}
          <div
            onClick={() => setActiveTab("company-admin")}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Accredited Firms
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl font-black text-slate-900">
                {firms.length} Accredited Firms
              </div>
              <div className="text-xs font-semibold text-indigo-600 truncate mt-0.5">
                Active: {selectedFirm.name} ({selectedFirm.code})
              </div>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
              <span>{selectedFirm.accreditationNumber || "ISO 17021-1"}</span>
              <span className="text-indigo-600 font-bold">Manage Firms →</span>
            </div>
          </div>

          {/* Card 2: Workforce Roster */}
          <div
            onClick={() => setActiveTab("company-admin")}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Staff & Auditors
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{totalStaff}</span>
              <span className="text-xs font-semibold text-slate-600">
                ({auditorStaff} Certified Auditors)
              </span>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
              <span>Scoped by Active Firm</span>
              <span className="text-indigo-600 font-bold">Roster →</span>
            </div>
          </div>

          {/* Card 3: Firm Maintained Templates */}
          <div
            onClick={() => setActiveTab("company-admin")}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Firm Templates
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {(selectedFirm.maintainedTemplateIds || []).length}
              </span>
              <span className="text-xs font-semibold text-purple-600 truncate max-w-[130px]">
                Standards for {selectedFirm.code}
              </span>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
              <span>Maintained by Firm</span>
              <span className="text-indigo-600 font-bold">Configure →</span>
            </div>
          </div>

          {/* Card 4: Audit Templates */}
          <div
            onClick={() => setActiveTab("templates")}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Audit Templates
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{templates.length}</span>
              <span className="text-xs font-semibold text-emerald-600">
                Master Standards
              </span>
            </div>
            <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
              <span>ISO 9001, 27001, GMP, SOC2</span>
              <span className="text-indigo-600 font-bold">Library →</span>
            </div>
          </div>
        </div>

        {/* Admin Navigation Hub Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Audit Firm Management */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Audit Firm Operations & Workforce
                  </h3>
                  <div className="text-xs text-slate-500">
                    Firm profile, staff provisioning, and role governance
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("company-admin")}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                Open →
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Configure your certification body credentials, maintain ANAB accreditation numbers, provision staff auditors, and customize firm roles with granular privilege matrices.
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <div className="text-xs text-slate-400">Total Staff</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">{users.length}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <div className="text-xs text-slate-400">Firm Roles</div>
                <div className="text-lg font-black text-indigo-600 mt-0.5">{firmRoles.length}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl text-center">
                <div className="text-xs text-slate-400">Clients</div>
                <div className="text-lg font-black text-emerald-600 mt-0.5">{customers.length}</div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("company-admin")}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Manage Audit Firm & Roles</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Audit Templates */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Audit Templates Library
                  </h3>
                  <div className="text-xs text-slate-500">
                    Master checklist clauses & scoring frameworks
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("templates")}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                Open →
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Standardized compliance checklists encompassing ISO 9001:2015, ISO/IEC 27001:2022, GMP, SOC 2 Type II, ISO 14001, and customized industry standards.
            </p>

            <div className="space-y-1.5 pt-2">
              {templates.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveTab("templates")}
                  className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs cursor-pointer"
                >
                  <span className="font-bold text-slate-800 truncate">{t.name}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded">
                    {t.sections.reduce((acc, s) => acc + s.questions.length, 0)} Items
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveTab("templates")}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore All Templates ({templates.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------- */
  /* WORKFLOW DASHBOARD FOR OTHER LOGINS                           */
  /* ------------------------------------------------------------- */
  const rawPipeline = [
    {
      step: 1,
      title: "Templates",
      tab: "templates" as ActiveTab,
      count: `${templates.length} Checklists`,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    },
    {
      step: 2,
      title: "Planning",
      tab: "planning" as ActiveTab,
      count: `${scheduledAudits.length} Scheduled`,
      color: "text-sky-600 bg-sky-50 border-sky-200",
    },
    {
      step: 3,
      title: "Perform Audit",
      tab: "perform" as ActiveTab,
      count: `${inProgressAudits.length} Active`,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      step: 4,
      title: "Findings",
      tab: "findings" as ActiveTab,
      count: `${openFindings.length} Open`,
      color: "text-rose-600 bg-rose-50 border-rose-200",
    },
    {
      step: 5,
      title: "Corrective Actions",
      tab: "capa" as ActiveTab,
      count: `${pendingCapas.length} Review`,
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      step: 6,
      title: "Audit Reports",
      tab: "reports" as ActiveTab,
      count: `${completedAudits.length + underReviewAudits.length} Ready`,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
  ];

  const allowedPipeline = rawPipeline.filter((p) => isModuleAllowedForRole(currentUser.role, p.tab));

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Audit Management & Compliance Cockpit</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
            Operating as <span className="font-bold text-white px-1.5 py-0.5 bg-indigo-500/20 rounded border border-indigo-400/30">{currentUser.role}</span> at{" "}
            <span className="font-semibold text-indigo-200">{currentUser.companyName}</span>.
            {isCustomer
              ? " Viewing company compliance, non-conformities, and corrective action plans."
              : isAuditor
              ? " Managing assigned checklists, evidence gathering, and audit findings."
              : " Overseeing full audit lifecycle pipeline from planning to final certification."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {canCreateAuditPlan(currentUser.role) ? (
            <button
              onClick={() => setActiveTab("planning")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Plan New Audit</span>
            </button>
          ) : isCustomer ? (
            <button
              onClick={() => setActiveTab("capa")}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LifeBuoy className="w-4 h-4" />
              <span>Action Items ({openFindings.length})</span>
            </button>
          ) : isAuditor ? (
            <button
              onClick={() => setActiveTab("perform")}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Audit Execution</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Audit Workflow Visualizer (Only allowed steps shown) */}
      {allowedPipeline.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Audit Workflow
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Active Workflow Modules ({allowedPipeline.length})
            </span>
          </div>

          <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-${Math.min(allowedPipeline.length, 6)} gap-2.5`}>
            {allowedPipeline.map((pipeline, idx) => (
              <button
                key={pipeline.step}
                onClick={() => navigateTo(pipeline.tab)}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-sm cursor-pointer text-left flex flex-col justify-between group transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center font-mono bg-slate-200 group-hover:bg-indigo-600 group-hover:text-white text-slate-700">
                    {idx + 1}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${pipeline.color}`}>
                    {pipeline.count}
                  </span>
                </div>
                <div className="mt-2.5 font-bold text-xs text-slate-800 group-hover:text-indigo-600">
                  {pipeline.title}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Audits */}
        {isModuleAllowedForRole(currentUser.role, "planning") && (
          <div
            onClick={() => setActiveTab("planning")}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Audits
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CalendarCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{totalAudits}</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>{inProgressAudits.length} Active</span>
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Scheduled: {scheduledAudits.length}</span>
              <span>Completed: {completedAudits.length}</span>
            </div>
          </div>
        )}

        {/* Card 2: Average Compliance */}
        {isModuleAllowedForRole(currentUser.role, "reports") && (
          <div
            onClick={() => setActiveTab("reports")}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Avg Compliance
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{avgCompliance}%</span>
              <span className="text-xs font-semibold text-emerald-600">
                Target: ≥80%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: `${avgCompliance}%` }}
              />
            </div>
          </div>
        )}

        {/* Card 3: Open Non-Conformities */}
        {isModuleAllowedForRole(currentUser.role, "findings") && (
          <div
            onClick={() => setActiveTab("findings")}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-rose-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Open Findings
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{openFindings.length}</span>
              <span className="text-xs font-semibold text-rose-600">
                {criticalFindings.length + majorFindings.length} High Priority
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
              <span className="text-rose-600 font-semibold">Major: {majorFindings.length}</span>
              <span>•</span>
              <span className="text-amber-600 font-semibold">Minor: {minorFindings.length}</span>
            </div>
          </div>
        )}

        {/* Card 4: CAPA Pending Review */}
        {isModuleAllowedForRole(currentUser.role, "capa") && (
          <div
            onClick={() => setActiveTab("capa")}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pending CAPAs
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <LifeBuoy className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{pendingCapas.length}</span>
              <span className="text-xs font-semibold text-purple-600">
                {resolvedCapas.length} Resolved
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Remediation Plans</span>
              <span className="font-semibold text-indigo-600">Review →</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Active Audits & Urgent Action Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active & Upcoming Audits */}
        {isModuleAllowedForRole(currentUser.role, "planning") && (
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck2 className="w-4 h-4 text-indigo-600" />
                <h2 className="font-bold text-slate-900 text-sm">
                  Active & Upcoming Audits
                </h2>
              </div>
              <button
                onClick={() => setActiveTab("planning")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                View All Audits ({scopedAudits.length}) →
              </button>
            </div>

            <div className="space-y-3">
              {scopedAudits.slice(0, 4).map((audit) => {
                const statusColors: Record<string, string> = {
                  "In Progress": "bg-amber-100 text-amber-800 border-amber-200",
                  "Scheduled": "bg-blue-100 text-blue-800 border-blue-200",
                  "Under Review": "bg-purple-100 text-purple-800 border-purple-200",
                  "Completed": "bg-emerald-100 text-emerald-800 border-emerald-200",
                  "Draft": "bg-slate-100 text-slate-700 border-slate-200",
                  "Closed": "bg-slate-100 text-slate-700 border-slate-200",
                };

                return (
                  <div
                    key={audit.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {audit.auditNumber}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${statusColors[audit.status]}`}>
                          {audit.status}
                        </span>
                        <span className="text-xs font-semibold text-slate-600 truncate">
                          • {audit.standard}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-xs truncate">
                        {audit.title}
                      </h4>

                      <div className="flex items-center gap-4 text-[11px] text-slate-500">
                        <span>Customer: <strong className="text-slate-700">{audit.customerName}</strong></span>
                        <span>Lead: <strong className="text-slate-700">{audit.leadAuditorName}</strong></span>
                        <span>Dates: {audit.startDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {audit.status === "In Progress" && isModuleAllowedForRole(currentUser.role, "perform") ? (
                        <button
                          onClick={() => navigateTo("perform", audit.id)}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Conduct Audit</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (audit.status === "Under Review" || audit.status === "Completed") && isModuleAllowedForRole(currentUser.role, "reports") ? (
                        <button
                          onClick={() => navigateTo("reports", audit.id)}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-indigo-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Report</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => navigateTo("planning", audit.id)}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          View Plan
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Right Col: Urgent Action Required & Findings Severity Matrix */}
        <div className="space-y-6">
          {/* Action Queue */}
          {isModuleAllowedForRole(currentUser.role, "findings") && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Action Required Queue
                  </h3>
                </div>
                <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                  {openFindings.length + pendingCapas.length} Items
                </span>
              </div>

              <div className="space-y-2">
                {openFindings.slice(0, 3).map((f) => (
                  <div
                    key={f.id}
                    onClick={() => navigateTo("findings", f.id)}
                    className="p-3 rounded-xl border border-rose-100 bg-rose-50/40 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-rose-700">
                        {f.findingNumber}
                      </span>
                      <span className="text-[10px] bg-rose-200 text-rose-900 font-bold px-1.5 py-0.2 rounded">
                        {f.severity} NC
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-xs mt-1 truncate">
                      {f.title}
                    </h5>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>{f.customerName}</span>
                      <span className="text-rose-600 font-semibold">Due: {f.dueDate}</span>
                    </div>
                  </div>
                ))}

                {pendingCapas.slice(0, 2).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => navigateTo("capa", c.id)}
                    className="p-3 rounded-xl border border-purple-100 bg-purple-50/40 hover:bg-purple-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-purple-700">
                        CAPA for {c.findingNumber}
                      </span>
                      <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-1.5 py-0.2 rounded">
                        Review Needed
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-xs mt-1 truncate">
                      {c.findingTitle}
                    </h5>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>Submitted by {c.submittedBy}</span>
                      <span className="text-indigo-600 font-semibold">Verify →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Finding Severity Breakdown */}
          {isModuleAllowedForRole(currentUser.role, "findings") && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
                Findings Severity Distribution
              </h3>

              <div className="space-y-2.5">
                {[
                  { label: "Critical Non-Conformity", count: criticalFindings.length, color: "bg-rose-600" },
                  { label: "Major Non-Conformity", count: majorFindings.length, color: "bg-amber-500" },
                  { label: "Minor Non-Conformity", count: minorFindings.length, color: "bg-yellow-400" },
                  { label: "Observation / OFI", count: observationFindings.length, color: "bg-blue-400" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-medium text-[11px]">{item.label}</span>
                      <span className="font-bold">{item.count}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`${item.color} h-1.5 rounded-full`}
                        style={{
                          width: `${findings.length > 0 ? (item.count / findings.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
