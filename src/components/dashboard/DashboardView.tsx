import React from "react";
import { useAudit } from "../../context/AuditContext";
import {
  ShieldCheck,
  Building2,
  Users,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  CalendarCheck2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Award,
  Layers,
} from "lucide-react";
import { ActiveTab } from "../../types/audit";

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
  } = useAudit();

  const totalAudits = audits.length;
  const inProgressAudits = audits.filter((a) => a.status === "In Progress");
  const openFindings = findings.filter((f) => f.status === "Open" || f.status === "Rejected");
  const criticalFindings = findings.filter((f) => f.severity === "Critical" && f.status !== "Closed");

  // Calculate average compliance score across completed/in-progress audits
  const auditsWithScores = audits.filter((a) => a.overallScore !== undefined && a.overallScore > 0);
  const avgCompliance =
    auditsWithScores.length > 0
      ? Math.round(
          auditsWithScores.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) /
            auditsWithScores.length
        )
      : 88;

  const navigateTo = (tab: ActiveTab, entityId?: string) => {
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

  const totalStaff = users.length;
  const auditorStaff = users.filter((u) => u.role === "Auditor").length;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl border border-indigo-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Audit App • Platform Administrative Governance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Platform Admin Governance Cockpit
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
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Templates Library ({templates.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("company-admin")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            <span>Manage Audit Firms</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <div
          onClick={() => setActiveTab("company-admin")}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Firms</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{firms.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Auditing Firms</div>
        </div>

        <div
          onClick={() => setActiveTab("customers")}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-sky-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Auditees</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{customers.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Customer Orgs</div>
        </div>

        <div
          onClick={() => setActiveTab("templates")}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-violet-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Templates</span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{templates.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">ISO & Domain Stds</div>
        </div>

        <div
          onClick={() => setActiveTab("company-admin")}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Audits</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{audits.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{inProgressAudits.length} Active in flight</div>
        </div>

        <div
          onClick={() => setActiveTab("reports")}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Compliance</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">{avgCompliance}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Pass index avg</div>
        </div>

        <div
          onClick={() => setActiveTab("findings")}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Open NCs</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-rose-600">{openFindings.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{criticalFindings.length} Critical risk</div>
        </div>
      </div>

      {/* Quick Administration & Governance Actions */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-md border border-slate-800">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Quick Administration & Lifecycle Actions
            </h2>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
            Platform Master Console
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => setActiveTab("company-admin")}
            className="p-3 bg-slate-950/70 hover:bg-slate-800 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-all text-left flex flex-col justify-between gap-2 group cursor-pointer"
          >
            <Building2 className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-bold text-slate-200 group-hover:text-white">Register New Firm</div>
              <div className="text-[10px] text-slate-400">Onboard audit agency</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("templates")}
            className="p-3 bg-slate-950/70 hover:bg-slate-800 rounded-xl border border-slate-800 hover:border-violet-500/50 transition-all text-left flex flex-col justify-between gap-2 group cursor-pointer"
          >
            <FileSpreadsheet className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-bold text-slate-200 group-hover:text-white">New Standard / Template</div>
              <div className="text-[10px] text-slate-400">Create checklist & rubric</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("company-admin")}
            className="p-3 bg-slate-950/70 hover:bg-slate-800 rounded-xl border border-slate-800 hover:border-sky-500/50 transition-all text-left flex flex-col justify-between gap-2 group cursor-pointer"
          >
            <CalendarCheck2 className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-bold text-slate-200 group-hover:text-white">Plan Audit</div>
              <div className="text-[10px] text-slate-400">Schedule & assign scope</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("perform")}
            className="p-3 bg-slate-950/70 hover:bg-slate-800 rounded-xl border border-slate-800 hover:border-emerald-500/50 transition-all text-left flex flex-col justify-between gap-2 group cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-bold text-slate-200 group-hover:text-white">Execute Audit</div>
              <div className="text-[10px] text-slate-400">Verification & evidence</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("findings")}
            className="p-3 bg-slate-950/70 hover:bg-slate-800 rounded-xl border border-slate-800 hover:border-rose-500/50 transition-all text-left flex flex-col justify-between gap-2 group cursor-pointer"
          >
            <AlertTriangle className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-bold text-slate-200 group-hover:text-white">Review Findings</div>
              <div className="text-[10px] text-slate-400">Manage non-conformances</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className="p-3 bg-slate-950/70 hover:bg-slate-800 rounded-xl border border-slate-800 hover:border-amber-500/50 transition-all text-left flex flex-col justify-between gap-2 group cursor-pointer"
          >
            <FileText className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-xs font-bold text-slate-200 group-hover:text-white">Generate Reports</div>
              <div className="text-[10px] text-slate-400">Certificates & approvals</div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Multi-Column Split: Active Engagements vs Master Standards & Firms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Audit Engagements */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Active Audit Engagements Across Portfolio</h3>
              <p className="text-xs text-slate-500">Live surveillance across customer entities & standards</p>
            </div>
            <button
              onClick={() => setActiveTab("company-admin")}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View All Audits ({totalAudits})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3.5">Audit Title / Scope</th>
                  <th className="py-3 px-3.5">Auditee</th>
                  <th className="py-3 px-3.5">Framework</th>
                  <th className="py-3 px-3.5 text-center">Status</th>
                  <th className="py-3 px-3.5 text-center">Score</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {audits.slice(0, 5).map((a) => (
                  <tr key={a.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900">{a.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Code: {a.id}</div>
                    </td>
                    <td className="py-3 px-3.5 font-medium text-slate-700">{a.customerName}</td>
                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold border border-slate-200">
                        {a.templateStandard || "ISO Standard"}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          a.status === "In Progress"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : a.status === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      {a.overallScore !== undefined && a.overallScore > 0 ? (
                        <span className="font-extrabold text-slate-900">{a.overallScore}%</span>
                      ) : (
                        <span className="text-slate-400 font-mono">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <button
                        onClick={() => navigateTo("perform", a.id)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-[11px] font-bold rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Standard Master Templates & Governance */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Provisioned Standards</h3>
              <p className="text-xs text-slate-500">Framework library rubrics</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              {templates.length} Ready
            </span>
          </div>

          <div className="space-y-2.5">
            {templates.slice(0, 5).map((t) => (
              <div
                key={t.id}
                onClick={() => setActiveTab("templates")}
                className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{t.standard}</span>
                    <span className="text-[10px] text-slate-400 font-normal">v{t.version}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{t.title}</div>
                </div>
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
};
