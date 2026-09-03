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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
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
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
              isDragOver
                ? "border-indigo-500 bg-indigo-50/80 scale-[1.01]"
                : "border-slate-300 bg-slate-50/80 hover:bg-slate-100/70"
            }`}
          >
            <Upload className="w-9 h-9 text-indigo-500 mx-auto mb-2" />
            <div className="font-bold text-slate-800 text-sm">
              Drag & Drop evidence files here, or{" "}
              <label className="text-indigo-600 hover:text-indigo-700 cursor-pointer underline font-bold">
                browse filesystem
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,application/pdf,.doc,.docx,.xlsx"
                />
              </label>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Supports PDF, High-Res PNG/JPG, Signed DOCX, Audit XLSX spreadsheets (Max 50MB)
            </p>
          </div>

          {/* Quick presets for audit testing */}
          <div>
            <span className="text-xs font-bold text-slate-600 block mb-1.5">
              Quick Audit Evidence Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "Calibration_Certificate_2026.pdf", type: "application/pdf" },
                { name: "Bay4_ColdStorage_Temperature_Photo.jpg", type: "image/jpeg" },
                { name: "Management_Review_Signed_Minutes.pdf", type: "application/pdf" },
                { name: "Okta_MFA_Enforcement_Policy.png", type: "image/png" },
              ].map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => handleSampleSelect(sample.name, sample.type)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                    fileName === sample.name
                      ? "bg-indigo-50 text-indigo-700 border-indigo-300 font-bold shadow-2xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>

          {/* File Name & Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              File / Document Name *
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g. Cleanroom_Settling_Plate_Incubation_Log.pdf"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Notes & Traceability Details
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context, batch number, equipment ID, or witness statement..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
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
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Attach Evidence</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
