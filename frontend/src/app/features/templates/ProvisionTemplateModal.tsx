"use client";

import React, { useState, useEffect } from "react";
import { AuditTemplate, AuditFirm } from "../../shared/types/audit";
import { useAudit } from "../../shared/context/AuditContext";
import {
  FileSpreadsheet,
  X,
  Search,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface ProvisionTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  firms?: AuditFirm[];
  templates?: AuditTemplate[];
  onAddTemplate?: (tmpl: any) => Promise<string> | string;
  onToggleFirmTemplate?: (firmId: string, templateId: string) => void;
}

interface SectionDraft {
  id: string;
  title: string;
  questions: Array<{
    id: string;
    requirementId: string;
    question: string;
  }>;
}

export const ProvisionTemplateModal: React.FC<ProvisionTemplateModalProps> = ({
  isOpen,
  onClose,
  firms: propFirms,
  templates: propTemplates,
}) => {
  const {
    firms: contextFirms,
    templates: contextTemplates,
    linkGlobalTemplateToFirm,
    createCustomFirmTemplate,
    deleteTemplate,
    reloadTemplates,
    reloadFirms,
    isTemplatesLoading,
    showSuccess,
    showError,
  } = useAudit();

  const firms = propFirms && propFirms.length > 0 ? propFirms : contextFirms;
  const templates = propTemplates && propTemplates.length > 0 ? propTemplates : contextTemplates;

  const [modalTab, setModalTab] = useState<"library" | "custom" | "maintained">("library");
  const [modalFirmId, setModalFirmId] = useState<string>(firms[0]?.id || "");
  const [modalSearch, setModalSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch /api/templates?type=all when modal is opened (e.g. Default Template Library)
  useEffect(() => {
    if (isOpen) {
      reloadTemplates("all");
    }
  }, [isOpen, reloadTemplates]);

  // Custom template fields
  const [customTitle, setCustomTitle] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [customSections, setCustomSections] = useState<SectionDraft[]>([
    {
      id: "sec_1",
      title: "Section 1: General & Management Governance",
      questions: [
        {
          id: "q_1_1",
          requirementId: "1.1",
          question: "Is the management policy and quality manual documented and communicated?",
        },
        {
          id: "q_1_2",
          requirementId: "1.2",
          question: "Are operational procedures periodically reviewed with objective verification records?",
        },
      ],
    },
  ]);

  if (!isOpen) return null;

  const activeFirm: AuditFirm = firms.find((f) => f.id === modalFirmId) || firms[0] || {
    id: "firm_default",
    name: "Audit Firm",
    code: "FIRM",
    accreditationNumber: "",
    accreditationStandard: "",
    industryScope: "",
    contactEmail: "",
    phone: "",
    address: "",
    website: "",
    logoInitials: "AF",
    establishedYear: "",
    qualityPolicy: "",
    status: "Active",
    maintainedTemplateIds: [],
  };

  // Global library templates vs Firm maintained templates
  const defaultLibraryTemplates = templates.filter((t) => t.isDefaultIndustryTemplate);
  const firmMaintainedTemplates = templates.filter(
    (t) => (!t.isDefaultIndustryTemplate && t.firmId === activeFirm.id) ||
      (activeFirm.maintainedTemplateIds && activeFirm.maintainedTemplateIds.includes(t.id))
  );

  // Check which global templates are already linked to this firm
  const linkedGlobalIds = new Set(
    firmMaintainedTemplates.map((t) => t.globalTemplateId || t.id)
  );

  const availableLibraryTemplates = defaultLibraryTemplates.filter(
    (t) => !linkedGlobalIds.has(t.id)
  );

  const filteredLibrary = availableLibraryTemplates.filter((t) => {
    if (!modalSearch.trim()) return true;
    const q = modalSearch.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.standard.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  const filteredMaintained = firmMaintainedTemplates.filter((t) => {
    if (!modalSearch.trim()) return true;
    const q = modalSearch.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.standard.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q)
    );
  });

  // Link a global library standard to active firm
  const handleLinkToFirm = async (globalTemplate: AuditTemplate) => {
    setLinkingId(globalTemplate.id);
    try {
      await linkGlobalTemplateToFirm(activeFirm.id, globalTemplate.id);
      await Promise.all([reloadTemplates(), reloadFirms()]);
      showSuccess(`Standard "${globalTemplate.title}" linked successfully to ${activeFirm.name}.`);
      setModalTab("maintained");
    } catch (err: any) {
      showError(err.message || "Failed to link standard to firm.");
    } finally {
      setLinkingId(null);
    }
  };

  // Delete / Remove template
  const handleDeleteTemplate = async (tmplId: string, title: string) => {
    setDeletingId(tmplId);
    try {
      await deleteTemplate(tmplId);
      await Promise.all([reloadTemplates(), reloadFirms()]);
      showSuccess(`Template "${title}" removed successfully.`);
    } catch (err: any) {
      showError(err.message || "Failed to remove template.");
    } finally {
      setDeletingId(null);
    }
  };

  // Add Section to custom template builder
  const handleAddSection = () => {
    const nextSecNum = customSections.length + 1;
    const newSec: SectionDraft = {
      id: `sec_${Date.now()}`,
      title: `Section ${nextSecNum}: Operational Compliance & Verification`,
      questions: [
        {
          id: `q_${Date.now()}_1`,
          requirementId: `${nextSecNum}.1`,
          question: "Are controls documented, verified, and audited with objective evidence?",
        },
      ],
    };
    setCustomSections([...customSections, newSec]);
  };

  // Add Clause / Question to a specific section
  const handleAddClause = (sectionIndex: number) => {
    const secNum = sectionIndex + 1;
    const targetSection = customSections[sectionIndex];
    const nextClauseNum = targetSection.questions.length + 1;

    const newClause = {
      id: `q_${Date.now()}_${nextClauseNum}`,
      requirementId: `${secNum}.${nextClauseNum}`,
      question: "",
    };

    const updated = [...customSections];
    updated[sectionIndex].questions.push(newClause);
    setCustomSections(updated);
  };

  // Update Section Title
  const handleSectionTitleChange = (sectionIndex: number, newTitle: string) => {
    const updated = [...customSections];
    updated[sectionIndex].title = newTitle;
    setCustomSections(updated);
  };

  // Update Clause Question Text
  const handleClauseChange = (sectionIndex: number, questionIndex: number, text: string) => {
    const updated = [...customSections];
    updated[sectionIndex].questions[questionIndex].question = text;
    setCustomSections(updated);
  };

  // Remove a clause
  const handleRemoveClause = (sectionIndex: number, questionIndex: number) => {
    const updated = [...customSections];
    updated[sectionIndex].questions.splice(questionIndex, 1);
    const secNum = sectionIndex + 1;
    updated[sectionIndex].questions.forEach((q, idx) => {
      q.requirementId = `${secNum}.${idx + 1}`;
    });
    setCustomSections(updated);
  };

  // Remove a section
  const handleRemoveSection = (sectionIndex: number) => {
    if (customSections.length <= 1) return;
    const updated = customSections.filter((_, idx) => idx !== sectionIndex);
    updated.forEach((sec, sIdx) => {
      const secNum = sIdx + 1;
      sec.questions.forEach((q, qIdx) => {
        q.requirementId = `${secNum}.${qIdx + 1}`;
      });
    });
    setCustomSections(updated);
  };

  // Submit custom template creation
  const handleCreateAndLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customCode.trim()) {
      showError("Please enter template title and standard code.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createCustomFirmTemplate({
        firmId: activeFirm.id,
        title: customTitle.trim(),
        code: customCode.trim(),
        standard: customCode.trim(),
        industry: "General Industry",
        passingScore: 80,
        sections: customSections.map((s, sIdx) => ({
          title: s.title || `Section ${sIdx + 1}`,
          weight: 100,
          questions: s.questions
            .filter((q) => q.question.trim().length > 0)
            .map((q, qIdx) => ({
              requirementId: q.requirementId || `${sIdx + 1}.${qIdx + 1}`,
              question: q.question.trim(),
              guidance: "Verify objective documentary evidence and operational records.",
              scoringType: "PASS_FAIL" as const,
              weight: 10,
              mandatory: qIdx === 0,
            })),
        })),
      });

      await Promise.all([reloadTemplates(), reloadFirms()]);
      showSuccess(`Custom template "${customTitle}" created and linked to ${activeFirm.name}.`);
      setCustomTitle("");
      setCustomCode("");
      setModalTab("maintained");
    } catch (err: any) {
      showError(err.message || "Failed to create custom template.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 shadow-2xs shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">
                New Template & Standards Provisioning
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Link compliance frameworks from default library or create a custom template for the firm.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Managing Firm / Choose Firm Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <label className="text-xs sm:text-sm font-bold text-slate-800 shrink-0">
            Managing Firm:
          </label>
          <div className="relative flex-1">
            <select
              value={activeFirm.id}
              onChange={(e) => setModalFirmId(e.target.value)}
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white shadow-2xs cursor-pointer appearance-none pr-10"
            >
              {firms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.code})
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
          <button
            onClick={() => setModalTab("library")}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              modalTab === "library"
                ? "bg-teal-700 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Default Template Library ({availableLibraryTemplates.length})
          </button>
          <button
            onClick={() => setModalTab("custom")}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              modalTab === "custom"
                ? "bg-teal-700 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            + Create New Custom Template
          </button>
          <button
            onClick={() => setModalTab("maintained")}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              modalTab === "maintained"
                ? "bg-teal-700 text-white shadow-xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Currently Maintained ({firmMaintainedTemplates.length})
          </button>
        </div>

        {/* TAB 1: Default Template Library */}
        {modalTab === "library" && (
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search standards (ISO 9001, 27001, WHO GMP, SOC 2, ISO 14001)..."
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-medium"
              />
            </div>

            {/* Standards List */}
            <div className="space-y-3 max-h-[48vh] overflow-y-auto pr-1">
              {isTemplatesLoading ? (
                <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Loading master compliance standards...</p>
                </div>
              ) : filteredLibrary.length === 0 ? (
                <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs sm:text-sm">
                  All default library standards are already linked to {activeFirm.name}, or none match your search.
                </div>
              ) : (
                filteredLibrary.map((tmpl) => {
                  const isLinkingThis = linkingId === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      className="p-4 bg-white hover:bg-teal-50/40 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 transition-all hover:border-teal-200"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-md">
                            {tmpl.standard}
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {tmpl.title}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {tmpl.sections.length} Sections • Passing Score: {tmpl.passingScore}%
                        </div>
                      </div>
                      <button
                        onClick={() => handleLinkToFirm(tmpl)}
                        disabled={isLinkingThis || isSubmitting}
                        className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs transition-colors disabled:opacity-50"
                      >
                        {isLinkingThis ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Linking...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Link to Firm</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Create New Custom Template */}
        {modalTab === "custom" && (
          <form onSubmit={handleCreateAndLink} className="space-y-5 max-h-[55vh] overflow-y-auto pr-1">
            {/* Template Title */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Template Title *
              </label>
              <input
                type="text"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. Supply Chain Quality & Information Security Standard"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
              />
            </div>

            {/* Standard Code */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Standard Code *
              </label>
              <input
                type="text"
                required
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="e.g. SC-SEC-2026"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl font-mono text-slate-700 focus:outline-none focus:border-teal-600"
              />
            </div>

            {/* Clauses & Checklist Structure */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    Clauses & Checklist Structure
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    Define verifiable sections, clause numbering, and compliance audit questions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Section</span>
                </button>
              </div>

              {/* Sections List */}
              <div className="space-y-4">
                {customSections.map((sec, sIdx) => (
                  <div
                    key={sec.id}
                    className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3"
                  >
                    {/* Section Header Row */}
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-teal-700 text-white font-bold text-[11px] rounded-lg shrink-0">
                        Sec {String(sIdx + 1).padStart(2, "0")}
                      </span>
                      <input
                        type="text"
                        value={sec.title}
                        onChange={(e) => handleSectionTitleChange(sIdx, e.target.value)}
                        placeholder="Section title..."
                        className="flex-1 px-3 py-1.5 text-xs sm:text-sm font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddClause(sIdx)}
                        className="px-3 py-1.5 bg-white hover:bg-teal-50 text-teal-700 border border-teal-200 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Clause</span>
                      </button>
                      {customSections.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(sIdx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                          title="Delete Section"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Clauses / Questions in Section */}
                    <div className="space-y-2 pl-2 sm:pl-4 border-l-2 border-teal-500/30">
                      {sec.questions.map((q, qIdx) => (
                        <div key={q.id} className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-white border border-slate-200 text-slate-700 font-mono text-[11px] font-bold rounded-lg shrink-0">
                            {q.requirementId}
                          </span>
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => handleClauseChange(sIdx, qIdx, e.target.value)}
                            placeholder="Enter requirement verification question..."
                            className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 text-slate-800"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveClause(sIdx, qIdx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer shrink-0"
                            title="Remove clause"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating & Linking...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Create & Link to {activeFirm.name}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-xl cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: Currently Maintained Templates */}
        {modalTab === "maintained" && (
          <div className="space-y-4">
            <div className="space-y-3 max-h-[48vh] overflow-y-auto pr-1">
              {isTemplatesLoading ? (
                <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Loading maintained templates...</p>
                </div>
              ) : filteredMaintained.length === 0 ? (
                <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs sm:text-sm">
                  No templates currently maintained or linked to {activeFirm.name}.
                </div>
              ) : (
                filteredMaintained.map((tmpl) => {
                  const isDeletingThis = deletingId === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      className="p-4 bg-teal-50/30 rounded-2xl border border-teal-200/80 flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-teal-800 bg-white border border-teal-200 px-2 py-0.5 rounded">
                            {tmpl.standard}
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {tmpl.title}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {tmpl.sections.length} Sections • Passing Score: {tmpl.passingScore}%
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTemplate(tmpl.id, tmpl.title)}
                        disabled={isDeletingThis}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 cursor-pointer transition-colors disabled:opacity-50"
                        title="Remove template"
                      >
                        {isDeletingThis ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-bold rounded-xl cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProvisionTemplateModal;
