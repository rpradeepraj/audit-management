"use client";

import React from "react";
import { AuditFirm, User, AuditTemplate } from "../../shared/types/audit";
import {
  Building2,
  Award,
  Users,
  FileSpreadsheet,
  Edit3,
  Trash2,
  Eye,
  ChevronRight,
  ShieldCheck,
  Mail,
  MapPin,
  ExternalLink,
} from "lucide-react";

interface FirmTableViewProps {
  firms: AuditFirm[];
  users: User[];
  templates: AuditTemplate[];
  selectedFirmId: string;
  onSelectFirm: (firmId: string) => void;
  onEditFirm: (firm: AuditFirm, e: React.MouseEvent) => void;
  onDeleteFirm: (firmId: string, firmName: string, e: React.MouseEvent) => void;
}

export const FirmTableView: React.FC<FirmTableViewProps> = ({
  firms,
  users,
  templates,
  selectedFirmId,
  onSelectFirm,
  onEditFirm,
  onDeleteFirm,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">Audit Firm & Code</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Assigned Staff</th>
              <th className="py-3.5 px-4">Assigned Templates</th>
              <th className="py-3.5 px-4">Governance Contact</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {firms.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-600">No audit firms found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Try adjusting your search criteria or register a new firm.
                  </p>
                </td>
              </tr>
            ) : (
              firms.map((firm) => {
                const assignedStaff = users.filter(
                  (u) =>
                    u.companyId === firm.id ||
                    u.companyName === firm.name
                );

                const maintainedTemplates = templates.filter((t) =>
                  (firm.maintainedTemplateIds || []).includes(t.id)
                );

                const isSelected = firm.id === selectedFirmId;

                return (
                  <tr
                    key={firm.id}
                    onClick={() => onSelectFirm(firm.id)}
                    className={`hover:bg-indigo-50/40 transition-colors cursor-pointer group ${
                      isSelected ? "bg-indigo-50/20" : ""
                    }`}
                  >
                    {/* Firm Name & Code */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                            isSelected
                              ? "bg-indigo-600 text-white shadow-indigo-200"
                              : "bg-slate-900 text-white"
                          }`}
                        >
                          {firm.logoInitials}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {firm.name}
                          </span>
                          <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
                            {firm.code}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          firm.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            firm.status === "Active" ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                        />
                        <span>{firm.status || "Active"}</span>
                      </span>
                    </td>

                    {/* Assigned Staff */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2 overflow-hidden">
                          {assignedStaff.slice(0, 3).map((staff) => (
                            <img
                              key={staff.id}
                              src={staff.avatar}
                              alt={staff.name}
                              title={`${staff.name} (${staff.role})`}
                              className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                            />
                          ))}
                        </div>
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                          {assignedStaff.length} {assignedStaff.length === 1 ? "user" : "users"}
                        </span>
                      </div>
                    </td>

                    {/* Assigned Templates */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap max-w-[240px]">
                        <span className="font-bold text-slate-800 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-md text-[11px] shrink-0">
                          {maintainedTemplates.length} Standards
                        </span>
                        {maintainedTemplates.slice(0, 2).map((t) => (
                          <span
                            key={t.id}
                            className="font-mono text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                          >
                            {t.standard}
                          </span>
                        ))}
                        {maintainedTemplates.length > 2 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            +{maintainedTemplates.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Contact & HQ */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-[11px] text-slate-700 truncate max-w-[180px]">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{firm.contactEmail}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onSelectFirm(firm.id)}
                          className="px-2.5 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50/60 hover:bg-indigo-600 hover:text-white rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                          title="Open Detailed View Screen"
                        >
                          <Eye className="w-3.5 h-3.5 shrink-0" />
                          <span>Details</span>
                        </button>
                        <button
                          onClick={(e) => onEditFirm(firm, e)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Firm"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => onDeleteFirm(firm.id, firm.name, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Firm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
