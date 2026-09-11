"use client";

import React, { useState } from "react";
import { useAudit } from "../../shared/context/AuditContext";
import {
  Building2,
  ArrowLeft,
  Users,
  FileSpreadsheet,
  CalendarCheck2,
  Edit3,
} from "lucide-react";
import { FirmModal } from "./FirmModal";
import { FirmAuditPlanningTab } from "../audit-planning/FirmAuditPlanningTab";
import { FirmOverviewTab } from "./firm-detail/FirmOverviewTab";
import { FirmStaffTab } from "./firm-detail/FirmStaffTab";
import { FirmTemplatesTab } from "./firm-detail/FirmTemplatesTab";

interface FirmDetailScreenProps {
  firmId: string;
  onBack: () => void;
  onSelectAnotherFirm: (firmId: string) => void;
}

export const FirmDetailScreen: React.FC<FirmDetailScreenProps> = ({
  firmId,
  onBack,
  onSelectAnotherFirm,
}) => {
  const {
    firms,
    updateFirm,
    users,
    addUserToFirm,
    updateUser,
    deleteUser,
    templates,
    toggleFirmTemplate,
    setActiveTab,
  } = useAudit();

  const firm = firms.find((f) => f.id === firmId) || firms[0];

  const [activeSection, setActiveSection] = useState<
    "overview" | "users" | "templates" | "audits"
  >("overview");

  const [isEditFirmModalOpen, setIsEditFirmModalOpen] = useState(false);

  if (!firm) {
    return (
      <div className="p-8 text-center space-y-3">
        <h3 className="text-sm font-bold text-slate-800">Firm Not Found</h3>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Firms
        </button>
      </div>
    );
  }

  const staffCount = (firm.assignedStaff || []).length;

  return (
    <div className="w-full p-3 sm:p-4 space-y-4">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Back to Firms"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
            {firm.code.split("-")[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900">
                {firm.name}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Agency
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span className="font-mono font-bold text-indigo-700">{firm.code}</span>
              <span>•</span>
              <span>{firm.address}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-center">
          {/* Quick Firm Switcher */}
          <select
            value={firm.id}
            onChange={(e) => onSelectAnotherFirm(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold text-slate-700 cursor-pointer"
          >
            {firms.map((f) => (
              <option key={f.id} value={f.id}>
                Switch: {f.code} ({f.name})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsEditFirmModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Section Tab Bar */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveSection("overview")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSection === "overview"
              ? "bg-indigo-600 text-white shadow-xs shadow-indigo-200"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Firm Profile & Scope</span>
        </button>

        <button
          onClick={() => setActiveSection("users")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSection === "users"
              ? "bg-indigo-600 text-white shadow-xs shadow-indigo-200"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Workforce Roster ({staffCount})</span>
        </button>

        <button
          onClick={() => setActiveSection("templates")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSection === "templates"
              ? "bg-indigo-600 text-white shadow-xs shadow-indigo-200"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Audit Templates ({(firm.maintainedTemplateIds || []).length})</span>
        </button>

        <button
          onClick={() => setActiveSection("audits")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSection === "audits"
              ? "bg-indigo-600 text-white shadow-xs shadow-indigo-200"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <CalendarCheck2 className="w-4 h-4" />
          <span>Audit Engagements</span>
        </button>
      </div>

      {/* Dynamic Tab Body */}
      {activeSection === "overview" && (
        <FirmOverviewTab
          firm={firm}
          onUpdateFirm={(id, updates) => updateFirm(id, updates)}
        />
      )}

      {activeSection === "users" && (
        <FirmStaffTab firm={firm} />
      )}

      {activeSection === "templates" && (
        <FirmTemplatesTab
          firm={firm}
          templates={templates}
          onToggleTemplate={(fId, tId) => toggleFirmTemplate(fId, tId)}
          onNavigateToTemplates={() => setActiveTab("templates")}
        />
      )}

      {activeSection === "audits" && (
        <FirmAuditPlanningTab
          selectedFirm={firm}
          onSelectFirm={() => {}}
        />
      )}

      {/* Edit Firm Modal */}
      {isEditFirmModalOpen && (
        <FirmModal
          isOpen={isEditFirmModalOpen}
          onClose={() => setIsEditFirmModalOpen(false)}
          onSave={(data) => {
            updateFirm(firm.id, data);
            setIsEditFirmModalOpen(false);
          }}
          editingFirm={firm}
        />
      )}
    </div>
  );
};
