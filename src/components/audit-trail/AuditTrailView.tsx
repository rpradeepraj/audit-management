import React, { useState } from "react";
import { useAudit } from "../../context/AuditContext";
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  User,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";

export const AuditTrailView: React.FC = () => {
  const { logs, auditLogs, searchQuery } = useAudit();
  const [filterAction, setFilterAction] = useState<string>("ALL");

  const logList = auditLogs || logs || [];
  const query = (searchQuery || "").toLowerCase();

  const filteredLogs = logList.filter((log) => {
    const actionStr = (log.action || "").toLowerCase();
    const actorStr = (log.performedByName || log.userName || "").toLowerCase();
    const detailsStr = (log.details || "").toLowerCase();
    const entityTypeStr = (log.entityType || "").toLowerCase();

    const matchesSearch =
      actionStr.includes(query) ||
      actorStr.includes(query) ||
      detailsStr.includes(query) ||
      entityTypeStr.includes(query);

    const matchesAction =
      filterAction === "ALL" ||
      (log.entityType || "").toLowerCase() === filterAction.toLowerCase();

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (entityType: string = "") => {
    switch (entityType) {
      case "Finding":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "CAPA":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Audit":
      case "AuditPlan":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Customer":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "User":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <History className="w-3.5 h-3.5" />
            <span>Immutable Governance Record</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Audit Activity & History Trail
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically timestamped chronological trail of all checklist responses, non-conformities, CAPA submissions, and digital authorizations.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold overflow-x-auto">
        {["ALL", "Audit", "Finding", "CAPA", "Customer", "User"].map((f) => (
          <button
            key={f}
            onClick={() => setFilterAction(f)}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filterAction === f
                ? "bg-slate-900 text-white font-bold"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            {f === "ALL" ? `All Events (${logList.length})` : `${f} Events`}
          </button>
        ))}
      </div>

      {/* Logs Timeline Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3.5">Timestamp</th>
              <th className="p-3.5">Target Entity</th>
              <th className="p-3.5">Action Executed</th>
              <th className="p-3.5">Actor & Role</th>
              <th className="p-3.5">Governance Traceability Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getActionBadge(log.entityType)}`}>
                      {log.entityType}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">
                    {log.action}
                  </td>
                  <td className="p-3.5 font-medium text-slate-700">
                    <div>{log.performedByName || log.userName || "System User"}</div>
                    {log.userRole && (
                      <div className="text-[10px] text-slate-400 font-normal">{log.userRole}</div>
                    )}
                  </td>
                  <td className="p-3.5 text-slate-600 leading-relaxed">
                    {log.details}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  No activity log entries found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
