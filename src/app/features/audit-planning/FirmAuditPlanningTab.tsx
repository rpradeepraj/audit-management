"use client";

import React, { useState, useMemo } from "react";
import { useAudit } from "../../shared/context/AuditContext";
import {
  AuditFirm,
  AuditPlan,
} from "../../shared/types/audit";
import {
  CalendarCheck2,
  Plus,
  Search,
  Users,
  Building2,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  Calendar,
  FileText,
  MapPin,
  ChevronRight,
  Edit3,
  ArrowRight,
  Sparkles,
  LayoutGrid,
  Table,
} from "lucide-react";
import { PerformAuditView } from "../../features/audit-execution/PerformAuditView";
import { ScheduleAuditModal } from "./ScheduleAuditModal";
import { RescheduleModal } from "./RescheduleModal";
import { AuditDetailModal } from "./AuditDetailModal";
import { StatusBadge } from "../../shared/components/ui";

interface FirmAuditPlanningTabProps {
  selectedFirm: AuditFirm;
  onSelectFirm: (firm: AuditFirm) => void;
  onOpenFirmDetail?: (firmId: string) => void;
  onExecutingChange?: (isExecuting: boolean) => void;
}

export const FirmAuditPlanningTab: React.FC<FirmAuditPlanningTabProps> = ({
  selectedFirm,
  onSelectFirm,
  onOpenFirmDetail,
  onExecutingChange,
}) => {
  const {
    firms,
    audits,
    customers,
    templates,
    users,
    createAudit,
    rescheduleAudit,
    confirmSchedule,
    sendScheduleReminder,
    updateAuditStatus,
    setActiveAuditId,
    setActiveTab,
  } = useAudit();

  const [activeFirmId, setActiveFirmId] = useState<string>(selectedFirm.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [standardFilter, setStandardFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");

  // Modals state
  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false);
  const [editingAuditId, setEditingAuditId] = useState<string | null>(null);
  const [selectedAuditForDossier, setSelectedAuditForDossier] = useState<AuditPlan | null>(null);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [reschedulingAudit, setReschedulingAudit] = useState<AuditPlan | null>(null);
  const [executingAuditId, setExecutingAuditId] = useState<string | null>(null);

  React.useEffect(() => {
    onExecutingChange?.(!!executingAuditId);
  }, [executingAuditId, onExecutingChange]);

  React.useEffect(() => {
    if (selectedFirm) {
      setActiveFirmId(selectedFirm.id);
    }
  }, [selectedFirm.id]);

  React.useEffect(() => {
    const handleOpenPlanEvent = () => {
      setEditingAuditId(null);
      setIsCreatePlanModalOpen(true);
    };
    window.addEventListener("open-create-audit-plan", handleOpenPlanEvent);
    return () => {
      window.removeEventListener("open-create-audit-plan", handleOpenPlanEvent);
    };
  }, []);

  const currentFirm = firms.find((f) => f.id === activeFirmId) || selectedFirm;

  const filteredAudits = useMemo(() => {
    return audits.filter((audit) => {
      if (activeFirmId !== "ALL" && audit.firmId !== activeFirmId) {
        return false;
      }
      if (statusFilter !== "ALL" && audit.status !== statusFilter) {
        return false;
      }
      if (standardFilter !== "ALL") {
        const matchesStandard =
          (audit.templateStandard && audit.templateStandard.includes(standardFilter)) ||
          (audit.standard && audit.standard.includes(standardFilter));
        if (!matchesStandard) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQ =
          audit.title.toLowerCase().includes(q) ||
          audit.customerName.toLowerCase().includes(q) ||
          (audit.templateStandard && audit.templateStandard.toLowerCase().includes(q)) ||
          (audit.standard && audit.standard.toLowerCase().includes(q)) ||
          audit.auditNumber?.toLowerCase().includes(q) ||
          audit.id.toLowerCase().includes(q);
        if (!matchesQ) return false;
      }
      return true;
    });
  }, [audits, activeFirmId, statusFilter, standardFilter, searchQuery]);

  const stats = useMemo(() => {
    const firmAudits = audits.filter((a) => activeFirmId === "ALL" || a.firmId === activeFirmId);
    const scheduled = firmAudits.filter((a) => a.status === "Scheduled").length;
    const inProgress = firmAudits.filter((a) => a.status === "In Progress").length;
    const completed = firmAudits.filter((a) => a.status === "Completed").length;
    const total = firmAudits.length;
    return { scheduled, inProgress, completed, total };
  }, [audits, activeFirmId]);

  const handleOpenCreatePlan = () => {
    setEditingAuditId(null);
    setIsCreatePlanModalOpen(true);
  };

  const handleOpenEditPlan = (audit: AuditPlan) => {
    setEditingAuditId(audit.id);
    setIsCreatePlanModalOpen(true);
  };

  const handleOpenReschedule = (audit: AuditPlan) => {
    setReschedulingAudit(audit);
    setIsRescheduleModalOpen(true);
  };

  const handleLaunchAudit = (auditId: string) => {
    setActiveAuditId(auditId);
    setExecutingAuditId(auditId);
  };

  if (executingAuditId) {
    return (
      <PerformAuditView
        auditId={executingAuditId}
        onBack={() => setExecutingAuditId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* AUDIT PLANNING TOOLBAR: SEARCH, FILTERS, VIEW MODES */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full lg:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search plan, customer, standard, code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>

        {/* Filters, View Switcher & Firm Selector */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap justify-between lg:justify-end">
          {/* Status Select */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Under Review">Under Review</option>
              <option value="Draft">Draft</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Standard Select */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Standard:</span>
            <select
              value={standardFilter}
              onChange={(e) => setStandardFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
            >
              <option value="ALL">All Frameworks</option>
              <option value="ISO 9001">ISO 9001</option>
              <option value="ISO 27001">ISO 27001</option>
              <option value="ISO 14001">ISO 14001</option>
              <option value="GMP">GMP / FDA</option>
              <option value="SOC 2">SOC 2 Type II</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "table" ? "bg-white text-indigo-600 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table View"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "cards" ? "bg-white text-indigo-600 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Firm Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-indigo-50/70 border border-indigo-200/80 px-2.5 py-1 rounded-xl">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-900">Firm:</span>
            <select
              value={activeFirmId}
              onChange={(e) => {
                const target = e.target.value;
                setActiveFirmId(target);
                if (target !== "ALL") {
                  const f = firms.find((x) => x.id === target);
                  if (f) onSelectFirm(f);
                }
              }}
              className="bg-transparent text-xs font-bold text-indigo-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="ALL">All Audit Firms ({audits.length} Audits)</option>
              {firms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.code} – {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Schedule Plan CTA */}
          <button
            onClick={handleOpenCreatePlan}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Plan</span>
          </button>
        </div>
      </div>

      {/* AUDIT LISTING: TABLE OR CARDS */}
      {filteredAudits.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <CalendarCheck2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No Audit Engagements Match Selected Scope</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No audits found for standard <strong>{standardFilter}</strong> and status <strong>{statusFilter}</strong>.
          </p>
          <button
            onClick={handleOpenCreatePlan}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Create First Audit Plan
          </button>
        </div>
      ) : viewMode === "cards" ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAudits.map((audit) => {
            const auditFirm = firms.find((f) => f.id === audit.firmId) || currentFirm;
            return (
              <div
                key={audit.id}
                className="bg-white border border-slate-200/80 hover:border-indigo-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {auditFirm.code}
                    </span>
                    <StatusBadge status={audit.status} />
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {audit.title}
                  </h4>

                  <div className="mt-2 space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate">{audit.customerName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{audit.startDate} → {audit.endDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{audit.facilityAddress || audit.location || "On-Site"}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    Lead: <strong className="text-slate-800">{audit.leadAuditorName}</strong>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedAuditForDossier(audit)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Inspect Dossier"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditPlan(audit)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Plan"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleLaunchAudit(audit.id)}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      Execute
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* High-Density Table View */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Audit Engagement</th>
                  <th className="py-3 px-4">Auditee</th>
                  <th className="py-3 px-4">Lead Auditor</th>
                  <th className="py-3 px-4">Scheduled Dates</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredAudits.map((audit) => {
                  return (
                    <tr key={audit.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {audit.title}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {audit.customerName}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {audit.leadAuditorName}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {audit.startDate} → {audit.endDate}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={audit.status} />
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedAuditForDossier(audit)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Inspect Itinerary Dossier"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditPlan(audit)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Plan"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleLaunchAudit(audit.id)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-md shadow-2xs transition-colors cursor-pointer"
                          >
                            Execute
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}
      {isCreatePlanModalOpen && (
        <ScheduleAuditModal
          isOpen={isCreatePlanModalOpen}
          onClose={() => setIsCreatePlanModalOpen(false)}
          onSave={(auditData) => {
            if (editingAuditId) {
              updateAuditStatus(editingAuditId, auditData.status || "Scheduled");
            } else {
              createAudit({
                ...auditData,
                firmId: currentFirm.id,
                firmName: currentFirm.name,
                customerId: customers[0]?.id || "cust_apex",
                customerName: customers[0]?.name || "Apex Global",
                templateStandard: templates[0]?.standard || "ISO 9001:2015",
                templateId: templates[0]?.id || "tmpl_iso9001",
                overallScore: 0,
                passingScore: 80,
              } as any);
            }
            setIsCreatePlanModalOpen(false);
          }}
          editingAudit={editingAuditId ? audits.find((a) => a.id === editingAuditId) || null : null}
          firm={currentFirm}
          customers={customers}
          templates={templates}
          users={users}
        />
      )}

      {isRescheduleModalOpen && reschedulingAudit && (
        <RescheduleModal
          audit={reschedulingAudit}
          onClose={() => setIsRescheduleModalOpen(false)}
          onSave={(auditId, updates) => {
            rescheduleAudit(auditId, updates);
            setIsRescheduleModalOpen(false);
          }}
        />
      )}

      {selectedAuditForDossier && (
        <AuditDetailModal
          audit={selectedAuditForDossier}
          firm={currentFirm}
          onClose={() => setSelectedAuditForDossier(null)}
          onLaunchExecution={(auditId) => handleLaunchAudit(auditId)}
        />
      )}
    </div>
  );
};
