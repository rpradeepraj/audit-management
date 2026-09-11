"use client";

import React from "react";
import { Customer, AuditPlan, User } from "../../shared/types/audit";
import {
  Building2,
  X,
  Phone,
  Mail,
  MapPin,
  CalendarCheck2,
  Users,
  UserPlus,
  Trash2,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { StatusBadge, UserAvatar } from "../../shared/components/ui";

interface CustomerDetailDrawerProps {
  customer: Customer;
  audits: AuditPlan[];
  users: User[];
  onClose: () => void;
  onOpenAddUser: () => void;
  onDeleteUser: (id: string) => void;
  onOpenAudit: (auditId: string) => void;
}

export const CustomerDetailDrawer: React.FC<CustomerDetailDrawerProps> = ({
  customer,
  audits,
  users,
  onClose,
  onOpenAddUser,
  onDeleteUser,
  onOpenAudit,
}) => {
  const customerAudits = audits.filter((a) => a.customerId === customer.id);
  const customerUsers = users.filter(
    (u) =>
      u.companyId === customer.id ||
      u.companyName === customer.name ||
      u.companyName?.toLowerCase().includes(customer.name.toLowerCase())
  );

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">{customer.name}</h3>
            <span className="text-xs text-slate-500 font-mono">{customer.code} • {customer.industry}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
        {/* Contact Specs */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
          <div className="font-bold text-slate-800 text-xs">Contact & Facility Specs</div>
          <div className="grid grid-cols-2 gap-2 text-slate-600">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{customer.contactPerson}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{customer.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{customer.phone || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{customer.address}</span>
            </div>
          </div>
        </div>

        {/* Audit Engagements */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Surveillance Engagements ({customerAudits.length})
            </h4>
          </div>

          {customerAudits.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400">
              No audit engagements currently on record.
            </div>
          ) : (
            <div className="space-y-2">
              {customerAudits.map((a) => (
                <div
                  key={a.id}
                  onClick={() => onOpenAudit(a.id)}
                  className="p-3 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {a.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {a.startDate} → {a.endDate} • {a.leadAuditorName}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={a.status} />
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stakeholders & Users */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Assigned Personnel ({customerUsers.length})
            </h4>
            <button
              onClick={onOpenAddUser}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Personnel</span>
            </button>
          </div>

          {customerUsers.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400">
              No personnel attached to this organization.
            </div>
          ) : (
            <div className="space-y-2">
              {customerUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <UserAvatar
                      src={u.avatar}
                      name={u.name}
                      size="md"
                    />
                    <div>
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.email} • {u.role}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteUser(u.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                    title="Remove user"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
