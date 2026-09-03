import React from "react";
import { useAudit } from "../../context/AuditContext";
import {
  ShieldAlert,
  Building,
  Users,
  Database,
  RotateCcw,
  CheckCircle2,
  HardDrive,
  Cpu,
  Server,
} from "lucide-react";

export const AdminView: React.FC = () => {
  const { customers, audits, users, resetAllData } = useAudit();

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Super Administrator Control Plane</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            System & Multi-Tenant Administration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage subscriber auditing companies, multi-tenant isolation, data integrity, and system health.
          </p>
        </div>

        <button
          onClick={resetAllData}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-rose-200 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset All Demo Data</span>
        </button>
      </div>

      {/* System Health Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tenant Entities
            </span>
            <Building className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {customers.length + 1}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            1 Auditing Body + {customers.length} Auditee Organizations
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Database Records
            </span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {audits.length * 12 + 48} Objects
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            LocalStorage persistent store (Veritas v2.5 schema)
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              AI Engine Status
            </span>
            <Cpu className="w-4 h-4 text-violet-600" />
          </div>
          <div className="mt-2 text-base font-bold text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Gemini 3.7 Online</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Server-side API proxy active on Express
          </p>
        </div>
      </div>

      {/* Tenant Companies List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">
          Registered Multi-Tenant Subscribers
        </h3>

        <div className="space-y-3">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 text-xs">
                Veritas Auditing & Assurance Partners (Master Tenant)
              </span>
              <p className="text-xs text-slate-500">
                Primary Auditing Firm • Full Lifecycle Control
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">
              Auditing Body
            </span>
          </div>

          {customers.map((c) => (
            <div
              key={c.id}
              className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-900 text-xs">{c.name}</span>
                <p className="text-xs text-slate-500">
                  {c.industry} • Code: {c.code}
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
                Auditee Customer
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
