"use client";

import React, { useState } from "react";
import { useAudit } from "../../context/AuditContext";
import { EvidenceAttachment } from "../../types/audit";
import { X, Upload, Paperclip, Camera, FileText, Check } from "lucide-react";

interface EvidenceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  onAddAttachment: (attachment: EvidenceAttachment) => void;
}

export const EvidenceUploadModal: React.FC<EvidenceUploadModalProps> = ({
  isOpen,
  onClose,
  title = "Attach Audit Evidence Document / Photo",
  onAddAttachment,
}) => {
  const { currentUser } = useAudit();
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("application/pdf");
  const [description, setDescription] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);
      setFileType(file.type || "application/pdf");
    }
  };

  const handleSampleSelect = (name: string, type: string) => {
    setFileName(name);
    setFileType(type);
    setSelectedFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) {
      alert("Please choose a file or enter an evidence document name.");
      return;
    }

    const newAttachment: EvidenceAttachment = {
      id: `ev_${Date.now()}`,
      fileName: fileName.trim(),
      fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : "1.45 MB",
      fileType,
      uploadedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      uploadedBy: currentUser.name,
      description: description || "Verified physical inspection record",
    };

    onAddAttachment(newAttachment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">{title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Secure cryptographic attachment upload for audit trail & objective verification
              </p>
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
          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                setSelectedFile(file);
                setFileName(file.name);
                setFileType(file.type || "application/pdf");
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
              isDragOver
                ? "border-indigo-500 bg-indigo-50/50"
                : "border-slate-300 hover:border-indigo-400 bg-slate-50/50"
            }`}
            onClick={() => document.getElementById("evidence-file-input")?.click()}
          >
            <input
              id="evidence-file-input"
              type="file"
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx"
            />
            <div className="w-12 h-12 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center mx-auto mb-2.5">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-800">
              Click to browse or drop file here
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports PDF, PNG, JPG, DOCX, XLSX up to 25MB
            </p>
            {selectedFile && (
              <div className="mt-3 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
                <Check className="w-3.5 h-3.5" />
                <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Evidence Document Title / Description *
            </label>
            <input
              type="text"
              required
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g. Cleanroom Calibration Certificate 2026.pdf"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Inspection Notes / Clause Cross-Reference
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Scanned copy of external audit sign-off sheet verified on site."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-indigo-500 font-medium resize-none"
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
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Paperclip className="w-3.5 h-3.5" />
              <span>Attach Evidence</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
