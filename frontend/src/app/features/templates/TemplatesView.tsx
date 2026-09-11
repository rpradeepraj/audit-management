"use client";

import React, { useState, useEffect } from "react";
import { useAudit } from "../../shared/context/AuditContext";
import { AuditTemplate } from "../../shared/types/audit";
import { ChecklistScreen } from "./ChecklistScreen";
import {
  FileSpreadsheet,
  Plus,
  Search,
  CheckCircle2,
  Copy,
  Table,
  LayoutGrid,
  CalendarCheck2,
  BookOpen,
  Sparkles,
  Loader2,
} from "lucide-react";
import { ProvisionTemplateModal } from "./ProvisionTemplateModal";
import { CloneTemplateModal } from "./CloneTemplateModal";

interface TemplatesViewProps {
  onOpenAiGenerator?: () => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  onOpenAiGenerator,
}) => {
  const {
    templates,
    firms,
    toggleFirmTemplate,
    addTemplate,
    cloneTemplate,
    deleteTemplate,
    reloadTemplates,
    isTemplatesLoading,
    showSuccess,
    showError,
    setActiveTab,
    setActiveTemplateId,
    searchQuery,
    setSearchQuery,
  } = useAudit();

  useEffect(() => {
    reloadTemplates("all");
  }, [reloadTemplates]);

  const [activeFilterTab, setActiveFilterTab] = useState<"default" | "all" | "custom">("default");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [templateToClone, setTemplateToClone] = useState<AuditTemplate | null>(null);

  // Filter templates
  const filteredTemplates = templates.filter((tmpl) => {
    if (activeFilterTab === "default" && !tmpl.isDefaultIndustryTemplate) return false;
    if (activeFilterTab === "custom" && tmpl.isDefaultIndustryTemplate) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = tmpl.title.toLowerCase().includes(q);
      const matchStandard = tmpl.standard.toLowerCase().includes(q);
      const matchIndustry = tmpl.industry.toLowerCase().includes(q);
      const matchTags = tmpl.tags?.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchStandard || matchIndustry || matchTags;
    }
    return true;
  });

  const handleUseInAuditPlan = (tmpl: AuditTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTemplateId(tmpl.id);
    setActiveTab("planning");
  };

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  // If a template is selected, show full checklist editor/viewer screen
  if (selectedTemplate) {
    return (
      <ChecklistScreen
        template={selectedTemplate}
        onBack={() => setSelectedTemplateId(null)}
        onPlanAudit={(tmpl) => {
          setActiveTemplateId(tmpl.id);
          setActiveTab("planning");
        }}
        onCloneTemplate={(tmpl) => setTemplateToClone(tmpl)}
      />
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header & Provisioning Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Audit Templates & Standards Library
            </h1>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
              {templates.length} Active Standards
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            ISO, GMP, SOC 2, and customized industry standard compliance checklists with scoring frameworks.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenAiGenerator && (
            <button
              onClick={onOpenAiGenerator}
              className="px-3.5 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Standard Assistant</span>
            </button>
          )}

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Standard / Template</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Filter Tabs, Search & View Modes */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search standard (e.g. ISO 9001, GMP, SOC 2)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Pills and View Mode */}
        <div className="flex items-center gap-2.5 justify-between lg:justify-end flex-wrap">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveFilterTab("default")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilterTab === "default"
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Default Library ({templates.filter((t) => t.isDefaultIndustryTemplate).length})
            </button>
            <button
              onClick={() => setActiveFilterTab("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilterTab === "all"
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Standards ({templates.length})
            </button>
            <button
              onClick={() => setActiveFilterTab("custom")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilterTab === "custom"
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Custom ({templates.filter((t) => !t.isDefaultIndustryTemplate).length})
            </button>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "table" ? "bg-white text-indigo-700 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table View"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-white text-indigo-700 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Listing Display */}
      {isTemplatesLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-xs">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">Loading Compliance Standards Library...</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Fetching global default standards, clauses, and custom firm templates from database.
          </p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 text-sm">No Template Standards Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or filter criteria.</p>
        </div>
      ) : viewMode === "table" ? (
        /* High-Density Table View */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Standard & Framework</th>
                <th className="py-3.5 px-4">Scope & Checklist Title</th>
                <th className="py-3.5 px-4">Clauses</th>
                <th className="py-3.5 px-4">Passing Score</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTemplates.map((tmpl) => {
                const questionsCount = tmpl.sections.reduce(
                  (acc, s) => acc + s.questions.length,
                  0
                );

                return (
                  <tr
                    key={tmpl.id}
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                          {tmpl.standard}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">v{tmpl.version}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{tmpl.title}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-md mt-0.5">
                        {tmpl.description}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">
                        {tmpl.sections.length} Sec • {questionsCount} Clauses
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {tmpl.passingScore}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setTemplateToClone(tmpl)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Clone Standard"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedTemplateId(tmpl.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                        >
                          Checklist
                        </button>
                        <button
                          onClick={(e) => handleUseInAuditPlan(tmpl, e)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          Plan Audit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((tmpl) => {
            const questionsCount = tmpl.sections.reduce(
              (acc, s) => acc + s.questions.length,
              0
            );

            return (
              <div
                key={tmpl.id}
                onClick={() => setSelectedTemplateId(tmpl.id)}
                className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                      {tmpl.standard}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {tmpl.passingScore}% Pass
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {tmpl.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {tmpl.description}
                  </p>

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
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                    <span>Checklist</span>
                  </button>
                  <button
                    onClick={(e) => handleUseInAuditPlan(tmpl, e)}
                    className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
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

      {/* Provision Template Modal */}
      <ProvisionTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        firms={firms}
        templates={templates}
        onAddTemplate={addTemplate}
        onToggleFirmTemplate={toggleFirmTemplate}
      />

      {/* Clone Template Modal */}
      {templateToClone && (
        <CloneTemplateModal
          template={templateToClone}
          onClose={() => setTemplateToClone(null)}
          onClone={async (templateId, title) => {
            try {
              await cloneTemplate(templateId, title);
              await reloadTemplates("all");
              showSuccess(`Template "${title || templateToClone.title}" cloned successfully.`);
            } catch (err: any) {
              showError(err.message || "Failed to clone template standard.");
            }
          }}
        />
      )}
    </div>
  );
};
