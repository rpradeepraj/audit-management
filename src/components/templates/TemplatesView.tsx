import React, { useState } from "react";
import { useAudit } from "../../context/AuditContext";
import { AuditTemplate, ChecklistSection, ChecklistQuestion } from "../../types/audit";
import { ChecklistScreen } from "./ChecklistScreen";
import {
  FileSpreadsheet,
  Plus,
  Search,
  CheckCircle2,
  X,
  Copy,
  ShieldCheck,
  Building2,
  Calendar,
  Factory,
  Pill,
  Stethoscope,
  Landmark,
  Utensils,
  Car,
  Plane,
  Flame,
  Truck,
  Edit,
  Trash2,
  ChevronRight,
  Layers,
  Sparkles,
  CheckSquare,
  ArrowUpRight,
  Filter,
  BookOpen,
  Table,
  LayoutGrid,
  CalendarCheck2,
} from "lucide-react";

interface TemplatesViewProps {
  onOpenAiGenerator?: () => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = () => {
  const {
    templates,
    firms,
    toggleFirmTemplate,
    currentUser,
    addTemplate,
    cloneTemplate,
    deleteTemplate,
    setActiveTab,
    setActiveTemplateId,
    searchQuery,
    setSearchQuery,
  } = useAudit();

  const [activeFilterTab, setActiveFilterTab] = useState<"default" | "all" | "custom">("default");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Provisioning Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [templateModalTab, setTemplateModalTab] = useState<"library" | "custom" | "maintained">("library");
  const [modalFirmId, setModalFirmId] = useState<string>(firms[0]?.id || "");
  const [modalSearchQuery, setModalSearchQuery] = useState("");

  // Custom Template Form State
  const [newCustomTitle, setNewCustomTitle] = useState("");
  const [newCustomStandard, setNewCustomStandard] = useState("");
  const [newCustomIndustry, setNewCustomIndustry] = useState("Manufacturing & Quality");
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

  // Clone Modal State
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [templateToClone, setTemplateToClone] = useState<AuditTemplate | null>(null);
  const [cloneCustomTitle, setCloneCustomTitle] = useState("");

  // Active Firm for modal
  const activeModalFirm = firms.find((f) => f.id === modalFirmId) || firms[0] || {
    id: "firm_1",
    name: "Veritas Assurance Partners",
    code: "VAP-GLOBAL",
    maintainedTemplateIds: [],
  };

  const activeModalFirmMaintainedIds = activeModalFirm.maintainedTemplateIds || [];
  const modalMaintainedTemplates = templates.filter((t) =>
    activeModalFirmMaintainedIds.includes(t.id)
  );
  const modalAvailableTemplates = templates.filter(
    (t) => !activeModalFirmMaintainedIds.includes(t.id)
  );

  const filteredModalAvailableTemplates = modalAvailableTemplates.filter((t) =>
    t.title.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
    t.standard.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
    t.industry.toLowerCase().includes(modalSearchQuery.toLowerCase())
  );

  const filteredModalMaintainedTemplates = modalMaintainedTemplates.filter((t) =>
    t.title.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
    t.standard.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
    t.industry.toLowerCase().includes(modalSearchQuery.toLowerCase())
  );

  // Filter templates for main view
  const defaultTemplates = templates.filter((t) => t.isDefaultIndustryTemplate);
  const customTemplates = templates.filter((t) => !t.isDefaultIndustryTemplate);

  const allFiltered = templates.filter((t) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(query) ||
      t.standard.toLowerCase().includes(query) ||
      t.industry.toLowerCase().includes(query) ||
      t.sections.some((s) =>
        s.title.toLowerCase().includes(query) ||
        s.questions.some((q) => q.question.toLowerCase().includes(query) || q.requirementId.toLowerCase().includes(query))
      )
    );
  });

  const displayedTemplates = searchQuery
    ? allFiltered
    : activeFilterTab === "default"
    ? defaultTemplates
    : activeFilterTab === "custom"
    ? customTemplates
    : allFiltered;

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || null;

  const handleCloneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateToClone) return;
    const newId = cloneTemplate(templateToClone.id, cloneCustomTitle.trim() || undefined);
    setIsCloneModalOpen(false);
    setTemplateToClone(null);
    setCloneCustomTitle("");
    setSelectedTemplateId(newId);
    setActiveFilterTab("all");
  };

  const handleUseInAuditPlan = (tmpl: AuditTemplate, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveTemplateId(tmpl.id);
    setActiveTab("planning");
  };

  const canManage =
    currentUser.role === "Platform Admin" ||
    currentUser.role === "Admin" ||
    currentUser.role === "Company Admin" ||
    currentUser.role === "Audit Manager";

  // Dedicated Full-Width Checklist Screen Mode
  if (selectedTemplate) {
    return (
      <>
        <ChecklistScreen
          template={selectedTemplate}
          onBack={() => setSelectedTemplateId(null)}
          onPlanAudit={(tmpl) => handleUseInAuditPlan(tmpl)}
          onCloneTemplate={(tmpl) => {
            setTemplateToClone(tmpl);
            setCloneCustomTitle(`${tmpl.title} (Customized)`);
            setIsCloneModalOpen(true);
          }}
        />

        {/* Clone Template Modal */}
        {isCloneModalOpen && templateToClone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 animate-in zoom-in-95 duration-150 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Copy className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Clone Template</h3>
                </div>
                <button
                  onClick={() => {
                    setIsCloneModalOpen(false);
                    setTemplateToClone(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCloneSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Template Title *
                  </label>
                  <input
                    type="text"
                    value={cloneCustomTitle}
                    onChange={(e) => setCloneCustomTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                    required
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCloneModalOpen(false);
                      setTemplateToClone(null);
                    }}
                    className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-200 cursor-pointer"
                  >
                    Clone Template
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Audit Template Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            Audit Templates & Compliance Frameworks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Standardized checklist catalogs, clause structures, and customizable audit criteria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              onClick={() => {
                setTemplateModalTab("library");
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs shadow-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Template</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Toolbar: Search, Category Filters, and Table | Grid Switcher at Right End */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by standard, clause, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Tabs: Default vs All vs Custom */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                setActiveFilterTab("default");
                setSearchQuery("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilterTab === "default" && !searchQuery
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Default Library ({defaultTemplates.length})
            </button>
            <button
              onClick={() => setActiveFilterTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilterTab === "all" || searchQuery
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Templates ({templates.length})
            </button>
            {customTemplates.length > 0 && (
              <button
                onClick={() => {
                  setActiveFilterTab("custom");
                  setSearchQuery("");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeFilterTab === "custom" && !searchQuery
                    ? "bg-white text-indigo-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Custom ({customTemplates.length})
              </button>
            )}
          </div>
        </div>

        {/* View Switcher: Table and Grid at Right End */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-end sm:self-center">
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewMode === "table" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
            title="Table View"
          >
            <Table className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              viewMode === "grid" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {displayedTemplates.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <div className="text-sm font-bold text-slate-800">No matching audit templates found</div>
          <p className="text-xs text-slate-500 mt-1">Try changing your search terms or filters.</p>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW (Dense & Comprehensive) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Standard Code</th>
                  <th className="py-3 px-4">Template Title</th>
                  <th className="py-3 px-4 text-center">Sections & Clauses</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {displayedTemplates.map((tmpl) => {
                  const questionsCount = tmpl.sections.reduce((acc, s) => acc + s.questions.length, 0);

                  return (
                    <tr
                      key={tmpl.id}
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">
                        <span className="bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg shadow-2xs">
                          {tmpl.standard}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {tmpl.title}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="font-bold text-slate-800">
                          {tmpl.sections.length} Sections
                        </span>
                        <span className="text-slate-400 text-xs ml-1">
                          ({questionsCount} Clauses)
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {tmpl.isDefaultIndustryTemplate ? (
                          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-md">
                            Standard Library
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-md">
                            Custom Framework
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-end gap-1.5"
                        >
                          <button
                            onClick={() => setSelectedTemplateId(tmpl.id)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            title="View Checklist Clauses"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Checklist</span>
                          </button>

                          <button
                            onClick={(e) => handleUseInAuditPlan(tmpl, e)}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1"
                            title="Schedule Audit Plan with this Template"
                          >
                            <CalendarCheck2 className="w-3.5 h-3.5" />
                            <span>Plan</span>
                          </button>

                          <button
                            onClick={() => {
                              setTemplateToClone(tmpl);
                              setCloneCustomTitle(`${tmpl.title} (Customized)`);
                              setIsCloneModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Clone Template"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {!tmpl.isDefaultIndustryTemplate && canManage && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete template "${tmpl.title}"?`)) {
                                  deleteTemplate(tmpl.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Template"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW (Interactive Cards) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedTemplates.map((tmpl) => {
            const questionsCount = tmpl.sections.reduce((acc, s) => acc + s.questions.length, 0);

            return (
              <div
                key={tmpl.id}
                onClick={() => setSelectedTemplateId(tmpl.id)}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg shadow-2xs">
                      {tmpl.standard}
                    </span>
                    {tmpl.isDefaultIndustryTemplate ? (
                      <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        Standard
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                        Custom
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {tmpl.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    {tmpl.sections.length} Sections • {questionsCount} Checklist Clauses
                  </div>
                </div>

                <div
                  onClick={(e) => e.stopPropagation()}
                  className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2"
                >
                  <button
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                    <span>Checklist</span>
                  </button>
                  <button
                    onClick={(e) => handleUseInAuditPlan(tmpl, e)}
                    className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <CalendarCheck2 className="w-3.5 h-3.5" />
                    <span>Plan Audit</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* NEW TEMPLATE & STANDARDS PROVISIONING MODAL */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
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
                onClick={() => setIsCreateModalOpen(false)}
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
                value={activeModalFirm.id}
                onChange={(e) => setModalFirmId(e.target.value)}
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
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-900"
                  />
                </div>

                <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1.5">
                  {filteredModalAvailableTemplates.length === 0 ? (
                    <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs sm:text-sm font-medium">
                      All library standards are already maintained by {activeModalFirm.name}, or no standards match your search query.
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
                              toggleFirmTemplate(activeModalFirm.id, t.id);
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
                    description: `Custom compliance template provisioned for ${activeModalFirm.name}`,
                    sections: newCustomSections.map((s) => ({
                      ...s,
                      questions: s.questions.map((q) => ({
                        ...q,
                        guidance: "Verify objective documentary evidence and operational records.",
                      })),
                    })),
                    passingScore: newCustomPassingScore,
                    isCustom: true,
                    tags: ["Custom", newCustomStandard.trim(), activeModalFirm.code],
                  });

                  toggleFirmTemplate(activeModalFirm.id, newTemplateId);
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
                    <span>Create & Link to {activeModalFirm.name}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: Currently Maintained Standards */}
            {templateModalTab === "maintained" && (
              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1.5">
                {filteredModalMaintainedTemplates.length === 0 ? (
                  <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs sm:text-sm font-medium">
                    No maintained standards for {activeModalFirm.name}. You can link one from the Default Library or create a new custom template.
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
                            toggleFirmTemplate(activeModalFirm.id, t.id);
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
                onClick={() => setIsCreateModalOpen(false)}
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
