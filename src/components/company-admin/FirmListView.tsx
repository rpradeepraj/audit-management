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
  Calendar,
} from "lucide-react";

interface FirmListViewProps {
  firms: AuditFirm[];
  users: User[];
  templates: AuditTemplate[];
  selectedFirmId: string;
  onSelectFirm: (firmId: string) => void;
  onEditFirm: (firm: AuditFirm, e: React.MouseEvent) => void;
  onDeleteFirm: (firmId: string, firmName: string, e: React.MouseEvent) => void;
}

export const FirmListView: React.FC<FirmListViewProps> = ({
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
    <div className="space-y-3">
      {firms.map((firm) => {
        const assignedStaff = users.filter(
          (u) =>
            u.companyId === firm.id ||
            u.companyName === firm.name
        );

        const maintainedTemplates = templates.filter((t) =>
          (firm.maintainedTemplateIds || []).includes(t.id)
        );

        const isSelected = selectedFirmId === firm.id;

        return (
          <div
            key={firm.id}
            onClick={() => onSelectFirm(firm.id)}
            className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer shadow-2xs hover:shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
              isSelected
                ? "border-indigo-500 ring-2 ring-indigo-100"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            {/* Left side: Firm Branding & Basic Info */}
            <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-xs ${
                  isSelected ? "bg-indigo-600 ring-2 ring-indigo-200" : "bg-slate-800"
                }`}
              >
                {firm.logoInitials}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
                    {firm.code}
                  </span>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base leading-snug truncate">
                    {firm.name}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                      firm.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : firm.status === "Pending Accreditation"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {firm.status === "Active" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                    <span>{firm.status}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {firm.city}, {firm.country}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {firm.contactEmail}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-600 font-semibold truncate">
                    <Award className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    {firm.accreditationBody} ({firm.accreditationStandard})
                  </span>
                </div>
              </div>
            </div>

            {/* Center/Right stats chips */}
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap lg:flex-nowrap shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
              <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 text-center min-w-[90px]">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                  <Users className="w-3 h-3 text-indigo-500" />
                  <span>Auditors</span>
                </div>
                <div className="text-xs font-black text-slate-800 mt-0.5">
                  {assignedStaff.length} Staff
                </div>
              </div>

              <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 text-center min-w-[90px]">
                <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                  <FileSpreadsheet className="w-3 h-3 text-emerald-500" />
                  <span>Standards</span>
                </div>
                <div className="text-xs font-black text-slate-800 mt-0.5">
                  {maintainedTemplates.length} Standards
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 ml-auto lg:ml-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFirm(firm.id);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                  title="View detailed firm profile"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => onEditFirm(firm, e)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-indigo-200"
                  title="Edit firm accreditation details"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={(e) => onDeleteFirm(firm.id, firm.name, e)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                  title="Delete firm"
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
