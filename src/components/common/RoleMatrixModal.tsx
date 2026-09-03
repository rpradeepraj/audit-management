import React, { useState } from "react";
import { useAudit } from "../../context/AuditContext";
import { ROLE_ACCESS_MATRIX } from "../../utils/rbac";
import { UserRole } from "../../types/audit";
import {
  ShieldCheck,
  X,
  Check,
  Eye,
  Edit3,
  Building,
  Lock,
  Info,
  CheckCircle2,
} from "lucide-react";

export const RoleMatrixModal: React.FC = () => {
  const { isRoleMatrixModalOpen, setIsRoleMatrixModalOpen, currentUser, setCurrentUser, users } = useAudit();
  const [highlightRole, setHighlightRole] = useState<UserRole>(currentUser.role);

  if (!isRoleMatrixModalOpen || (currentUser.role !== "Admin" && currentUser.role !== "Platform Admin")) return null;

  const rolesList: { role: UserRole; title: string; color: string; desc: string }[] = [
    {
      role: "Platform Admin",
      title: "Platform Admin",
      color: "bg-purple-100 text-purple-800 border-purple-300",
      desc: "Full system administration, auditing firm governance, global compliance, templates & analytics",
    },
    {
      role: "Company Admin",
      title: "Company Admin",
      color: "bg-blue-100 text-blue-800 border-blue-300",
      desc: "Manage auditing firm setup, team members, customers, templates, and audits",
    },
    {
      role: "Audit Manager",
      title: "Audit Manager",
      color: "bg-indigo-100 text-indigo-800 border-indigo-300",
      desc: "Plan & assign audits, review audit executions, approve reports, review CAPAs",
    },
    {
      role: "Auditor",
      title: "Field / Lead Auditor",
      color: "bg-emerald-100 text-emerald-800 border-emerald-300",
      desc: "Conduct audits, score checklist questions, upload evidence, log non-conformity findings",
    },
    {
      role: "Customer Representative",
      title: "Customer Rep",
      color: "bg-amber-100 text-amber-800 border-amber-300",
      desc: "Auditee quality manager: respond to findings, conduct 5-Why RCA, submit CAPA plans & proof",
    },
    {
      role: "Customer Viewer",
      title: "Customer Viewer",
      color: "bg-slate-100 text-slate-700 border-slate-300",
      desc: "Auditee stakeholder: read-only access to company audits, findings, CAPA status & reports",
    },
  ];

  const renderBadge = (val: string, isHighlighted: boolean) => {
    if (val === "✓") {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${
            isHighlighted
              ? "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400"
              : "bg-emerald-100 text-emerald-800"
          }`}
        >
          <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Full
        </span>
      );
    }
    if (val === "-") {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
            isHighlighted
              ? "bg-slate-800 text-slate-300"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          <Lock className="w-3 h-3 text-slate-400" /> Hidden
        </span>
      );
    }
    if (val === "View") {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
            isHighlighted
              ? "bg-sky-600 text-white shadow-sm ring-1 ring-sky-400"
              : "bg-sky-100 text-sky-800"
          }`}
        >
          <Eye className="w-3 h-3" /> View
        </span>
      );
    }
    if (val === "Own Customer") {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
            isHighlighted
              ? "bg-amber-600 text-white shadow-sm ring-1 ring-amber-400"
              : "bg-amber-100 text-amber-900"
          }`}
        >
          <Building className="w-3 h-3" /> Own Customer
        </span>
      );
    }
    if (val === "Assigned") {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
            isHighlighted
              ? "bg-teal-600 text-white shadow-sm"
              : "bg-teal-100 text-teal-800"
          }`}
        >
          <CheckCircle2 className="w-3 h-3" /> Assigned
        </span>
      );
    }
    if (val === "Review" || val === "Approve") {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
            isHighlighted
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-purple-100 text-purple-800"
          }`}
        >
          <Check className="w-3 h-3" /> {val}
        </span>
      );
    }
    if (val === "Create/Update") {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
            isHighlighted
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-emerald-100 text-emerald-800"
          }`}
        >
          <Edit3 className="w-3 h-3" /> Create/Update
        </span>
      );
    }
    return (
      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
        {val}
      </span>
    );
  };

  const handleSwitchToRole = (targetRole: UserRole) => {
    const matchedUser = users.find((u) => u.role === targetRole);
    if (matchedUser) {
      setCurrentUser(matchedUser);
      setHighlightRole(targetRole);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-900/50">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Role-Based Access Control (RBAC) Matrix
                </h3>
                <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-300 text-xs font-semibold rounded-md border border-indigo-400/20">
                  Strict Security Model
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Official access governance rules enforced across all 8 modules of the audit lifecycle
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRoleMatrixModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Filter / Selector Buttons */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600" />
            <span>Click any role to highlight permissions or switch persona:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {rolesList.map((r) => {
              const isActive = highlightRole === r.role;
              const isCurrent = currentUser.role === r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => {
                    setHighlightRole(r.role);
                    handleSwitchToRole(r.role);
                  }}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl transition-all flex items-center gap-2 border ${
                    isActive
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold"
                      : "bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-100"
                  }`}
                >
                  <span>{r.title}</span>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Active Logged-in User" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Matrix Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900 text-white font-semibold divide-x divide-slate-800">
                  <th className="p-4 w-48 bg-slate-950 font-bold tracking-tight text-slate-200 text-sm">
                    Module / Feature
                  </th>
                  <th className={`p-3.5 text-center transition-colors ${highlightRole === "Platform Admin" || highlightRole === "Admin" ? "bg-indigo-900 text-white font-bold ring-2 ring-indigo-400" : ""}`}>
                    Platform Admin
                  </th>
                  <th className={`p-3.5 text-center transition-colors ${highlightRole === "Company Admin" ? "bg-indigo-900 text-white font-bold ring-2 ring-indigo-400" : ""}`}>
                    Company Admin
                  </th>
                  <th className={`p-3.5 text-center transition-colors ${highlightRole === "Audit Manager" ? "bg-indigo-900 text-white font-bold ring-2 ring-indigo-400" : ""}`}>
                    Audit Manager
                  </th>
                  <th className={`p-3.5 text-center transition-colors ${highlightRole === "Auditor" ? "bg-indigo-900 text-white font-bold ring-2 ring-indigo-400" : ""}`}>
                    Auditor
                  </th>
                  <th className={`p-3.5 text-center transition-colors ${highlightRole === "Customer Representative" ? "bg-indigo-900 text-white font-bold ring-2 ring-indigo-400" : ""}`}>
                    Customer Rep
                  </th>
                  <th className={`p-3.5 text-center transition-colors ${highlightRole === "Customer Viewer" ? "bg-indigo-900 text-white font-bold ring-2 ring-indigo-400" : ""}`}>
                    Customer Viewer
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {ROLE_ACCESS_MATRIX.map((row, idx) => (
                  <tr
                    key={row.module}
                    className={`divide-x divide-slate-100 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                    } hover:bg-indigo-50/30`}
                  >
                    <td className="p-4 font-bold text-slate-900 bg-slate-50/70 text-sm">
                      {row.module}
                    </td>
                    <td className={`p-3.5 text-center ${highlightRole === "Platform Admin" || highlightRole === "Admin" ? "bg-indigo-50/60 font-medium" : ""}`}>
                      {renderBadge(row.admin, highlightRole === "Platform Admin" || highlightRole === "Admin")}
                    </td>
                    <td className={`p-3.5 text-center ${highlightRole === "Company Admin" ? "bg-indigo-50/60 font-medium" : ""}`}>
                      {renderBadge(row.companyAdmin, highlightRole === "Company Admin")}
                    </td>
                    <td className={`p-3.5 text-center ${highlightRole === "Audit Manager" ? "bg-indigo-50/60 font-medium" : ""}`}>
                      {renderBadge(row.auditManager, highlightRole === "Audit Manager")}
                    </td>
                    <td className={`p-3.5 text-center ${highlightRole === "Auditor" ? "bg-indigo-50/60 font-medium" : ""}`}>
                      {renderBadge(row.auditor, highlightRole === "Auditor")}
                    </td>
                    <td className={`p-3.5 text-center ${highlightRole === "Customer Representative" ? "bg-indigo-50/60 font-medium" : ""}`}>
                      {renderBadge(row.customerRep, highlightRole === "Customer Representative")}
                    </td>
                    <td className={`p-3.5 text-center ${highlightRole === "Customer Viewer" ? "bg-indigo-50/60 font-medium" : ""}`}>
                      {renderBadge(row.customerViewer, highlightRole === "Customer Viewer")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Persona Card Detail for Highlighted Role */}
          <div className="mt-5 p-4 sm:p-5 rounded-2xl border border-indigo-100 bg-indigo-50/50 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold text-indigo-950">
                  Selected Role: {highlightRole}
                </span>
                <span className="text-xs text-indigo-700 font-medium">
                  ({rolesList.find((r) => r.role === highlightRole)?.desc})
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">
                Currently logged in as: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.companyName})
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs sm:text-sm text-slate-500">
            RBAC Matrix is enforced on navigation, action buttons, forms, and data filters.
          </div>
          <button
            onClick={() => setIsRoleMatrixModalOpen(false)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
