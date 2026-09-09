"use client";

import React from "react";
import { AuditFirm, User, AuditTemplate } from "../../shared/types/audit";
import {
  Building2,
  Edit3,
  Trash2,
  Eye,
  Mail,
} from "lucide-react";
import { UserAvatar } from "../../shared/components/ui";

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
            <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4 font-bold">AUDIT FIRM & CODE</th>
              <th className="py-3.5 px-4 font-bold">STATUS</th>
              <th className="py-3.5 px-4 font-bold">ASSIGNED STAFF</th>
              <th className="py-3.5 px-4 font-bold">ASSIGNED TEMPLATES</th>
              <th className="py-3.5 px-4 font-bold">GOVERNANCE CONTACT</th>
              <th className="py-3.5 px-4 text-right font-bold">ACTIONS</th>
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
                const assignedStaff = firm.assignedStaff || [];

                const maintainedTemplates = templates.filter((t) =>
                  (firm.maintainedTemplateIds || []).includes(t.id)
                );

                const isSelected = firm.id === selectedFirmId;

                // Standards mapping
                const displayStandards = maintainedTemplates.map((t) => t.standard);

                return (
                  <tr
                    key={firm.id}
                    onClick={() => onSelectFirm(firm.id)}
                    className={`hover:bg-slate-50/60 transition-colors cursor-pointer group ${
                      isSelected ? "bg-teal-50/15" : ""
                    }`}
                  >
                    {/* AUDIT FIRM & CODE */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                          {firm.logoInitials}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[13px] text-slate-900 group-hover:text-teal-700 transition-colors">
                            {firm.name}
                          </span>
                          <span className="font-mono text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded-md">
                            {firm.code}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>ACTIVE</span>
                      </span>
                    </td>

                    {/* ASSIGNED STAFF */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {assignedStaff.length > 0 && (
                          <div className="flex -space-x-2 overflow-hidden">
                            {assignedStaff.slice(0, 3).map((staff) => (
                              <UserAvatar
                                key={staff.id}
                                src={staff.avatar}
                                name={staff.name}
                                size="sm"
                                title={`${staff.name} (${staff.role})`}
                                className="ring-2 ring-white"
                              />
                            ))}
                          </div>
                        )}
                        <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md text-[11px]">
                          {assignedStaff.length} {assignedStaff.length === 1 ? "user" : "users"}
                        </span>
                      </div>
                    </td>

                    {/* ASSIGNED TEMPLATES */}
                    <td className="py-4 px-4">
                      <div className="space-y-1 max-w-[280px]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px] shrink-0">
                            {maintainedTemplates.length} Standards
                          </span>
                          {displayStandards.slice(0, 1).map((std, i) => (
                            <span
                              key={i}
                              className="font-mono text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded"
                            >
                              {std}
                            </span>
                          ))}
                        </div>
                        {displayStandards.length > 1 && (
                          <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-600 font-mono">
                            <span>{displayStandards[1]}</span>
                            {displayStandards.length > 2 && (
                              <span className="font-sans text-[10px] text-slate-400 font-medium">
                                +{displayStandards.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* GOVERNANCE CONTACT */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 truncate max-w-[220px]">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{firm.contactEmail}</span>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="py-4 px-4 text-right">
                      <div
                        className="flex items-center justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onSelectFirm(firm.id)}
                          className="px-2 py-1 text-xs font-bold text-teal-600 hover:text-teal-800 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Open Details Screen"
                        >
                          <Eye className="w-3.5 h-3.5 shrink-0" />
                          <span>Details</span>
                        </button>
                        <button
                          onClick={(e) => onEditFirm(firm, e)}
                          className="p-1 text-slate-400 hover:text-teal-600 transition-colors cursor-pointer"
                          title="Edit Firm"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => onDeleteFirm(firm.id, firm.name, e)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
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

export default FirmTableView;
