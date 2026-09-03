import React from "react";
import { AuditFirm, User, AuditTemplate } from "../../types/audit";
import {
  Building2,
  Award,
  Users,
  FileSpreadsheet,
  Edit3,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Mail,
  MapPin,
  CheckCircle2,
  Eye,
} from "lucide-react";

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
  templates,
  selectedFirmId,
  onSelectFirm,
  onEditFirm,
  onDeleteFirm,
}) => {
  if (firms.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs">
        <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-700">No Audit Firms Found</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          No audit bodies match your search criteria. Try a different search term or register a new firm.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {firms.map((firm) => {
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
          <div
            key={firm.id}
            onClick={() => onSelectFirm(firm.id)}
            className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between p-5 cursor-pointer group shadow-xs hover:shadow-md ${
              isSelected
                ? "border-indigo-400 ring-2 ring-indigo-100"
                : "border-slate-200 hover:border-indigo-300"
            }`}
          >
            <div>
              {/* Card Top: Logo, Status, and Code */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs transition-transform group-hover:scale-105 ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-indigo-200"
                        : "bg-slate-900 text-white"
                    }`}
                  >
                    {firm.logoInitials}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {firm.name}
                    </h3>
                    <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
                      {firm.code}
                    </span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
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
              </div>

              {/* Industry Scope */}
              <p className="mt-4 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {firm.industryScope || "General Quality & Conformity Assessment Surveillance"}
              </p>

              {/* Meta stats: Multiple Users & Multiple Templates */}
              <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2 p-2 bg-indigo-50/50 rounded-lg border border-indigo-100/50">
                  <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-500 block">Assigned Staff</span>
                    <strong className="text-slate-900 font-bold block text-xs">
                      {assignedStaff.length} {assignedStaff.length === 1 ? "User" : "Users"}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100/50">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-500 block">Templates</span>
                    <strong className="text-slate-900 font-bold block text-xs">
                      {maintainedTemplates.length} Standards
                    </strong>
                  </div>
                </div>
              </div>

              {/* Contact summary */}
              <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
                <span className="flex items-center gap-1 truncate max-w-[190px]">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{firm.contactEmail}</span>
                </span>
                {firm.establishedYear && (
                  <span className="text-slate-400">Est. {firm.establishedYear}</span>
                )}
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div
              className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => onSelectFirm(firm.id)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Detailed Screen</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => onEditFirm(firm, e)}
                  title="Edit Firm"
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => onDeleteFirm(firm.id, firm.name, e)}
                  title="Delete Firm"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
