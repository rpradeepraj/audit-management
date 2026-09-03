import React, { useState } from "react";
import { useAudit } from "../../context/AuditContext";
import { AuditFirm, User, UserRole, AuditTemplate } from "../../types/audit";
import {
  Building2,
  ArrowLeft,
  Users,
  UserPlus,
  FileSpreadsheet,
  Award,
  Edit3,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Mail,
  Phone,
  Globe,
  MapPin,
  Trash2,
  Save,
  Check,
  X,
  ExternalLink,
  Briefcase,
  AlertCircle,
  FileCheck,
  Sparkles,
  CalendarCheck2,
  LayoutGrid,
  Table,
} from "lucide-react";
import { FirmModal } from "./FirmModal";
import { FirmAuditPlanningTab } from "./FirmAuditPlanningTab";

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
    addUser,
    updateUser,
    deleteUser,
    templates,
    addTemplate,
    toggleFirmTemplate,
    audits,
    customers,
  } = useAudit();

  const firm = firms.find((f) => f.id === firmId) || firms[0];

  // Internal screen view tab: "overview" | "users" | "templates" | "audits" | "perform"
  const [activeSection, setActiveSection] = useState<
    "overview" | "users" | "templates" | "audits" | "perform"
  >("overview");

  // Edit Firm modal
  const [isEditFirmModalOpen, setIsEditFirmModalOpen] = useState(false);

  // Profile in-place form state
  const [profileForm, setProfileForm] = useState<AuditFirm>(firm);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Sync profileForm when firm changes
  React.useEffect(() => {
    if (firm) {
      setProfileForm(firm);
    }
  }, [firm]);

  // User search, filter and view mode (default: table)
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("All");
  const [userViewMode, setUserViewMode] = useState<"table" | "grid">("table");

  // Template search, filter and view mode (default: table)
  const [firmTemplateSearch, setFirmTemplateSearch] = useState("");
  const [firmTemplateCategory, setFirmTemplateCategory] = useState("All");
  const [templateViewMode, setTemplateViewMode] = useState<"table" | "grid">("table");

  // Add / Edit User Modal for this firm
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userStaffFirmId, setUserStaffFirmId] = useState<string>(firm ? firm.id : "");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("Auditor");
  const [userDepartment, setUserDepartment] = useState("Quality & Compliance");
  const [userPhone, setUserPhone] = useState("");
  const [userStatus, setUserStatus] = useState<"Active" | "Inactive">("Active");

  // Assign Template Modal (supports switching target firm inside modal)
  const [isAssignTemplateModalOpen, setIsAssignTemplateModalOpen] = useState(false);
  const [modalTemplateFirmId, setModalTemplateFirmId] = useState<string>(firm ? firm.id : "");
  const [templateModalTab, setTemplateModalTab] = useState<"library" | "custom" | "maintained">("library");
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");

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

  // Sync state when firm changes
  React.useEffect(() => {
    if (firm) {
      setUserStaffFirmId(firm.id);
      setModalTemplateFirmId(firm.id);
    }
  }, [firm?.id]);

  if (!firm) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Firm Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">The requested audit firm record was not found.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Audit Firms
        </button>
      </div>
    );
  }

  // Dynamic Users assigned to this firm
  const assignedUsers = users.filter(
    (u) => u.companyId === firm.id || u.companyName === firm.name
  );

  const filteredUsers = assignedUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(userSearchQuery.toLowerCase()));
    const matchesRole = userRoleFilter === "All" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Dynamic Templates maintained by this firm
  const maintainedTemplateIds = firm.maintainedTemplateIds || [];
  const assignedTemplates = templates.filter((t) =>
    maintainedTemplateIds.includes(t.id)
  );

  // Available templates not yet assigned (current firm tab)
  const availableTemplates = templates.filter(
    (t) => !maintainedTemplateIds.includes(t.id)
  );

  const filteredAvailableTemplates = availableTemplates.filter(
    (t) =>
      t.title.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
      t.standard.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
      t.industry.toLowerCase().includes(templateSearchQuery.toLowerCase())
  );

  // Modal active firm for templates (supports switching target firm inside modal)
  const activeModalTemplateFirm =
    firms.find((f) => f.id === modalTemplateFirmId) || firm;
  const activeModalFirmMaintainedIds =
    activeModalTemplateFirm.maintainedTemplateIds || [];

  const activeModalFirmMaintainedTemplates = templates.filter((t) =>
    activeModalFirmMaintainedIds.includes(t.id)
  );

  const activeModalFirmAvailableTemplates = templates.filter(
    (t) => !activeModalFirmMaintainedIds.includes(t.id)
  );

  const filteredModalAvailableTemplates = activeModalFirmAvailableTemplates.filter((t) =>
    t.title.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
    t.standard.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
    t.industry.toLowerCase().includes(templateSearchQuery.toLowerCase())
  );

  const filteredModalMaintainedTemplates = activeModalFirmMaintainedTemplates.filter((t) =>
    t.title.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
    t.standard.toLowerCase().includes(templateSearchQuery.toLowerCase()) ||
    t.industry.toLowerCase().includes(templateSearchQuery.toLowerCase())
  );

  // Selected staff firm in user modal
  const selectedStaffFirm =
    firms.find((f) => f.id === userStaffFirmId) || firm;

  // Audits related to this firm or its users
  const firmUserIds = new Set(assignedUsers.map((u) => u.id));
  const firmAudits = audits.filter(
    (a) =>
      a.firmId === firm.id ||
      firmUserIds.has(a.leadAuditorId) ||
      a.auditorIds?.some((id) => firmUserIds.has(id))
  );

  // Handle saving in-place profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateFirm(firm.id, profileForm);
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
  };

  // Open add user modal pre-scoped to this firm
  const handleOpenAddUser = () => {
    setEditingUserId(null);
    setUserStaffFirmId(firm.id);
    setUserName("");
    setUserEmail("");
    setUserRole("Auditor");
    setUserDepartment("Quality Assurance & Audit Operations");
    setUserPhone("+1 (555) 0122");
    setUserStatus("Active");
    setIsUserModalOpen(true);
  };

  // Open edit user modal
  const handleOpenEditUser = (u: User) => {
    setEditingUserId(u.id);
    const firmMatch = firms.find((f) => f.id === u.companyId || f.name === u.companyName);
    setUserStaffFirmId(firmMatch ? firmMatch.id : firm.id);
    setUserName(u.name);
    setUserEmail(u.email);
    setUserRole(u.role);
    setUserDepartment(u.department || "Quality & Compliance");
    setUserPhone(u.phone || "");
    setUserStatus(u.status || "Active");
    setIsUserModalOpen(true);
  };

  // Save user under selected firm
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    const targetFirm = firms.find((f) => f.id === userStaffFirmId) || firm;

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

  // Unassign user from firm
  const handleUnassignUser = (userId: string, memberName: string) => {
    if (
      confirm(
        `Are you sure you want to remove ${memberName} from ${firm.name}?`
      )
    ) {
      deleteUser(userId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumbs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Audit Firms</span>
          </button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Audit Firms</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-[300px]">
              {firm.name}
            </span>
          </div>
        </div>

        {/* Quick Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Switch Firm:
          </span>
          <select
            value={firm.id}
            onChange={(e) => onSelectAnotherFirm(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer shadow-2xs"
          >
            {firms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.code})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsEditFirmModalOpen(true)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Firm</span>
          </button>
        </div>
      </div>

      {/* Internal Navigation Tabs for this Firm Screen */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveSection("overview")}
          className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-b-2 whitespace-nowrap ${
            activeSection === "overview"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Firm Profile & Credentials</span>
        </button>

        <button
          onClick={() => setActiveSection("users")}
          className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-b-2 whitespace-nowrap ${
            activeSection === "users"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Assigned Users ({assignedUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveSection("templates")}
          className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-b-2 whitespace-nowrap ${
            activeSection === "templates"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Assigned Templates ({assignedTemplates.length})</span>
        </button>

        <button
          onClick={() => setActiveSection("audits")}
          className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border-b-2 whitespace-nowrap ${
            activeSection === "audits"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <CalendarCheck2 className="w-4 h-4" />
          <span>Audit Planning ({firmAudits.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: FIRM PROFILE & ACCREDITATION (Dynamic In-Place Management) */}
      {/* ========================================================================= */}
      {activeSection === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Credentials Form */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>Accreditation & Corporate Specifications</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dynamic governance profile for {firm.name}. Changes apply immediately across all audits.
                </p>
              </div>

              {profileSaveSuccess && (
                <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Saved Dynamically!</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Firm Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Firm Identifier / Code
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.code}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Accreditation Number
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.accreditationNumber}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        accreditationNumber: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Accreditation Status
                  </label>
                  <select
                    value={profileForm.status || "Active"}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending Accreditation">Pending Accreditation</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Accreditation Standard
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.accreditationStandard}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      accreditationStandard: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Industry Scope of Surveillance
                </label>
                <textarea
                  rows={2}
                  value={profileForm.industryScope}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      industryScope: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Governance Email
                  </label>
                  <input
                    type="email"
                    required
                    value={profileForm.contactEmail}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        contactEmail: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Contact
                  </label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Website
                  </label>
                  <input
                    type="text"
                    value={profileForm.website}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        website: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Established Year
                  </label>
                  <input
                    type="text"
                    value={profileForm.establishedYear}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        establishedYear: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Headquarters Location
                </label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, address: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quality & Impartiality Policy
                </label>
                <textarea
                  rows={3}
                  value={profileForm.qualityPolicy}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      qualityPolicy: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Firm Credentials</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Firm Snapshot Card */}
          <div className="space-y-4">
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xs border border-slate-800">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Accreditation Seal
              </h4>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center font-black text-lg">
                  {firm.logoInitials}
                </div>
                <div>
                  <h5 className="font-bold text-sm text-white">{firm.name}</h5>
                  <span className="text-xs text-slate-400 font-mono">
                    {firm.accreditationNumber}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Assigned Staff:</span>
                  <span className="font-bold text-indigo-300">
                    {assignedUsers.length} Team Members
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Maintained Standards:</span>
                  <span className="font-bold text-emerald-300">
                    {assignedTemplates.length} Standards
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Conducted Audits:</span>
                  <span className="font-bold text-purple-300">
                    {firmAudits.length} Audits
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">ISO Conformity:</span>
                  <span className="font-semibold text-slate-200">ISO 17021-1 Compliant</span>
                </div>
              </div>

              <div className="mt-5 p-3 rounded-xl bg-indigo-950/70 border border-indigo-700/50 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-indigo-200 leading-relaxed">
                  Authorized audit body for 3rd-party compliance certification under accredited scope.
                </p>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-800">Quick Manage</h4>
              <button
                onClick={() => setActiveSection("users")}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700 border border-slate-100"
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Manage Assigned Users ({assignedUsers.length})</span>
                </span>
                <span className="text-xs text-indigo-600 font-bold">Go →</span>
              </button>

              <button
                onClick={() => setActiveSection("templates")}
                className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700 border border-slate-100"
              >
                <span className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Assign Templates ({assignedTemplates.length})</span>
                </span>
                <span className="text-xs text-emerald-600 font-bold">Go →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* SECTION 2: ASSIGNED USERS ("one firm have multiple user ... render dynamically") */}
      {/* ========================================================================= */}
      {activeSection === "users" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-4 p-5">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">
                  Users Assigned to {firm.name} ({assignedUsers.length})
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage auditors, managers, and administrators specifically assigned to this audit firm.
              </p>
            </div>

            <button
              onClick={handleOpenAddUser}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add User to {firm.code}</span>
            </button>
          </div>

          {/* Search, Filter & View Switcher Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search assigned users by name, email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="All">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="Company Admin">Company Admin</option>
                  <option value="Audit Manager">Audit Manager</option>
                  <option value="Auditor">Auditor</option>
                </select>
              </div>

              {/* Table / Grid Switcher for Users */}
              <div className="flex items-center bg-slate-200/70 p-1 rounded-xl border border-slate-200 shrink-0">
                <button
                  onClick={() => setUserViewMode("table")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    userViewMode === "table"
                      ? "bg-white text-indigo-600 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Table View (Dense)"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  onClick={() => setUserViewMode("grid")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    userViewMode === "grid"
                      ? "bg-white text-indigo-600 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Grid View (Cards)"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
              </div>
            </div>
          </div>

          {/* Users Display (Table or Grid View) */}
          {userViewMode === "table" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">User Member</th>
                    <th className="py-3 px-4">Assigned Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Contact Phone</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-600">No users currently assigned</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Click &quot;Add User to {firm.code}&quot; above to provision staff members for this firm.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900">{user.name}</div>
                              <div className="text-[11px] text-slate-400">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                              user.role === "Admin" || user.role === "Company Admin"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : user.role === "Audit Manager"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-indigo-50 text-indigo-700 border-indigo-200"
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>{user.role}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">
                          {user.department || "Quality & Compliance"}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          {user.phone || "—"}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              user.status === "Active" || !user.status
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {user.status || "Active"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditUser(user)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit User"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleUnassignUser(user.id, user.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Remove from Firm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-600">No users found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Try adjusting your search criteria or add a new team member.
                  </p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-50 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                              {user.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{user.email}</span>
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                            user.status === "Active" || !user.status
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          {user.status || "Active"}
                        </span>
                      </div>

                      <div className="mt-4 p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-[11px]">Role:</span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                              user.role === "Admin" || user.role === "Company Admin"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : user.role === "Audit Manager"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-indigo-50 text-indigo-700 border-indigo-200"
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>{user.role}</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-[11px]">Department:</span>
                          <span className="font-semibold text-slate-700 text-[11px] truncate max-w-[160px]">
                            {user.department || "Quality & Compliance"}
                          </span>
                        </div>

                        {user.phone && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-[11px]">Phone:</span>
                            <span className="font-mono text-slate-600 text-[11px]">
                              {user.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => handleOpenEditUser(user)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Profile</span>
                      </button>

                      <button
                        onClick={() => handleUnassignUser(user.id, user.name)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: ASSIGNED TEMPLATES ("multiple tamplate assign ... dynamically") */}
      {/* ========================================================================= */}
      {activeSection === "templates" && (
        <div className="space-y-4">
          {/* Header Context Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Assigned Templates for {firm.name} ({assignedTemplates.length})
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Official compliance frameworks and checklists maintained and deployed by {firm.name}.
              </p>
            </div>

            <button
              onClick={() => setIsAssignTemplateModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Assign More Templates</span>
            </button>
          </div>

          {/* Search, Category Filter & View Mode Switcher */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search standards by code, title, industry..."
                value={firmTemplateSearch}
                onChange={(e) => setFirmTemplateSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={firmTemplateCategory}
                  onChange={(e) => setFirmTemplateCategory(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="All">All Categories</option>
                  {Array.from(new Set(assignedTemplates.map((t) => t.industry))).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Table / Grid Switcher for Templates */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                <button
                  onClick={() => setTemplateViewMode("table")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    templateViewMode === "table"
                      ? "bg-white text-indigo-600 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Table View (Dense)"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  onClick={() => setTemplateViewMode("grid")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    templateViewMode === "grid"
                      ? "bg-white text-indigo-600 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Grid View (Cards)"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
              </div>
            </div>
          </div>

          {/* Assigned Templates Display (Table or Grid View) */}
          {(() => {
            const filteredAssignedTemplates = assignedTemplates.filter((t) => {
              const matchesSearch =
                t.title.toLowerCase().includes(firmTemplateSearch.toLowerCase()) ||
                t.standard.toLowerCase().includes(firmTemplateSearch.toLowerCase()) ||
                t.industry.toLowerCase().includes(firmTemplateSearch.toLowerCase());
              const matchesCat =
                firmTemplateCategory === "All" ||
                t.industry.toLowerCase().includes(firmTemplateCategory.toLowerCase());
              return matchesSearch && matchesCat;
            });

            if (filteredAssignedTemplates.length === 0) {
              return (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
                  <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-700">No Templates Found</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    {assignedTemplates.length === 0
                      ? "This firm currently has no compliance frameworks assigned."
                      : "No assigned templates match your search criteria."}
                  </p>
                  <button
                    onClick={() => setIsAssignTemplateModalOpen(true)}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Assign Standard Templates</span>
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
                          <th className="py-3.5 px-4">Standard Code</th>
                          <th className="py-3.5 px-4">Template Title & Overview</th>
                          <th className="py-3.5 px-4">Industry Scope</th>
                          <th className="py-3.5 px-4">Clauses / Sections</th>
                          <th className="py-3.5 px-4">Passing Score</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        {filteredAssignedTemplates.map((tmpl) => {
                          const totalQuestions = tmpl.sections.reduce(
                            (acc, s) => acc + s.questions.length,
                            0
                          );

                          return (
                            <tr key={tmpl.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-black text-indigo-700">
                                {tmpl.standard}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-slate-900">
                                {tmpl.title}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600">
                                <span className="px-2 py-0.5 bg-slate-100 rounded-md font-medium text-slate-700">
                                  {tmpl.industry}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-600 font-semibold">
                                {tmpl.sections.length} Sec ({totalQuestions} Clauses)
                              </td>
                              <td className="py-3.5 px-4 font-bold text-emerald-600">
                                {tmpl.passingScore}%
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Active</span>
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={() => toggleFirmTemplate(firm.id, tmpl.id)}
                                  className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                                >
                                  Unassign
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

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAssignedTemplates.map((tmpl) => {
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
                            <span>Active Standard</span>
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
                            <span className="text-slate-400 block text-[10px]">Passing Threshold</span>
                            <span className="font-bold text-emerald-600">{tmpl.passingScore}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                          {tmpl.industry}
                        </span>
                        <button
                          onClick={() => toggleFirmTemplate(firm.id, tmpl.id)}
                          className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Unassign from Firm
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
      {/* SECTION 4: FIRM AUDIT PLANNING & ENGAGEMENTS ("firm maintain full planning") */}
      {/* ========================================================================= */}
      {activeSection === "audits" && (
        <FirmAuditPlanningTab
          selectedFirm={firm}
          onSelectFirm={(f) => onSelectAnotherFirm(f.id)}
        />
      )}

      {/* Edit Firm Modal */}
      <FirmModal
        isOpen={isEditFirmModalOpen}
        onClose={() => setIsEditFirmModalOpen(false)}
        editingFirm={firm}
        onSave={(data, id) => {
          if (id) updateFirm(id, data);
        }}
      />

      {/* Add / Edit Staff Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">
                    {editingUserId ? "Edit Staff Member" : "Add Staff to Firm"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Assign qualified auditors, audit managers, or company administrators to an audit firm.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              {/* Assigned Audit Firm */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Audit Firm *
                </label>
                <select
                  value={userStaffFirmId}
                  onChange={(e) => setUserStaffFirmId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white font-medium text-slate-800 cursor-pointer"
                >
                  {firms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Dr. Jordan Vance, Lead Auditor"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="e.g. j.vance@auditfirm.com"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Assigned Role *
                  </label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                  >
                    <option value="Auditor">Auditor (Field & Evidence Verification)</option>
                    <option value="Audit Manager">Audit Manager (Review & Signoff)</option>
                    <option value="Company Admin">Company Admin (Firm Lead)</option>
                    <option value="Admin">System Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Staff Status
                  </label>
                  <select
                    value={userStatus}
                    onChange={(e) => setUserStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                  >
                    <option value="Active">Active (Eligible for audit scheduling)</option>
                    <option value="Inactive">Inactive (Suspended / On Leave)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Contact
                </label>
                <input
                  type="text"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <span>{editingUserId ? "Update Member" : `Save & Assign to ${selectedStaffFirm.code}`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link / New Template & Standards Provisioning Modal */}
      {isAssignTemplateModalOpen && (
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
                onClick={() => setIsAssignTemplateModalOpen(false)}
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
                onChange={(e) => setModalTemplateFirmId(e.target.value)}
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
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newCustomTitle.trim() || !newCustomStandard.trim()) return;

                  const newTemplateId = addTemplate({
                    title: newCustomTitle.trim(),
                    standard: newCustomStandard.trim(),
                    industry: newCustomIndustry.trim(),
                    description: `Custom compliance template provisioned for ${activeModalTemplateFirm.name}`,
                    sections: newCustomSections.map((s) => ({
                      ...s,
                      questions: s.questions.map((q) => ({
                        ...q,
                        guidance: "Verify objective documentary evidence and operational records.",
                      })),
                    })),
                    passingScore: newCustomPassingScore,
                    isCustom: true,
                    tags: ["Custom", newCustomStandard.trim(), activeModalTemplateFirm.code],
                  });

                  toggleFirmTemplate(activeModalTemplateFirm.id, newTemplateId);
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
                onClick={() => setIsAssignTemplateModalOpen(false)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs shadow-indigo-200 cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
