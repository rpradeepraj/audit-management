import React, { useState, useMemo } from "react";
import { useAudit } from "../../context/AuditContext";
import {
  AuditFirm,
  AuditPlan,
  AuditStatus,
  AuditType,
  ScheduleRecurrence,
  LocationType,
} from "../../types/audit";
import {
  CalendarCheck2,
  Plus,
  Search,
  Filter,
  Users,
  Building2,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  Calendar,
  X,
  FileText,
  AlertCircle,
  MapPin,
  Video,
  Send,
  Printer,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Edit3,
  Trash2,
  Check,
  Tag,
  ArrowRight,
  Sparkles,
  ClipboardList,
  Eye,
  Briefcase,
  Layers,
  FileCheck,
  ChevronDown,
  LayoutGrid,
  Table,
} from "lucide-react";
import { PerformAuditView } from "../execution/PerformAuditView";

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
    currentUser,
    createAudit,
    rescheduleAudit,
    confirmSchedule,
    sendScheduleReminder,
    updateAuditStatus,
    setActiveAuditId,
    setActiveTab,
  } = useAudit();

  // Active firm filter: specific firm id or "ALL"
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

  // Sync activeFirmId when selectedFirm prop changes
  React.useEffect(() => {
    if (selectedFirm) {
      setActiveFirmId(selectedFirm.id);
    }
  }, [selectedFirm.id]);

  // Listen to external top action button
  React.useEffect(() => {
    const handleOpenPlanEvent = () => {
      handleOpenCreatePlan();
    };
    window.addEventListener("open-create-audit-plan", handleOpenPlanEvent);
    return () => {
      window.removeEventListener("open-create-audit-plan", handleOpenPlanEvent);
    };
  }, [selectedFirm, activeFirmId, firms, customers, templates, users]);

  // Current active firm object (or null if "ALL")
  const currentFirm = firms.find((f) => f.id === activeFirmId) || selectedFirm;

  // Form State for Create / Edit Audit Plan
  const [formFirmId, setFormFirmId] = useState<string>(currentFirm.id);
  const [formCustomerId, setFormCustomerId] = useState<string>(customers[0]?.id || "");
  const [formTemplateId, setFormTemplateId] = useState<string>(templates[0]?.id || "");
  const [formTemplateIds, setFormTemplateIds] = useState<string[]>([]);
  const [formTitle, setFormTitle] = useState("");
  const [formAuditType, setFormAuditType] = useState<AuditType>("Surveillance");
  const [formRecurrence, setFormRecurrence] = useState<ScheduleRecurrence>("Annual Surveillance");
  const [formStartDate, setFormStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [formEndDate, setFormEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split("T")[0];
  });
  const [formStartTime, setFormStartTime] = useState("09:00");
  const [formEndTime, setFormEndTime] = useState("17:30");
  const [formOpeningMeetingTime, setFormOpeningMeetingTime] = useState("09:30 AM");
  const [formClosingMeetingTime, setFormClosingMeetingTime] = useState("04:30 PM");
  const [formLocationType, setFormLocationType] = useState<LocationType>("On-Site");
  const [formFacilityAddress, setFormFacilityAddress] = useState("");
  const [formMeetingRoomOrLink, setFormMeetingRoomOrLink] = useState("Conference Room 101");
  const [formLeadAuditorId, setFormLeadAuditorId] = useState("");
  const [formLeadAuditorIds, setFormLeadAuditorIds] = useState<string[]>([]);
  const [formTeamMembers, setFormTeamMembers] = useState<string[]>([]);
  const [formScope, setFormScope] = useState("");
  const [formObjectives, setFormObjectives] = useState("");
  const [formScheduleNotes, setFormScheduleNotes] = useState("");

  // Dropdown states for multi-selects
  const [isFrameworkDropdownOpen, setIsFrameworkDropdownOpen] = useState(false);
  const [isAuditorDropdownOpen, setIsAuditorDropdownOpen] = useState(false);
  const [frameworkSearchQuery, setFrameworkSearchQuery] = useState("");
  const [auditorSearchQuery, setAuditorSearchQuery] = useState("");
  const auditorDropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        auditorDropdownRef.current &&
        !auditorDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAuditorDropdownOpen(false);
        setIsFrameworkDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reschedule form state
  const [rescheduleStartDate, setRescheduleStartDate] = useState("");
  const [rescheduleEndDate, setRescheduleEndDate] = useState("");
  const [rescheduleStartTime, setRescheduleStartTime] = useState("09:00");
  const [rescheduleEndTime, setRescheduleEndTime] = useState("17:00");
  const [rescheduleOpeningMeeting, setRescheduleOpeningMeeting] = useState("09:30 AM");
  const [rescheduleClosingMeeting, setRescheduleClosingMeeting] = useState("04:30 PM");
  const [rescheduleNotes, setRescheduleNotes] = useState("");

  // Target firm for modal form
  const modalTargetFirm = firms.find((f) => f.id === formFirmId) || currentFirm;

  // Staff assigned to target modal firm
  const modalFirmStaff = useMemo(() => {
    return users.filter(
      (u) =>
        u.companyId === modalTargetFirm.id ||
        u.companyName === modalTargetFirm.name ||
        u.role === "Auditor" ||
        u.role === "Audit Manager" ||
        u.role === "Company Admin"
    );
  }, [users, modalTargetFirm]);

  // Lead auditors eligible for modal target firm
  const eligibleLeadAuditors = useMemo(() => {
    const firmSpecific = users.filter(
      (u) =>
        (u.companyId === modalTargetFirm.id || u.companyName === modalTargetFirm.name) &&
        (u.role === "Auditor" || u.role === "Audit Manager" || u.role === "Company Admin")
    );
    if (firmSpecific.length > 0) return firmSpecific;
    // Fallback to auditors in system
    return users.filter((u) => u.role === "Auditor" || u.role === "Audit Manager");
  }, [users, modalTargetFirm]);

  // Templates maintained by modal target firm
  const modalFirmMaintainedTemplateIds = modalTargetFirm.maintainedTemplateIds || [];

  // Helper to toggle a template in formTemplateIds
  const toggleFormTemplate = (tmplId: string) => {
    setFormTemplateIds((prev) => {
      let updated: string[];
      if (prev.includes(tmplId)) {
        if (prev.length <= 1) {
          updated = [];
        } else {
          updated = prev.filter((id) => id !== tmplId);
        }
      } else {
        updated = [...prev, tmplId];
      }
      setFormTemplateId(updated[0] || "");
      const selTmpls = templates.filter((t) => updated.includes(t.id));
      const c = customers.find((x) => x.id === formCustomerId);
      if (selTmpls.length > 0 && c) {
        const standardsStr = selTmpls.map((t) => t.standard).join(" + ");
        setFormTitle(`${c.name} – ${modalTargetFirm.code} ${standardsStr} Surveillance Engagement`);
        setFormObjectives(`Verify continuous conformity with ${standardsStr} standards, assess management review records, and inspect physical operational controls.`);
      }
      return updated;
    });
  };

  // Helper to toggle lead auditor in formLeadAuditorIds
  const toggleFormLeadAuditor = (auditorId: string) => {
    setFormLeadAuditorIds((prev) => {
      let updated: string[];
      if (prev.includes(auditorId)) {
        updated = prev.filter((id) => id !== auditorId);
      } else {
        updated = [...prev, auditorId];
      }
      setFormLeadAuditorId(updated[0] || "");
      return updated;
    });
  };

  // Filtered audits based on firm selection:
  // An audit belongs to a firm if audit.firmId === firm.id OR
  // audit's lead auditor belongs to that firm.
  const firmAudits = useMemo(() => {
    return audits.filter((audit) => {
      if (activeFirmId === "ALL") return true;

      if (audit.firmId && audit.firmId === activeFirmId) return true;

      // Check if lead auditor belongs to current firm
      const auditor = users.find((u) => u.id === audit.leadAuditorId);
      if (auditor && (auditor.companyId === activeFirmId || auditor.companyName === currentFirm?.name)) {
        return true;
      }

      // Check if firm code matches audit title or auditNumber prefix
      if (currentFirm?.code && (audit.title.includes(currentFirm.code) || audit.auditNumber.includes(currentFirm.code))) {
        return true;
      }

      return false;
    });
  }, [audits, activeFirmId, currentFirm, users]);

  // Filtered by search & filters
  const filteredAudits = useMemo(() => {
    return firmAudits.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.auditNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.standard.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.leadAuditorName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || a.status === statusFilter;
      const matchesStandard = standardFilter === "ALL" || a.standard === standardFilter;

      return matchesSearch && matchesStatus && matchesStandard;
    });
  }, [firmAudits, searchQuery, statusFilter, standardFilter]);

  // Planning KPI counters for current firm
  const stats = useMemo(() => {
    const total = firmAudits.length;
    const confirmed = firmAudits.filter((a) => a.isScheduleConfirmed || a.status === "Scheduled").length;
    const inProgress = firmAudits.filter((a) => a.status === "In Progress").length;
    const draft = firmAudits.filter((a) => a.status === "Draft").length;
    const completed = firmAudits.filter((a) => a.status === "Completed" || a.status === "Closed").length;

    // Calculate total scheduled audit days
    let totalDays = 0;
    firmAudits.forEach((a) => {
      if (a.startDate && a.endDate) {
        const start = new Date(a.startDate).getTime();
        const end = new Date(a.endDate).getTime();
        const diff = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
        totalDays += diff;
      }
    });

    return { total, confirmed, inProgress, draft, completed, totalDays };
  }, [firmAudits]);

  // Open Create Plan modal pre-configured for firm
  const handleOpenCreatePlan = () => {
    setEditingAuditId(null);
    const targetFirm =
      activeFirmId === "ALL"
        ? firms.find((f) => f.id === "firm_cyber_guard" || f.name.includes("CyberGuard")) || currentFirm
        : currentFirm;
    setFormFirmId(targetFirm.id);
    const defaultCust = customers[0];
    setFormCustomerId(defaultCust ? defaultCust.id : "");
    setFormFacilityAddress(defaultCust ? defaultCust.address : "");

    // Maintained templates for this firm, or first 2 templates
    const firmTmpls = templates.filter((t) => targetFirm.maintainedTemplateIds?.includes(t.id));
    const initialTmpls = firmTmpls.length > 0 ? firmTmpls.slice(0, 2) : templates.slice(0, 2);
    const initialTmplIds = initialTmpls.map((t) => t.id);
    setFormTemplateIds(initialTmplIds);
    setFormTemplateId(initialTmplIds[0] || "");

    // Pick certified lead auditors for this firm
    const leads = eligibleLeadAuditors.slice(0, 2);
    const initialLeadIds = leads.map((u) => u.id);
    setFormLeadAuditorIds(initialLeadIds);
    setFormLeadAuditorId(initialLeadIds[0] || "");
    setFormTeamMembers(eligibleLeadAuditors.slice(2, 4).map((u) => u.name));

    const startDateObj = new Date();
    startDateObj.setDate(startDateObj.getDate() + 10);
    const sDate = startDateObj.toISOString().split("T")[0];
    const endDateObj = new Date();
    endDateObj.setDate(endDateObj.getDate() + 13);
    const eDate = endDateObj.toISOString().split("T")[0];

    setFormStartDate(sDate);
    setFormEndDate(eDate);
    setFormStartTime("09:00");
    setFormEndTime("17:30");
    setFormOpeningMeetingTime("09:30 AM");
    setFormClosingMeetingTime("04:30 PM");
    setFormLocationType("On-Site");
    setFormMeetingRoomOrLink("Executive Boardroom & Plant Bay 1");
    setFormAuditType("Surveillance");
    setFormRecurrence("Annual Surveillance");

    const custName = defaultCust ? defaultCust.name : "Enterprise Auditee";
    const standardsStr = initialTmpls.map((t) => t.standard).join(" + ") || "ISO 9001:2015";
    setFormTitle(`${custName} – ${targetFirm.code} ${standardsStr} Surveillance Engagement`);
    setFormScope("Headquarters Operational Controls, Manufacturing Line B, and Quality Assurance Archive");
    setFormObjectives(`Verify continuous conformity with ${standardsStr} standards, assess management review records, and inspect physical operational controls.`);
    setFormScheduleNotes("Safety shoes and ear protection mandatory on plant floor. Gowning induction scheduled 15 min prior to entrance.");

    setIsCreatePlanModalOpen(true);
  };

  // Open Edit Plan modal
  const handleOpenEditPlan = (audit: AuditPlan) => {
    setEditingAuditId(audit.id);
    setFormFirmId(audit.firmId || currentFirm.id);
    setFormCustomerId(audit.customerId);

    const tmplIds = (audit.templateIds && audit.templateIds.length > 0)
      ? audit.templateIds
      : [audit.templateId].filter(Boolean);
    setFormTemplateIds(tmplIds);
    setFormTemplateId(audit.templateId || tmplIds[0] || "");

    const leadIds = (audit.leadAuditorIds && audit.leadAuditorIds.length > 0)
      ? audit.leadAuditorIds
      : [audit.leadAuditorId].filter(Boolean);
    setFormLeadAuditorIds(leadIds);
    setFormLeadAuditorId(audit.leadAuditorId || leadIds[0] || "");

    setFormTitle(audit.title);
    setFormAuditType(audit.auditType);
    setFormRecurrence(audit.recurrence || "Annual Surveillance");
    setFormStartDate(audit.startDate);
    setFormEndDate(audit.endDate);
    setFormStartTime(audit.startTime || "09:00");
    setFormEndTime(audit.endTime || "17:30");
    setFormOpeningMeetingTime(audit.openingMeetingTime || "09:30 AM");
    setFormClosingMeetingTime(audit.closingMeetingTime || "04:30 PM");
    setFormLocationType(audit.locationType || "On-Site");
    setFormFacilityAddress(audit.facilityAddress || audit.location || "");
    setFormMeetingRoomOrLink(audit.meetingRoomOrLink || "");
    setFormTeamMembers(audit.auditTeam || []);
    setFormScope(audit.scope || "");
    setFormObjectives(audit.objectives || "");
    setFormScheduleNotes(audit.scheduleNotes || "");

    setIsCreatePlanModalOpen(true);
  };

  // Save audit plan (create or update)
  const handleSaveAuditPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === formCustomerId) || customers[0];
    const targetFirm = firms.find((f) => f.id === formFirmId) || currentFirm;

    // Resolved templates
    const selectedTemplates = templates.filter((t) => formTemplateIds.includes(t.id));
    const effectiveTemplates = selectedTemplates.length > 0 ? selectedTemplates : [templates[0]];
    const primaryTmpl = effectiveTemplates[0];
    const combinedStandards = effectiveTemplates.map((t) => t.standard).join(" / ");
    const combinedTemplateTitles = effectiveTemplates.map((t) => t.title).join(" & ");

    // Resolved lead auditors
    const selectedAuditors = users.filter((u) => formLeadAuditorIds.includes(u.id));
    const effectiveAuditors =
      selectedAuditors.length > 0
        ? selectedAuditors
        : (eligibleLeadAuditors[0] ? [eligibleLeadAuditors[0]] : [users[0]]);
    const primaryAuditor = effectiveAuditors[0];
    const combinedAuditorNames = effectiveAuditors.map((u) => u.name).join(", ");
    const teamList = [
      ...effectiveAuditors.map((u) => `${u.name} (Lead Auditor)`),
      ...formTeamMembers.filter((m) => !effectiveAuditors.some((u) => m.startsWith(u.name))),
    ];

    if (editingAuditId) {
      // Reschedule / update existing plan
      rescheduleAudit(editingAuditId, {
        title: formTitle.trim(),
        customerId: cust.id,
        customerName: cust.name,
        firmId: targetFirm.id,
        firmName: targetFirm.name,
        firmCode: targetFirm.code,
        templateId: primaryTmpl.id,
        templateTitle: combinedTemplateTitles,
        templateIds: effectiveTemplates.map((t) => t.id),
        templateTitles: effectiveTemplates.map((t) => t.title),
        standard: combinedStandards,
        auditType: formAuditType,
        recurrence: formRecurrence,
        startDate: formStartDate,
        endDate: formEndDate,
        startTime: formStartTime,
        endTime: formEndTime,
        openingMeetingTime: formOpeningMeetingTime,
        closingMeetingTime: formClosingMeetingTime,
        locationType: formLocationType,
        location: `${formLocationType} (${cust.name})`,
        facilityAddress: formFacilityAddress.trim(),
        meetingRoomOrLink: formMeetingRoomOrLink.trim(),
        leadAuditorId: primaryAuditor.id,
        leadAuditorName: combinedAuditorNames,
        leadAuditorIds: effectiveAuditors.map((u) => u.id),
        leadAuditorNames: effectiveAuditors.map((u) => u.name),
        auditTeam: teamList,
        scope: formScope.trim(),
        objectives: formObjectives.trim(),
        scheduleNotes: formScheduleNotes.trim(),
      });
    } else {
      // Create new audit plan under this firm
      createAudit({
        title: formTitle.trim(),
        customerId: cust.id,
        customerName: cust.name,
        firmId: targetFirm.id,
        firmName: targetFirm.name,
        firmCode: targetFirm.code,
        templateId: primaryTmpl.id,
        templateTitle: combinedTemplateTitles,
        templateIds: effectiveTemplates.map((t) => t.id),
        templateTitles: effectiveTemplates.map((t) => t.title),
        standard: combinedStandards,
        auditType: formAuditType,
        recurrence: formRecurrence,
        startDate: formStartDate,
        endDate: formEndDate,
        startTime: formStartTime,
        endTime: formEndTime,
        openingMeetingTime: formOpeningMeetingTime,
        closingMeetingTime: formClosingMeetingTime,
        locationType: formLocationType,
        location: `${formLocationType} (${cust.name})`,
        facilityAddress: formFacilityAddress.trim(),
        meetingRoomOrLink: formMeetingRoomOrLink.trim(),
        scheduleNotes: formScheduleNotes.trim(),
        isScheduleConfirmed: true,
        leadAuditorId: primaryAuditor.id,
        leadAuditorName: combinedAuditorNames,
        leadAuditorIds: effectiveAuditors.map((u) => u.id),
        leadAuditorNames: effectiveAuditors.map((u) => u.name),
        auditTeam: teamList,
        customerRepId: cust.contactPerson ? "cust_rep" : undefined,
        customerRepName: cust.contactPerson || undefined,
        status: "Scheduled",
        overallScore: 0,
        passingScore: primaryTmpl.passingScore || 80,
        scope: formScope.trim(),
        objectives: formObjectives.trim(),
      });
    }

    setIsCreatePlanModalOpen(false);
  };

  // Open quick reschedule modal
  const handleOpenReschedule = (audit: AuditPlan) => {
    setReschedulingAudit(audit);
    setRescheduleStartDate(audit.startDate);
    setRescheduleEndDate(audit.endDate);
    setRescheduleStartTime(audit.startTime || "09:00");
    setRescheduleEndTime(audit.endTime || "17:00");
    setRescheduleOpeningMeeting(audit.openingMeetingTime || "09:30 AM");
    setRescheduleClosingMeeting(audit.closingMeetingTime || "04:30 PM");
    setRescheduleNotes(audit.scheduleNotes || "");
    setIsRescheduleModalOpen(true);
  };

  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingAudit) return;

    rescheduleAudit(reschedulingAudit.id, {
      startDate: rescheduleStartDate,
      endDate: rescheduleEndDate,
      startTime: rescheduleStartTime,
      endTime: rescheduleEndTime,
      openingMeetingTime: rescheduleOpeningMeeting,
      closingMeetingTime: rescheduleClosingMeeting,
      scheduleNotes: rescheduleNotes,
      isScheduleConfirmed: true,
      status: "Scheduled",
    });

    setIsRescheduleModalOpen(false);
  };

  // Direct execute audit (render execution screen in place of planning screen)
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
      {/* ========================================================================= */}
      {/* AUDIT PLANNING TOOLBAR: SEARCH, FILTERS, VIEW MODES & FIRM (FIRM AT RIGHT END) */}
      {/* ========================================================================= */}
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

        {/* Filters, View Switcher & Firm Selector at Right End */}
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
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium max-w-[140px] truncate cursor-pointer"
            >
              <option value="ALL">All Standards</option>
              {Array.from(new Set(firmAudits.map((a) => a.standard))).map((std) => (
                <option key={std} value={std}>
                  {std}
                </option>
              ))}
            </select>
          </div>

          {/* Firm Select */}
          <div className="flex items-center gap-1.5 pl-1">
            <span className="text-xs font-bold text-slate-500">Firm:</span>
            <select
              value={activeFirmId}
              onChange={(e) => {
                const val = e.target.value;
                setActiveFirmId(val);
                if (val !== "ALL") {
                  const match = firms.find((f) => f.id === val);
                  if (match) onSelectFirm(match);
                }
              }}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-500 max-w-[180px] truncate cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Audit Firms ({firms.length})</option>
              {firms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.code})
                </option>
              ))}
            </select>
          </div>

          {/* View Switcher: Table and Grid at the Right End */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === "table" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table View"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === "cards" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* AUDIT PLANS LIST / CARDS */}
      {/* ========================================================================= */}
      {filteredAudits.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <CalendarCheck2 className="w-12 h-12 text-indigo-200 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">
            No audit plans found for {activeFirmId === "ALL" ? "the selected criteria" : currentFirm.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {currentFirm.name} maintains complete planning autonomy. Click below to schedule a new audit engagement under this firm&apos;s accredited scope.
          </p>
          <button
            onClick={handleOpenCreatePlan}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Plan for {currentFirm.code}</span>
          </button>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAudits.map((audit) => {
            const auditFirmObj = firms.find((f) => f.id === audit.firmId) || currentFirm;
            const isConfirmed = audit.isScheduleConfirmed || audit.status === "Scheduled";

            // Calculate duration
            const startDate = new Date(audit.startDate);
            const endDate = new Date(audit.endDate);
            const diffDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

            return (
              <div
                key={audit.id}
                className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Code, Standard, Status, Firm Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg">
                        {audit.auditNumber}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        {auditFirmObj.code}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                        {audit.auditType}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        audit.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : audit.status === "In Progress"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : audit.status === "Under Review"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {audit.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-black text-slate-900 mt-2.5 leading-snug line-clamp-2">
                    {audit.title}
                  </h3>

                  {/* Location and Schedule */}
                  <div className="mt-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-1.5 text-slate-600 truncate">
                    {audit.locationType === "Remote" ? (
                      <Video className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate">{audit.facilityAddress || audit.location || "Main Site"}</span>
                  </div>

                  {/* Schedule Details */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          {audit.startDate} → {audit.endDate}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          ({diffDays} days)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{audit.startTime || "09:00"} - {audit.endTime || "17:30"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>Opening: <strong className="text-slate-700">{audit.openingMeetingTime || "09:30 AM"}</strong></span>
                      <span>Closing: <strong className="text-slate-700">{audit.closingMeetingTime || "04:30 PM"}</strong></span>
                    </div>

                    {/* Lead Auditor Badge */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                          {audit.leadAuditorName?.charAt(0) || "L"}
                        </div>
                        <span className="text-xs font-semibold text-slate-700">
                          {audit.leadAuditorName || "Certified Auditor"}
                        </span>
                      </div>

                      {/* Confirmation Status */}
                      {isConfirmed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Schedule Confirmed</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => confirmSchedule(audit.id)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                        >
                          <Clock className="w-3 h-3" />
                          <span>Confirm Schedule</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedAuditForDossier(audit)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      title="View complete audit planning itinerary and milestone schedule"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Itinerary</span>
                    </button>

                    <button
                      onClick={() => handleOpenReschedule(audit)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      title="Reschedule audit engagement dates"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reschedule</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditPlan(audit)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit full plan details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => sendScheduleReminder(audit.id)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Send schedule notification reminder"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleLaunchAudit(audit.id)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                    >
                      <span>Execute</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
                  <th className="py-3 px-4">Lead Auditor</th>
                  <th className="py-3 px-4">Scheduled Dates</th>
                  <th className="py-3 px-4">Status</th>
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

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {audit.leadAuditorName}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {audit.startDate} → {audit.endDate}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            audit.status === "Completed"
                              ? "bg-emerald-50 text-emerald-700"
                              : audit.status === "In Progress"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {audit.status}
                        </span>
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
      {/* MODAL 1: CREATE / EDIT AUDIT PLAN */}
      {/* ========================================================================= */}
      {isCreatePlanModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl xl:max-w-6xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <CalendarCheck2 className="w-5 h-5 text-indigo-600" />
                  <span>
                    {editingAuditId ? "Maintain Audit Engagement Plan" : `Schedule New Audit Plan for ${modalTargetFirm.name}`}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Accredited Certification Body: <strong className="text-slate-800">{modalTargetFirm.name} ({modalTargetFirm.code})</strong> • Multi-Standard & Co-Auditor Architecture
                </p>
              </div>
              <button
                onClick={() => setIsCreatePlanModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAuditPlan} className="space-y-4">
              {/* Title & Audit Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Audit Engagement Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Apex Global Logistics – Annual ISO 9001 Surveillance"
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Audit Type / Stage *
                  </label>
                  <select
                    value={formAuditType}
                    onChange={(e) => setFormAuditType(e.target.value as AuditType)}
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="Certification">Initial Certification</option>
                    <option value="Surveillance">Annual Surveillance</option>
                    <option value="Recertification">Recertification</option>
                    <option value="Internal Quality">Internal Audit</option>
                    <option value="Supplier Audit">Supplier Audit</option>
                    <option value="Regulatory">Regulatory Inspection</option>
                  </select>
                </div>
              </div>

              {/* Multi-Select Certified Lead Auditor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Certified Lead Auditor ({modalTargetFirm.code}) * (Multi-Select)</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {formLeadAuditorIds.length} Selected
                  </span>
                </div>

                {/* Multi-Select Dropdown Trigger */}
                <div className="relative" ref={auditorDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAuditorDropdownOpen((prev) => !prev);
                      setIsFrameworkDropdownOpen(false);
                    }}
                    className="w-full min-h-[42px] px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-left flex items-center justify-between gap-2 hover:bg-slate-100/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                      {formLeadAuditorIds.length === 0 ? (
                        <span className="text-slate-400">Select certified lead auditors...</span>
                      ) : (
                        <span className="text-slate-800 font-semibold truncate">
                          {users
                            .filter((u) => formLeadAuditorIds.includes(u.id))
                            .map((u) => u.name)
                            .join(", ")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
                        {formLeadAuditorIds.length}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isAuditorDropdownOpen ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  {/* Dropdown Popover */}
                  {isAuditorDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-3 space-y-2 max-h-72 overflow-y-auto">
                      {/* Search inside dropdown */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search certified auditor by name, role..."
                          value={auditorSearchQuery}
                          onChange={(e) => setAuditorSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      {/* Quick select buttons */}
                      <div className="flex items-center justify-between pt-1 pb-1 border-b border-slate-100 text-[11px]">
                        <span className="text-slate-500 font-medium">Eligible Auditors under {modalTargetFirm.code}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormLeadAuditorIds([]);
                            setFormLeadAuditorId("");
                          }}
                          className="text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                        >
                          Clear All
                        </button>
                      </div>

                      {/* Options list */}
                      <div className="space-y-1">
                        {eligibleLeadAuditors
                          .filter((u) => {
                            if (!auditorSearchQuery) return true;
                            return (
                              u.name.toLowerCase().includes(auditorSearchQuery.toLowerCase()) ||
                              u.role.toLowerCase().includes(auditorSearchQuery.toLowerCase()) ||
                              (u.department && u.department.toLowerCase().includes(auditorSearchQuery.toLowerCase()))
                            );
                          })
                          .map((u) => {
                            const isSelected = formLeadAuditorIds.includes(u.id);
                            return (
                              <div
                                key={u.id}
                                onClick={() => toggleFormLeadAuditor(u.id)}
                                className={`p-2 rounded-lg flex items-center gap-2.5 cursor-pointer transition-colors ${
                                  isSelected ? "bg-emerald-50/80 border border-emerald-200" : "hover:bg-slate-50 border border-transparent"
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded flex items-center justify-center text-xs shrink-0 border ${
                                    isSelected
                                      ? "bg-emerald-600 border-emerald-600 text-white"
                                      : "border-slate-300 bg-white"
                                  }`}
                                >
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <img
                                  src={u.avatar}
                                  alt={u.name}
                                  className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-xs text-slate-900">{u.name}</span>
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                                      {u.role}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-400 truncate">
                                    {u.department || modalTargetFirm.name} • {u.companyName || modalTargetFirm.name}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates and Times */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Opening Meeting
                  </label>
                  <input
                    type="text"
                    value={formOpeningMeetingTime}
                    onChange={(e) => setFormOpeningMeetingTime(e.target.value)}
                    placeholder="09:30 AM"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Closing Meeting
                  </label>
                  <input
                    type="text"
                    value={formClosingMeetingTime}
                    onChange={(e) => setFormClosingMeetingTime(e.target.value)}
                    placeholder="04:30 PM"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              {/* Location and Logistics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Location Type
                  </label>
                  <select
                    value={formLocationType}
                    onChange={(e) => setFormLocationType(e.target.value as LocationType)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="On-Site">On-Site Audit</option>
                    <option value="Hybrid">Hybrid (On-Site & Remote)</option>
                    <option value="Remote">Remote Virtual Audit</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Facility Address / Meeting Link *
                  </label>
                  <input
                    type="text"
                    required
                    value={formFacilityAddress}
                    onChange={(e) => setFormFacilityAddress(e.target.value)}
                    placeholder="e.g. 12 Marina Boulevard, Jurong Hub 3, Singapore"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              {/* Scope & Objectives */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Audit Scope Statement
                  </label>
                  <textarea
                    rows={2}
                    value={formScope}
                    onChange={(e) => setFormScope(e.target.value)}
                    placeholder="Areas, departments, processes included in audit scope..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Audit Objectives
                  </label>
                  <textarea
                    rows={2}
                    value={formObjectives}
                    onChange={(e) => setFormObjectives(e.target.value)}
                    placeholder="Key assessment goals, compliance thresholds, and deliverables..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Special Logistics & Safety Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Safety Inductions / Site Entry Requirements
                </label>
                <input
                  type="text"
                  value={formScheduleNotes}
                  onChange={(e) => setFormScheduleNotes(e.target.value)}
                  placeholder="e.g. Cleanroom gowning qualification required. Safety shoes & ear protection required for plant tours."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Managing Body: <strong className="text-slate-800">{modalTargetFirm.code}</strong> • Accreditation Active
                </span>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsCreatePlanModalOpen(false)}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{editingAuditId ? "Update Plan" : `Save & Schedule under ${modalTargetFirm.code}`}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: QUICK RESCHEDULE MODAL */}
      {/* ========================================================================= */}
      {isRescheduleModalOpen && reschedulingAudit && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <span>Reschedule Audit Engagement</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {reschedulingAudit.auditNumber} • {reschedulingAudit.customerName}
                </p>
              </div>
              <button
                onClick={() => setIsRescheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReschedule} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={rescheduleStartDate}
                    onChange={(e) => setRescheduleStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={rescheduleEndDate}
                    onChange={(e) => setRescheduleEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Opening Meeting
                  </label>
                  <input
                    type="text"
                    value={rescheduleOpeningMeeting}
                    onChange={(e) => setRescheduleOpeningMeeting(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Closing Meeting
                  </label>
                  <input
                    type="text"
                    value={rescheduleClosingMeeting}
                    onChange={(e) => setRescheduleClosingMeeting(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reschedule Justification / Notes
                </label>
                <textarea
                  rows={2}
                  value={rescheduleNotes}
                  onChange={(e) => setRescheduleNotes(e.target.value)}
                  placeholder="Reason for schedule adjustment (e.g. auditee turnaround, auditor availability)..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsRescheduleModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Confirm New Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: FULL AUDIT PLANNING DOSSIER & ITINERARY */}
      {/* ========================================================================= */}
      {selectedAuditForDossier && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl xl:max-w-6xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                  {currentFirm.code.split("-")[0]}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Official Audit Engagement Plan & Itinerary
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Audit Ref: <strong className="font-mono text-indigo-700">{selectedAuditForDossier.auditNumber}</strong> • {currentFirm.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAuditForDossier(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Body */}
            <div className="space-y-4 text-xs">
              {/* Engagement Overview Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-black text-sm text-slate-900 leading-snug">
                    {selectedAuditForDossier.title}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                    {selectedAuditForDossier.auditType}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-[11px] flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Lead Auditor</span>
                    <strong className="text-slate-800">{selectedAuditForDossier.leadAuditorName}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Engagement Status</span>
                    <strong className="text-emerald-700">{selectedAuditForDossier.status}</strong>
                  </div>
                </div>
              </div>

              {/* Schedule & Logistics */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Timeline & Daily Session Schedule</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Dates:</span>
                    <span className="font-bold text-slate-800">
                      {selectedAuditForDossier.startDate} to {selectedAuditForDossier.endDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Opening Meeting:</span>
                    <span className="font-bold text-slate-800">
                      {selectedAuditForDossier.openingMeetingTime || "09:30 AM"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Closing Meeting:</span>
                    <span className="font-bold text-slate-800">
                      {selectedAuditForDossier.closingMeetingTime || "04:30 PM"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 pt-1 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Location: {selectedAuditForDossier.facilityAddress || selectedAuditForDossier.location}</span>
                </div>
              </div>

              {/* Scope and Objectives */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">Scope of Assessment</span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {selectedAuditForDossier.scope || "Operational units, facilities, and processes governed by the standard."}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">Audit Objectives</span>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {selectedAuditForDossier.objectives || "Assess compliance, verify statutory records, and identify non-conformities."}
                  </p>
                </div>
              </div>

              {/* Sample Daily Agenda Milestones */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">Engagement Execution Itinerary</span>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-lg">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-black rounded text-[10px]">
                      Day 1
                    </span>
                    <div>
                      <div className="font-bold text-slate-800">
                        Opening Conference & Management Governance Review
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        Opening meeting at {selectedAuditForDossier.openingMeetingTime || "09:30 AM"}. Quality policy review, organigram inspection, risk register review.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-lg">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-black rounded text-[10px]">
                      Day 2
                    </span>
                    <div>
                      <div className="font-bold text-slate-800">
                        Operational Walkthrough & Objective Evidence Verification
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        Physical walkthrough of facility floors, equipment calibration log inspection, operator interviews, and process traceability checks.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 bg-slate-50 rounded-lg">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-black rounded text-[10px]">
                      Day 3
                    </span>
                    <div>
                      <div className="font-bold text-slate-800">
                        Findings Consolidation & Formal Exit Conference
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        Lead auditor synthesis of non-conformances (NCRs/OFIs). Formal closing conference at {selectedAuditForDossier.closingMeetingTime || "04:30 PM"} with executive team.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Safety & Protocol notes */}
              {selectedAuditForDossier.scheduleNotes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Safety & Entry Inductions:</strong>
                    <span>{selectedAuditForDossier.scheduleNotes}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Dossier Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Dossier</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setSelectedAuditForDossier(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleLaunchAudit(selectedAuditForDossier.id);
                    setSelectedAuditForDossier(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Launch Execution</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
