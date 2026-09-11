"use client";

import React, { useState } from "react";
import { useAudit } from "../../shared/context/AuditContext";
import { User, UserRole, AuditFirm, AuditTemplate } from "../../shared/types/audit";
import {
  Building2,
  Users,
  Plus,
  Search,
  ShieldCheck,
  Mail,
  Award,
  CheckCircle2,
  X,
  Edit3,
  Trash2,
  UserPlus,
  Filter,
  FileCheck,
  FileSpreadsheet,
  ExternalLink,
  Briefcase,
  MapPin,
  LayoutGrid,
  List,
  Table,
  CalendarCheck2,
  Loader2,
} from "lucide-react";
import { FirmModal } from "./FirmModal";
import { FirmTableView } from "./FirmTableView";
import { FirmGridView } from "./FirmGridView";
import { FirmDetailScreen } from "./FirmDetailScreen";
import { AddStaffModal } from "./firm-detail/AddStaffModal";
import { FirmAuditPlanningTab } from "../audit-planning/FirmAuditPlanningTab";

export const CompanyAdminView: React.FC = () => {
  const {
    users,
    addUser,
    updateUser,
    deleteUser,
    firms,
    selectedFirmId,
    setSelectedFirmId,
    selectedFirm,
    addFirm,
    updateFirm,
    deleteFirm,
    toggleFirmTemplate,
    templates,
    addTemplate,
    currentUser,
    customers,
    audits,
    companyAdminSubTab,
    setCompanyAdminSubTab,
    isLoading,
    isFirmsLoading,
    isTemplatesLoading,
    successMessage,
    errorMessage,
    clearMessage,
  } = useAudit();

  // Sub-tabs: "firms" (Default), "template-firm", "planning", "perform"
  const activeSubTab = companyAdminSubTab || "firms";
  const setActiveSubTab = setCompanyAdminSubTab;

  // Detailed firm view screen state (opens new screen, not a new tab)
  const [detailedFirmId, setDetailedFirmId] = useState<string | null>(null);

  // View mode for audit firms: Table or Grid view (default: Table)
  const [firmViewMode, setFirmViewMode] = useState<"grid" | "table">("table");

  // View mode for firm maintained templates: Table or Grid view (default: Table)
  const [templateViewMode, setTemplateViewMode] = useState<"grid" | "table">("table");

  // Filter & Search states
  const [firmSearchQuery, setFirmSearchQuery] = useState("");
  const [firmStatusFilter, setFirmStatusFilter] = useState<string>("All");
  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>("All");
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");

  // Firm Add / Edit Modal
  const [isFirmModalOpen, setIsFirmModalOpen] = useState(false);
  const [editingFirm, setEditingFirm] = useState<AuditFirm | null>(null);

  // Add / Edit User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userStaffFirmId, setUserStaffFirmId] = useState<string>(selectedFirm.id);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("Auditor");
  const [userDepartment, setUserDepartment] = useState("Quality & Compliance");
  const [userPhone, setUserPhone] = useState("");
  const [userStatus, setUserStatus] = useState<"Active" | "Inactive">("Active");

  // Link / New Template to Firm Modal State
  const [isLinkTemplateModalOpen, setIsLinkTemplateModalOpen] = useState(false);
  const [templateFilterCategory, setTemplateFilterCategory] = useState("All");
  const [modalTemplateFirmId, setModalTemplateFirmId] = useState<string>(selectedFirm.id);
  const [templateModalTab, setTemplateModalTab] = useState<"library" | "custom" | "maintained">("library");

  // Custom template form state
  const [newCustomTitle, setNewCustomTitle] = useState("");
  const [newCustomStandard, setNewCustomStandard] = useState("");
  const [newCustomIndustry, setNewCustomIndustry] = useState("Quality & Compliance");
  const [newCustomPassingScore, setNewCustomPassingScore] = useState(80);
  const [newCustomSections, setNewCustomSections] = useState<
    Array<{ id: string; title: string; questions: Array<{ id: string; requirementId: string; question: string }> }>
  >([
    {
      id: "sec_1",
      title: "Section 1: General & Management Governance",
      questions: [
        { id: "q_1_1", requirementId: "1.1", question: "Is the management policy and quality manual documented and communicated?" },
        { id: "q_1_2", requirementId: "1.2", question: "Are operational procedures periodically reviewed with objective verification records?" },
      ],
    },
  ]);

  // Handle opening firm detailed screen
  const handleOpenFirmDetail = (firmId: string) => {
    setDetailedFirmId(firmId);
    setSelectedFirmId(firmId);
  };

  // Open modal to add a new firm
  const openAddFirmModal = () => {
    setEditingFirm(null);
    setIsFirmModalOpen(true);
  };

  // Open modal to edit an existing firm
  const openEditFirmModal = (firm: AuditFirm, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingFirm(firm);
    setIsFirmModalOpen(true);
  };

  // Save Firm (Add or Edit in Supabase)
  const handleSaveFirm = async (
    firmData: Omit<AuditFirm, "id" | "createdAt">,
    editingId?: string
  ) => {
    try {
      if (editingId) {
        await updateFirm(editingId, firmData);
      } else {
        const newFirmId = await addFirm(firmData);
        if (newFirmId) {
          setSelectedFirmId(newFirmId);
        }
      }
    } catch (err) {
      console.error("Failed to save firm:", err);
    }
  };

  // Delete Firm from Supabase
  const handleDeleteFirm = async (firmId: string, firmName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (firms.length <= 1) {
      alert("At least one active audit firm must remain in the platform.");
      return;
    }
    if (
      confirm(
        `Are you sure you want to delete audit firm "${firmName}"? All associated firm configurations will be removed.`
      )
    ) {
      try {
        await deleteFirm(firmId);
        if (detailedFirmId === firmId) {
          setDetailedFirmId(null);
        }
      } catch (err) {
        console.error("Failed to delete firm:", err);
      }
    }
  };

  // Open user modal
  const openAddUserModal = (defaultFirmId?: string) => {
    setEditingUserId(null);
    setUserStaffFirmId(defaultFirmId || selectedFirm.id);
    setUserName("");
    setUserEmail("");
    setUserRole("Auditor");
    setUserDepartment("Quality Assurance & Audit Operations");
    setUserPhone("+1 (555) 0122");
    setUserStatus("Active");
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (u: User) => {
    setEditingUserId(u.id);
    const firmMatch = firms.find((f) => f.id === u.companyId || f.name === u.companyName);
    setUserStaffFirmId(firmMatch ? firmMatch.id : selectedFirm.id);
    setUserName(u.name);
    setUserEmail(u.email);
    setUserRole(u.role);
    setUserDepartment(u.department || "Quality & Compliance");
    setUserPhone(u.phone || "");
    setUserStatus(u.status || "Active");
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    const targetFirm = firms.find((f) => f.id === userStaffFirmId) || selectedFirm;

    if (editingUserId) {
      updateUser(editingUserId, {
        name: userName.trim(),
        email: userEmail.trim(),
        role: userRole,
        companyName: targetFirm.name,
        companyId: targetFirm.id,
        department: userDepartment.trim(),
        phone: userPhone.trim(),
        status: userStatus,
      });
    } else {
      addUser({
        name: userName.trim(),
        email: userEmail.trim(),
        role: userRole,
        companyName: targetFirm.name,
        companyId: targetFirm.id,
        department: userDepartment.trim(),
        phone: userPhone.trim(),
        status: userStatus,
        avatar: `https://images.unsplash.com/photo-${
          1534528741775 + Math.floor(Math.random() * 10000)
        }?w=150&auto=format&fit=crop&q=80`,
        isCustomerUser: false,
      });
    }

    setIsUserModalOpen(false);
  };

  const handleDeleteUser = (userId: string, memberName: string) => {
    if (confirm(`Are you sure you want to remove team member "${memberName}"?`)) {
      deleteUser(userId);
    }
  };

  // Filtered firms
  const filteredFirms = firms.filter((firm) => {
    const matchesSearch =
      firm.name.toLowerCase().includes(firmSearchQuery.toLowerCase()) ||
      firm.code.toLowerCase().includes(firmSearchQuery.toLowerCase()) ||
      (firm.accreditationNumber &&
        firm.accreditationNumber.toLowerCase().includes(firmSearchQuery.toLowerCase())) ||
      (firm.accreditationStandard &&
        firm.accreditationStandard.toLowerCase().includes(firmSearchQuery.toLowerCase())) ||
      (firm.industryScope &&
        firm.industryScope.toLowerCase().includes(firmSearchQuery.toLowerCase()));

    const matchesStatus =
      firmStatusFilter === "All" || firm.status === firmStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filtered staff scoped to active firm
  const firmStaffMembers = selectedFirm.assignedStaff || users.filter(
    (u) => u.companyId === selectedFirm.id || u.companyName === selectedFirm.name
  );

  const filteredFirmStaff = firmStaffMembers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(staffSearchQuery.toLowerCase()));
    const matchesRole = staffRoleFilter === "All" || u.role === staffRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtered templates maintained by selected firm (main view tab)
  const maintainedTemplateIds = selectedFirm.maintainedTemplateIds || [];
  const firmMaintainedTemplates = templates.filter((t) =>
    maintainedTemplateIds.includes(t.id)
  );

  // Modal template firm computations (supports selecting any firm inside the modal, e.g. PharmaBio Global Audits)
  const activeModalTemplateFirm =
    firms.find((f) => f.id === modalTemplateFirmId) || selectedFirm;
  const activeModalFirmMaintainedIds =
    activeModalTemplateFirm.maintainedTemplateIds || [];

  const activeModalFirmMaintainedTemplates = templates.filter((t) =>
    activeModalFirmMaintainedIds.includes(t.id)
  );

  const activeModalFirmAvailableTemplates = templates.filter(
    (t) => !activeModalFirmMaintainedIds.includes(t.id)
  );

  const filteredModalAvailableTemplates = activeModalFirmAvailableTemplates.filter(
    (t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        t.standard.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        t.industry.toLowerCase().includes(templateSearchQuery.toLowerCase());
      const matchesCat =
        templateFilterCategory === "All" ||
        t.industry.toLowerCase().includes(templateFilterCategory.toLowerCase());
      return matchesSearch && matchesCat;
    }
  );

  const filteredModalMaintainedTemplates = activeModalFirmMaintainedTemplates.filter(
    (t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        t.standard.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
        t.industry.toLowerCase().includes(templateSearchQuery.toLowerCase());
      const matchesCat =
        templateFilterCategory === "All" ||
        t.industry.toLowerCase().includes(templateFilterCategory.toLowerCase());
      return matchesSearch && matchesCat;
    }
  );

  // Active staff firm object for staff modal
  const selectedStaffFirm =
    firms.find((f) => f.id === userStaffFirmId) || selectedFirm;

  const [isExecutingAudit, setIsExecutingAudit] = useState(false);
  const isFullScreenView = isExecutingAudit || !!detailedFirmId;

  return (
    <div className={isExecutingAudit || detailedFirmId ? "w-full p-0 space-y-0" : "w-full p-4 sm:p-5 space-y-4"}>
      {/* Top Header */}
      {!isFullScreenView && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
          <p className="text-xs text-slate-500 font-normal">
            Manage accredited audit bodies, corporate accreditation credentials, firm-based staff roster, and maintained audit templates.
          </p>
        </div>
      )}

      {/* Sub Navigation Tabs:
          1. Audit Firms
          2. Template Firm
          3. Audit Planning
      */}
      {!isFullScreenView && (
        <div className="flex items-center justify-between border-b border-slate-200 gap-4">
          <div className="flex items-center gap-3 overflow-x-auto">
            <button
              onClick={() => {
                setActiveSubTab("firms");
              }}
              className={`pb-3 px-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-b-2 whitespace-nowrap ${
                activeSubTab === "firms"
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>Audit Firms ({firms.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveSubTab("template-firm");
                setDetailedFirmId(null);
              }}
              className={`pb-3 px-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-b-2 whitespace-nowrap ${
                activeSubTab === "template-firm"
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Template Firm ({firmMaintainedTemplates.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveSubTab("planning");
                setDetailedFirmId(null);
              }}
              className={`pb-3 px-2 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-b-2 whitespace-nowrap ${
                activeSubTab === "planning"
                  ? "border-teal-600 text-teal-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Audit Planning ({audits.length})</span>
            </button>
          </div>

          {activeSubTab === "firms" && !detailedFirmId && (
            <button
              onClick={openAddFirmModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer mb-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Firm</span>
            </button>
          )}

          {activeSubTab === "template-firm" && (
            <button
              onClick={() => {
                setModalTemplateFirmId(selectedFirm.id);
                setTemplateModalTab("library");
                setIsLinkTemplateModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer mb-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Template</span>
            </button>
          )}
        </div>
      )}

      {/* Global Alert Notification Banner (Success & Error Messages) */}
      {!isFullScreenView && successMessage && (
        <div className="flex items-center justify-between p-3.5 bg-emerald-50/95 border border-emerald-200 text-emerald-900 rounded-2xl shadow-xs animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-800">{successMessage}</p>
            </div>
          </div>
          <button
            onClick={clearMessage}
            className="text-emerald-500 hover:text-emerald-800 p-1 rounded-lg transition-colors cursor-pointer"
            title="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!isFullScreenView && errorMessage && (
        <div className="flex items-center justify-between p-3.5 bg-rose-50/95 border border-rose-200 text-rose-900 rounded-2xl shadow-xs animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-600 shrink-0">
              <X className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-800">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={clearMessage}
            className="text-rose-500 hover:text-rose-800 p-1 rounded-lg transition-colors cursor-pointer"
            title="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: AUDIT FIRMS (Master-Detail: List/Grid/Table View & Detailed View Screen) */}
      {/* ========================================================================= */}
      {activeSubTab === "firms" && (
        <>
          {/* If a firm is selected for detailed screen: open new screen for detailed view */}
          {detailedFirmId ? (
            <FirmDetailScreen
              firmId={detailedFirmId}
              onBack={() => setDetailedFirmId(null)}
              onSelectAnotherFirm={(id) => {
                setDetailedFirmId(id);
                setSelectedFirmId(id);
              }}
            />
          ) : (
            <div className="space-y-4">
              {/* Controls Toolbar: Search, Filter, View Mode Toggle, and Add Firm */}
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                {/* Search Bar */}
                <div className="relative w-full sm:w-88">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search firm by name, code, standard..."
                    value={firmSearchQuery}
                    onChange={(e) => setFirmSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50/70 border border-slate-200/90 rounded-2xl focus:outline-none focus:border-teal-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Status Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={firmStatusFilter}
                      onChange={(e) => setFirmStatusFilter(e.target.value)}
                      className="px-3 py-2 text-xs bg-slate-50/70 border border-slate-200/90 rounded-xl focus:outline-none focus:border-teal-500 font-medium text-slate-700 cursor-pointer"
                    >
                      <option value="All">All Statuses ({firms.length})</option>
                      <option value="Active">Active</option>
                      <option value="Pending Accreditation">Pending Accreditation</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>

                  {/* Table and Grid View Switcher (Icon Only) */}
                  <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 shrink-0">
                    <button
                      onClick={() => setFirmViewMode("table")}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        firmViewMode === "table"
                          ? "bg-white text-teal-700 shadow-2xs"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                      title="Table View"
                    >
                      <Table className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setFirmViewMode("grid")}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        firmViewMode === "grid"
                          ? "bg-white text-teal-700 shadow-2xs"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                      title="Card Grid View"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Render Loading Skeleton or Grid/Table View */}
              {isFirmsLoading ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-xs">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 animate-pulse">
                    <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Loading Audit Firms...</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Fetching audit organizations and user accreditation links from Supabase database.
                  </p>
                </div>
              ) : firmViewMode === "grid" ? (
                <FirmGridView
                  firms={filteredFirms}
                  users={users}
                  templates={templates}
                  selectedFirmId={selectedFirm.id}
                  onSelectFirm={handleOpenFirmDetail}
                  onEditFirm={openEditFirmModal}
                  onDeleteFirm={handleDeleteFirm}
                />
              ) : (
                <FirmTableView
                  firms={filteredFirms}
                  users={users}
                  templates={templates}
                  selectedFirmId={selectedFirm.id}
                  onSelectFirm={handleOpenFirmDetail}
                  onEditFirm={openEditFirmModal}
                  onDeleteFirm={handleDeleteFirm}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TEMPLATE FIRM (Maintained Compliance Templates)                    */}
      {/* ========================================================================= */}
      {activeSubTab === "template-firm" && (
        <div className="space-y-4">
          {/* Controls: Search, Firm Selector, and View Mode Toggle */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search templates, standards, frameworks..."
                value={templateSearchQuery}
                onChange={(e) => setTemplateSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {/* Category / Industry Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={templateFilterCategory}
                  onChange={(e) => setTemplateFilterCategory(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
                >
                  <option value="All">All Frameworks</option>
                  <option value="ISO">ISO Standards</option>
                  <option value="Security">Security & Privacy</option>
                  <option value="Health">Healthcare & Life Sciences</option>
                  <option value="Finance">Financial Services</option>
                </select>
              </div>

              {/* View Switcher (Icon Only) */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                <button
                  onClick={() => setTemplateViewMode("table")}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    templateViewMode === "table"
                      ? "bg-white text-indigo-600 shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  title="Table View"
                >
                  <Table className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTemplateViewMode("grid")}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    templateViewMode === "grid"
                      ? "bg-white text-indigo-600 shadow-2xs font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Templates Display (List / Grid / Table) */}
          {(() => {
            if (isTemplatesLoading || isFirmsLoading) {
              return (
                <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-xs">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 animate-pulse">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Loading Maintained Templates...</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Fetching active compliance standards linked to {selectedFirm.name}.
                  </p>
                </div>
              );
            }

            const filteredMaintainedTemplates = firmMaintainedTemplates.filter((t) =>
              t.title.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
              t.standard.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
              t.industry.toLowerCase().includes(templateSearchQuery.toLowerCase())
            );

            if (filteredMaintainedTemplates.length === 0) {
              return (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
                  <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-700">No Templates Found</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {firmMaintainedTemplates.length === 0
                      ? `${selectedFirm.name} has not linked any official audit standards to its repertoire.`
                      : "No maintained standards match your search query."}
                  </p>
                  <button
                    onClick={() => {
                      setModalTemplateFirmId(selectedFirm.id);
                      setIsLinkTemplateModalOpen(true);
                    }}
                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Maintain Official Standard</span>
                  </button>
                </div>
              );
            }

            if (templateViewMode === "table") {
              return (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          <th className="py-3 px-4">Standard Code</th>
                          <th className="py-3 px-4">Template Title</th>
                          <th className="py-3 px-4">Industry Scope</th>
                          <th className="py-3 px-4">Clauses / Sections</th>
                          <th className="py-3 px-4">Passing Score</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {filteredMaintainedTemplates.map((tmpl) => {
                          const totalQuestions = tmpl.sections.reduce(
                            (acc, s) => acc + s.questions.length,
                            0
                          );

                          return (
                            <tr key={tmpl.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3 px-4 font-mono font-black text-indigo-700">
                                {tmpl.standard}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-slate-900">
                                {tmpl.title}
                              </td>
                              <td className="py-3 px-4 text-slate-600">
                                <span className="px-2 py-0.5 bg-slate-100 rounded-md font-medium text-slate-700">
                                  {tmpl.industry}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-600 font-semibold">
                                {tmpl.sections.length} Sec ({totalQuestions} Clauses)
                              </td>
                              <td className="py-3 px-4 font-bold text-emerald-600">
                                {tmpl.passingScore}%
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Maintained</span>
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => toggleFirmTemplate(selectedFirm.id, tmpl.id)}
                                  className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }

            // Default: Grid View
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMaintainedTemplates.map((tmpl) => {
                  const totalQuestions = tmpl.sections.reduce(
                    (acc, s) => acc + s.questions.length,
                    0
                  );

                  return (
                    <div
                      key={tmpl.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-[11px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                            {tmpl.standard}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Maintained</span>
                          </span>
                        </div>

                        <h4 className="font-extrabold text-sm text-slate-900 mt-2.5">
                          {tmpl.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {tmpl.description}
                        </p>

                        <div className="mt-4 grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Clauses / Sections</span>
                            <span className="font-bold text-slate-800">
                              {tmpl.sections.length} Sec ({totalQuestions} Clauses)
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Passing Score</span>
                            <span className="font-bold text-emerald-600">{tmpl.passingScore}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                          {tmpl.industry}
                        </span>
                        <button
                          onClick={() => toggleFirmTemplate(selectedFirm.id, tmpl.id)}
                          className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Remove from Firm
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: AUDIT PLANNING (Firm-based Full Planning) */}
      {/* ========================================================================= */}
      {activeSubTab === "planning" && (
        <FirmAuditPlanningTab
          selectedFirm={selectedFirm}
          onSelectFirm={(f) => setSelectedFirmId(f.id)}
          onOpenFirmDetail={(id) => {
            setDetailedFirmId(id);
            setActiveSubTab("firms");
          }}
          onExecutingChange={setIsExecutingAudit}
        />
      )}

      {/* Firm Modal (Add & Edit) */}
      <FirmModal
        isOpen={isFirmModalOpen}
        onClose={() => {
          setIsFirmModalOpen(false);
          setEditingFirm(null);
        }}
        onSave={handleSaveFirm}
        editingFirm={editingFirm}
      />

      {/* Link / New Template Modal */}
      {isLinkTemplateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[94vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs shrink-0">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg sm:text-xl">
                    New Template & Standards Provisioning
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Link official compliance frameworks from default library or create a custom template for the firm.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLinkTemplateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Choose Firm Selector */}
            <div className="flex items-center gap-3">
              <label className="text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">
                Choose Firm:
              </label>
              <select
                value={activeModalTemplateFirm.id}
                onChange={(e) => {
                  setModalTemplateFirmId(e.target.value);
                  setSelectedFirmId(e.target.value);
                }}
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white shadow-2xs cursor-pointer"
              >
                {firms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Modal Tabs: Default Library vs Create Custom Template vs Currently Maintained */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
              <button
                onClick={() => setTemplateModalTab("library")}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  templateModalTab === "library"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Default Template Library ({filteredModalAvailableTemplates.length})
              </button>
              <button
                onClick={() => setTemplateModalTab("custom")}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  templateModalTab === "custom"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                + Create New Custom Template
              </button>
              <button
                onClick={() => setTemplateModalTab("maintained")}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  templateModalTab === "maintained"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Currently Maintained ({filteredModalMaintainedTemplates.length})
              </button>
            </div>

            {/* TAB 1: Default Library Standards */}
            {templateModalTab === "library" && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search standards (ISO 9001, 27001, WHO GMP, SOC 2, ISO 14001, ISO 13485)..."
                    value={templateSearchQuery}
                    onChange={(e) => setTemplateSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-900"
                  />
                </div>

                <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1.5">
                  {filteredModalAvailableTemplates.length === 0 ? (
                    <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs sm:text-sm font-medium">
                      All library standards are already maintained by {activeModalTemplateFirm.name}, or no standards match your search query.
                    </div>
                  ) : (
                    filteredModalAvailableTemplates.map((t) => {
                      const questionsCount = t.sections.reduce(
                        (acc, s) => acc + s.questions.length,
                        0
                      );
                      return (
                        <div
                          key={t.id}
                          className="p-4 bg-slate-50/80 hover:bg-indigo-50/50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="font-mono text-xs font-bold text-indigo-700 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg shadow-2xs">
                                {t.standard}
                              </span>
                              <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                                {t.title}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-2.5 flex-wrap font-medium">
                              <span className="text-slate-700 font-semibold">{t.industry}</span>
                              <span>•</span>
                              <span>{t.sections.length} Sections ({questionsCount} Clauses)</span>
                              <span>•</span>
                              <span>Passing Score: <strong className="text-emerald-700 font-bold">{t.passingScore}%</strong></span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              toggleFirmTemplate(activeModalTemplateFirm.id, t.id);
                            }}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs shadow-indigo-100 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Link to Firm</span>
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Create Brand New Custom Template */}
            {templateModalTab === "custom" && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newCustomTitle.trim() || !newCustomStandard.trim()) return;

                  const newTemplateId = await addTemplate({
                    title: newCustomTitle.trim(),
                    code: `TMPL-${Date.now()}`,
                    version: "1.0",
                    standard: newCustomStandard.trim(),
                    industry: newCustomIndustry.trim(),
                    description: `Custom compliance template provisioned for ${activeModalTemplateFirm.name}`,
                    sections: newCustomSections.map((s) => ({
                      id: s.id,
                      title: s.title,
                      description: "",
                      weight: 100,
                      questions: s.questions.map((q) => ({
                        id: q.id,
                        requirementId: q.requirementId,
                        question: q.question,
                        guidance: "Verify objective documentary evidence and operational records.",
                        scoringType: "PASS_FAIL" as const,
                        weight: 10,
                        mandatory: false,
                      })),
                    })),
                    passingScore: newCustomPassingScore,
                    isCustom: true,
                    tags: ["Custom", newCustomStandard.trim(), activeModalTemplateFirm.code],
                  });

                  if (typeof newTemplateId === "string") {
                    toggleFirmTemplate(activeModalTemplateFirm.id, newTemplateId);
                  }
                  setNewCustomTitle("");
                  setNewCustomStandard("");
                  setTemplateModalTab("maintained");
                }}
                className="space-y-4 max-h-[55vh] overflow-y-auto pr-1.5"
              >
                {/* Top Form Fields */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Template Title *
                    </label>
                    <input
                      type="text"
                      value={newCustomTitle}
                      onChange={(e) => setNewCustomTitle(e.target.value)}
                      placeholder="e.g. Supply Chain Quality & Information Security Standard"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Standard Code *
                    </label>
                    <input
                      type="text"
                      value={newCustomStandard}
                      onChange={(e) => setNewCustomStandard(e.target.value)}
                      placeholder="e.g. SC-SEC-2026"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl font-mono font-bold text-indigo-700 focus:outline-none focus:border-indigo-500 shadow-2xs"
                      required
                    />
                  </div>
                </div>

                {/* Clauses & Checklist Structure Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900">
                        Clauses & Checklist Structure
                      </h4>
                      <p className="text-[11px] sm:text-xs text-slate-500">
                        Define verifiable sections, clause numbering, and compliance audit questions.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newSecIndex = newCustomSections.length + 1;
                        setNewCustomSections((prev) => [
                          ...prev,
                          {
                            id: `sec_${Date.now()}`,
                            title: `Section ${newSecIndex}: Operational Controls`,
                            questions: [
                              { id: `q_${Date.now()}_1`, requirementId: `${newSecIndex}.1`, question: "Are operational procedures and control records strictly maintained?" },
                            ],
                          },
                        ]);
                      }}
                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Section</span>
                    </button>
                  </div>

                  <div className="space-y-3.5">
                    {newCustomSections.map((sec, sIdx) => (
                      <div
                        key={sec.id}
                        className="p-4 sm:p-5 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3 shadow-2xs"
                      >
                        {/* Section Header Row */}
                        <div className="flex items-center gap-2.5">
                          <span className="bg-indigo-600 text-white font-mono text-[11px] font-bold px-2.5 py-1.5 rounded-lg shrink-0 shadow-2xs">
                            Sec {String(sIdx + 1).padStart(2, "0")}
                          </span>

                          <input
                            type="text"
                            value={sec.title}
                            onChange={(e) => {
                              const updated = [...newCustomSections];
                              updated[sIdx].title = e.target.value;
                              setNewCustomSections(updated);
                            }}
                            placeholder="Section Title (e.g. General Management Governance)"
                            className="flex-1 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 shadow-2xs"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...newCustomSections];
                              updated[sIdx].questions.push({
                                id: `q_${Date.now()}`,
                                requirementId: `${sIdx + 1}.${updated[sIdx].questions.length + 1}`,
                                question: "Enter compliance verification question...",
                              });
                              setNewCustomSections(updated);
                            }}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors shrink-0 shadow-2xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Clause</span>
                          </button>

                          {newCustomSections.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setNewCustomSections((prev) => prev.filter((_, idx) => idx !== sIdx));
                              }}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer transition-colors shrink-0"
                              title="Delete Section"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Clauses List */}
                        <div className="space-y-2 pl-2 sm:pl-3 border-l-2 border-indigo-200/70">
                          {sec.questions.map((q, qIdx) => (
                            <div key={q.id} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={q.requirementId}
                                onChange={(e) => {
                                  const updated = [...newCustomSections];
                                  updated[sIdx].questions[qIdx].requirementId = e.target.value;
                                  setNewCustomSections(updated);
                                }}
                                placeholder="1.1"
                                className="w-20 px-3 py-2 text-xs font-mono font-bold text-indigo-700 bg-white border border-slate-200 rounded-xl text-center focus:outline-none focus:border-indigo-500 shadow-2xs shrink-0"
                              />

                              <input
                                type="text"
                                value={q.question}
                                onChange={(e) => {
                                  const updated = [...newCustomSections];
                                  updated[sIdx].questions[qIdx].question = e.target.value;
                                  setNewCustomSections(updated);
                                }}
                                placeholder="State the compliance criteria or audit verification requirement..."
                                className="flex-1 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 shadow-2xs"
                              />

                              {sec.questions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...newCustomSections];
                                    updated[sIdx].questions = updated[sIdx].questions.filter((_, qI) => qI !== qIdx);
                                    setNewCustomSections(updated);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors shrink-0"
                                  title="Remove Clause"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs shadow-indigo-200 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create & Link to {activeModalTemplateFirm.name}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: Currently Maintained Standards */}
            {templateModalTab === "maintained" && (
              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1.5">
                {filteredModalMaintainedTemplates.length === 0 ? (
                  <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs sm:text-sm font-medium">
                    No maintained standards for {activeModalTemplateFirm.name}. You can link one from the Default Library or create a new custom template.
                  </div>
                ) : (
                  filteredModalMaintainedTemplates.map((t) => {
                    const questionsCount = t.sections.reduce(
                      (acc, s) => acc + s.questions.length,
                      0
                    );
                    return (
                      <div
                        key={t.id}
                        className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-200 flex items-center justify-between gap-4 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-mono text-xs font-bold text-indigo-700 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg shadow-2xs">
                              {t.standard}
                            </span>
                            <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                              {t.title}
                            </span>
                            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Active
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-2.5 flex-wrap font-medium">
                            <span className="text-slate-700 font-semibold">{t.industry}</span>
                            <span>•</span>
                            <span>{t.sections.length} Sections ({questionsCount} Clauses)</span>
                            <span>•</span>
                            <span>Passing Score: <strong className="text-emerald-700 font-bold">{t.passingScore}%</strong></span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            toggleFirmTemplate(activeModalTemplateFirm.id, t.id);
                          }}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs sm:text-sm font-bold rounded-xl shrink-0 flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove Standard</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Footer Done Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setIsLinkTemplateModalOpen(false)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs shadow-indigo-200 cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Modal (Add Staff to Firm) */}
      {isUserModalOpen && (
        <AddStaffModal
          isOpen={isUserModalOpen}
          onClose={() => {
            setIsUserModalOpen(false);
            setEditingUserId(null);
          }}
          firm={firms.find((f) => f.id === userStaffFirmId) || selectedFirm}
          editingUser={editingUserId ? users.find((u) => u.id === editingUserId) || null : null}
          onSave={async (userData) => {
            const targetFirm = firms.find((f) => f.id === userStaffFirmId) || selectedFirm;
            if (editingUserId) {
              await updateUser(editingUserId, {
                ...userData,
                companyName: targetFirm.name,
                companyId: targetFirm.id,
              });
            } else {
              await addUser({
                ...userData,
                companyName: targetFirm.name,
                companyId: targetFirm.id,
                status: "Active",
                isCustomerUser: false,
              });
            }
          }}
        />
      )}
    </div>
  );
};
