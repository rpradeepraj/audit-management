"use client";

import React, { useState } from "react";
import { AuditTemplate, AuditFirm } from "../../shared/types/audit";
import {
  FileSpreadsheet,
  X,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";

interface ProvisionTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  firms: AuditFirm[];
  templates: AuditTemplate[];
  onAddTemplate: (tmpl: any) => string;
  onToggleFirmTemplate: (firmId: string, templateId: string) => void;
}

export const ProvisionTemplateModal: React.FC<ProvisionTemplateModalProps> = ({
  isOpen,
  onClose,
  firms,
  templates,
  onAddTemplate,
  onToggleFirmTemplate,
}) => {
  const [modalTab, setModalTab] = useState<"library" | "custom" | "maintained">("library");
  const [modalFirmId, setModalFirmId] = useState<string>(firms[0]?.id || "");
  const [modalSearch, setModalSearch] = useState("");

  // Custom template fields
  const [customTitle, setCustomTitle] = useState("");
  const [customStandard, setCustomStandard] = useState("");
  const [customIndustry, setCustomIndustry] = useState("Manufacturing & Quality");
  const [customPassingScore, setCustomPassingScore] = useState(80);
  const [customSections, setCustomSections] = useState<
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

  if (!isOpen) return null;

  const activeFirm = firms.find((f) => f.id === modalFirmId) || firms[0];
  const maintainedIds = activeFirm?.maintainedTemplateIds || [];

  const availableTemplates = templates.filter((t) => !maintainedIds.includes(t.id));
  const maintainedTemplates = templates.filter((t) => maintainedIds.includes(t.id));

  const filteredAvailable = availableTemplates.filter((t) => {
    if (!modalSearch.trim()) return true;
    const q = modalSearch.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.standard.toLowerCase().includes(q);
  });

  const filteredMaintained = maintainedTemplates.filter((t) => {
    if (!modalSearch.trim()) return true;
    const q = modalSearch.toLowerCase();
    return t.title.toLowerCase().includes(q) || t.standard.toLowerCase().includes(q);
  });

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customStandard.trim()) return;

    const newId = onAddTemplate({
      title: customTitle.trim(),
      code: `TMPL-${Date.now()}`,
      version: "1.0",
      standard: customStandard.trim(),
      industry: customIndustry.trim(),
      description: `Custom compliance template provisioned for ${activeFirm.name}`,
      sections: customSections.map((s) => ({
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
      passingScore: customPassingScore,
      isCustom: true,
      tags: ["Custom", customStandard.trim(), activeFirm.code],
    });

    onToggleFirmTemplate(activeFirm.id, newId);
    setCustomTitle("");
    setCustomStandard("");
    setModalTab("maintained");
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
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

        {/* Choose Firm Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">
            Managing Firm:
          </label>
          <select
            value={activeFirm.id}
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

        {/* Modal Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
          <button
            onClick={() => setModalTab("library")}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              modalTab === "library"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Default Template Library ({filteredAvailable.length})
          </button>
          <button
            onClick={() => setModalTab("custom")}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              modalTab === "custom"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            + Create New Custom Template
          </button>
          <button
            onClick={() => setModalTab("maintained")}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              modalTab === "maintained"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Currently Maintained ({filteredMaintained.length})
          </button>
        </div>

        {/* TAB 1: Library Standards */}
        {modalTab === "library" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search standards (ISO 9001, 27001, WHO GMP, SOC 2, ISO 14001)..."
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {filteredAvailable.length === 0 ? (
                <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs sm:text-sm">
                  All library standards are already maintained by {activeFirm.name}, or none match search.
                </div>
              ) : (
                filteredAvailable.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-white border border-indigo-200 px-2 py-0.5 rounded">
                          {t.standard}
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {t.title}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {t.sections.length} Sections • Passing Score: {t.passingScore}%
                      </div>
                    </div>
                    <button
                      onClick={() => onToggleFirmTemplate(activeFirm.id, t.id)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Link to Firm</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Custom Template Form */}
        {modalTab === "custom" && (
          <form onSubmit={handleCreateCustom} className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Template Title *
                </label>
                <input
                  type="text"
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Supply Chain Quality & Information Security Standard"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Standard Code / Identifier *
                </label>
                <input
                  type="text"
                  required
                  value={customStandard}
                  onChange={(e) => setCustomStandard(e.target.value)}
                  placeholder="e.g. ISO 28000:2022"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Provision & Save Template
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: Maintained Templates */}
        {modalTab === "maintained" && (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {filteredMaintained.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                No templates currently linked to {activeFirm.name}.
              </div>
            ) : (
              filteredMaintained.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900">{t.title}</div>
                    <div className="text-[11px] text-emerald-700 font-mono">{t.standard}</div>
                  </div>
                  <button
                    onClick={() => onToggleFirmTemplate(activeFirm.id, t.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    title="Remove from firm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
