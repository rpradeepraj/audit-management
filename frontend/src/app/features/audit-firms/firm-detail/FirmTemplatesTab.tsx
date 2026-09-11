"use client";

import React, { useState } from "react";
import { AuditFirm, AuditTemplate } from "../../../shared/types/audit";
import { useAudit } from "../../../shared/context";
import {
  FileSpreadsheet,
  Search,
  Plus,
  Table,
  LayoutGrid,
  CheckCircle2,
  Trash2,
  Loader2,
} from "lucide-react";
import { ProvisionTemplateModal } from "../../templates/ProvisionTemplateModal";

interface FirmTemplatesTabProps {
  firm: AuditFirm;
  templates: AuditTemplate[];
  onToggleTemplate?: (firmId: string, templateId: string) => void;
  onNavigateToTemplates?: () => void;
}

export const FirmTemplatesTab: React.FC<FirmTemplatesTabProps> = ({
  firm,
  templates,
}) => {
  const {
    firms,
    addTemplate,
    toggleFirmTemplate,
    deleteTemplate,
    reloadTemplates,
    reloadFirms,
    isTemplatesLoading,
    isFirmsLoading,
    showSuccess,
    showError,
  } = useAudit();

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const maintainedIds = firm.maintainedTemplateIds || [];
  const maintainedTemplates = templates.filter((t) => maintainedIds.includes(t.id));

  const filteredTemplates = maintainedTemplates.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.standard.toLowerCase().includes(q) ||
      t.name?.toLowerCase().includes(q) ||
      t.industry.toLowerCase().includes(q)
    );
  });

  const handleRemoveTemplate = async (templateId: string, title: string) => {
    setDeletingId(templateId);
    try {
      await deleteTemplate(templateId);
      await Promise.all([reloadTemplates(), reloadFirms()]);
      showSuccess(`Template "${title}" removed successfully.`);
    } catch (err: any) {
      showError(err.message || "Failed to remove template.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Templates Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search maintained audit templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          <span className="text-xs font-bold text-slate-500">
            {maintainedTemplates.length} Maintained Standards
          </span>

          {/* View Mode Toggle (Table / Grid) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-indigo-600 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table View"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-indigo-600 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsProvisionModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Template</span>
          </button>
        </div>
      </div>

      {/* Main Listing View (Table or Grid) */}
      {isTemplatesLoading || isFirmsLoading ? (
        <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-3 shadow-xs">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">Loading Maintained Templates...</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Fetching active templates linked to {firm.name}.
          </p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center space-y-3">
          <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">
            {search.trim() ? "No Matching Templates" : "No Maintained Templates Yet"}
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search.trim()
              ? "No maintained audit standards match your filter query."
              : `Link standards from the master compliance library or create a custom checklist for ${firm.name}.`}
          </p>
          {!search.trim() && (
            <button
              onClick={() => setIsProvisionModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Link or Create Template</span>
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* High-Density Table View */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Standard & Framework</th>
                  <th className="py-3 px-4">Template Title</th>
                  <th className="py-3 px-4">Scope / Clauses</th>
                  <th className="py-3 px-4">Passing Score</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTemplates.map((t) => {
                  const totalQuestions = t.sections.reduce((acc, s) => acc + s.questions.length, 0);
                  const isDeletingThis = deletingId === t.id;

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                            {t.standard}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">v{t.version}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{t.title}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-sm mt-0.5">
                          {t.description}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-semibold text-slate-800">{t.sections.length} Sections</span>
                        <span className="text-slate-400 mx-1.5">•</span>
                        <span>{totalQuestions} Clauses</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {t.passingScore}%
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Maintained
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleRemoveTemplate(t.id, t.title)}
                          disabled={isDeletingThis}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
                          title="Remove template from firm"
                        >
                          {isDeletingThis ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full">
          {filteredTemplates.map((t) => {
            const totalQuestions = t.sections.reduce((acc, s) => acc + s.questions.length, 0);
            const isDeletingThis = deletingId === t.id;

            return (
              <div
                key={t.id}
                className="bg-white border border-indigo-200 ring-1 ring-indigo-200/50 rounded-2xl p-4 shadow-xs flex flex-col justify-between transition-all space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                      {t.standard}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      v{t.version}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                    {t.title}
                  </h4>

                  <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-3">
                    <span>{t.sections.length} Sections</span>
                    <span>•</span>
                    <span>{totalQuestions} Checklist Clauses</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {t.passingScore}% Pass
                  </span>

                  <button
                    onClick={() => handleRemoveTemplate(t.id, t.title)}
                    disabled={isDeletingThis}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    title="Remove template from firm"
                  >
                    {isDeletingThis ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Template & Standards Provisioning Popup */}
      <ProvisionTemplateModal
        isOpen={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
        firms={firms}
        templates={templates}
        onAddTemplate={addTemplate}
        onToggleFirmTemplate={toggleFirmTemplate}
      />
    </div>
  );
};

export default FirmTemplatesTab;
