"use client";

import React from "react";
import { AuditFirm, User, AuditTemplate } from "../../shared/types/audit";
import { Building2, Users, FileSpreadsheet, MapPin, Edit3, Trash2 } from "lucide-react";

interface FirmGridViewProps {
  firms: AuditFirm[];
  users: User[];
  templates: AuditTemplate[];
  selectedFirmId: string;
  onSelectFirm: (firmId: string) => void;
  onEditFirm: (firm: AuditFirm, e: React.MouseEvent) => void;
  onDeleteFirm: (firmId: string, firmName: string, e: React.MouseEvent) => void;
}

export const FirmGridView: React.FC<FirmGridViewProps> = ({
  firms,
  users,
  selectedFirmId,
  onSelectFirm,
  onEditFirm,
  onDeleteFirm,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {firms.map((firm) => {
        const staffCount = (firm.assignedStaff || []).length;

        const isSelected = selectedFirmId === firm.id;

        return (
          <div
            key={firm.id}
            onClick={() => onSelectFirm(firm.id)}
            className={`bg-white border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-4 ${
              isSelected ? "border-indigo-400 ring-2 ring-indigo-200" : "border-slate-200/80 hover:border-indigo-300"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono border border-indigo-200">
                  {firm.code}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                {firm.name}
              </h4>
              <div className="text-xs text-slate-500 mt-1 line-clamp-1">{firm.contactEmail}</div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{staffCount} Certified Staff</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                  <span>{(firm.maintainedTemplateIds || []).length} Standards Maintained</span>
                </div>
                {firm.address && (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{firm.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div
              className="pt-2 border-t border-slate-100 flex items-center justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => onSelectFirm(firm.id)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Inspect Firm →
              </button>

              <div className="flex items-center gap-1">
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
            </div>
          </div>
        );
      })}
    </div>
  );
};
