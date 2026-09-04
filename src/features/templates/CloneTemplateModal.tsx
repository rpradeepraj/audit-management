"use client";

import React, { useState, useEffect } from "react";
import { AuditTemplate } from "../../shared/types/audit";
import { Copy, X } from "lucide-react";

interface CloneTemplateModalProps {
  template: AuditTemplate;
  onClose: () => void;
  onClone: (templateId: string, customTitle?: string) => void;
}

export const CloneTemplateModal: React.FC<CloneTemplateModalProps> = ({
  template,
  onClose,
  onClone,
}) => {
  const [cloneTitle, setCloneTitle] = useState("");

  useEffect(() => {
    if (template) {
      setCloneTitle(`${template.title} (Clone)`);
    }
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClone(template.id, cloneTitle.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs shrink-0">
              <Copy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Clone Checklist Template</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">{template.standard}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              New Template Title *
            </label>
            <input
              type="text"
              required
              value={cloneTitle}
              onChange={(e) => setCloneTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-slate-900"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 transition-colors cursor-pointer"
            >
              Create Clone
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
