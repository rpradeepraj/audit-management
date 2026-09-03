import React, { useState } from "react";
import { useAudit } from "../../context/AuditContext";
import { FindingSeverity, EvidenceAttachment } from "../../types/audit";
import { X, AlertTriangle, Upload, Paperclip, ShieldAlert, Check, Plus } from "lucide-react";

interface LogFindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAuditId?: string;
  defaultQuestionId?: string;
  defaultRequirementId?: string;
  defaultNotes?: string;
}

export const LogFindingModal: React.FC<LogFindingModalProps> = ({
  isOpen,
  onClose,
  defaultAuditId,
  defaultQuestionId,
  defaultRequirementId,
  defaultNotes,
}) => {
  const { audits, customers, currentUser, addFinding } = useAudit();

  const [selectedAuditId, setSelectedAuditId] = useState(defaultAuditId || (audits[0]?.id || ""));
  const [title, setTitle] = useState("");
  const [requirementId, setRequirementId] = useState(defaultRequirementId || "ISO 9001: Clause 8.1");
  const [severity, setSeverity] = useState<FindingSeverity>("Major");
  const [category, setCategory] = useState("Operational Control & Quality");
  const [description, setDescription] = useState(defaultNotes || "");
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [attachments, setAttachments] = useState<EvidenceAttachment[]>([]);

  if (!isOpen) return null;

  const currentAudit = audits.find((a) => a.id === selectedAuditId);
  const currentCustomer = currentAudit
    ? customers.find((c) => c.id === currentAudit.customerId)
    : customers[0];

  const handleSimulateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const newAttachment: EvidenceAttachment = {
      id: `ev_${Date.now()}`,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      fileType: file.type || "application/pdf",
      uploadedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      uploadedBy: currentUser.name,
      description: "Non-conformity photo/record evidence",
    };
    setAttachments((prev) => [...prev, newAttachment]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Please fill in finding title and description.");
      return;
    }

    if (!currentAudit || !currentCustomer) {
      alert("Please select a valid audit.");
      return;
    }

    addFinding({
      auditId: currentAudit.id,
      auditNumber: currentAudit.auditNumber,
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      questionId: defaultQuestionId,
      requirementId: requirementId || "General Requirement",
      title,
      description,
      evidenceNotes,
      severity,
      status: "Open",
      category,
      dueDate,
      assignedToCustomerRepId: currentAudit.customerRepId || "usr_cust_rep",
      assignedToCustomerRepName: currentAudit.customerRepName || currentCustomer.contactPerson,
      loggedByAuditorName: currentUser.name,
      evidenceAttachments: attachments,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full p-6 sm:p-8 space-y-5 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs shrink-0">
              <AlertTriangle className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">
                Log Audit Finding / Non-Conformity
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Record deviation against compliance criteria with objective evidence and remediation targets
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

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Linked Audit & Customer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Audit
              </label>
              <select
                value={selectedAuditId}
                onChange={(e) => setSelectedAuditId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
              >
                {audits.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.auditNumber} - {a.customerName} ({a.standard})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Standard / Requirement Clause
              </label>
              <input
                type="text"
                value={requirementId}
                onChange={(e) => setRequirementId(e.target.value)}
                placeholder="e.g., ISO 9001: Clause 7.1.5"
                required
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Finding Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Finding Summary Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Incomplete Secondary Sign-offs on Cold-Chain Temperature Logs"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>

          {/* Severity & Category & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Severity Level *
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as FindingSeverity)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
              >
                <option value="Critical">Critical Non-Conformity</option>
                <option value="Major">Major Non-Conformity</option>
                <option value="Minor">Minor Non-Conformity</option>
                <option value="Observation">Observation / OFI</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
              >
                <option value="Operational Control & Quality">Operational Control</option>
                <option value="Access Control & Identity">Access Control</option>
                <option value="Document & Version Control">Document Control</option>
                <option value="Incident & Change Management">Incident Management</option>
                <option value="Data Integrity & Records">Data Integrity</option>
                <option value="Health, Safety & Environment">Health & Safety</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Remediation Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
                required
              />
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Detailed Observation / Non-Conformity Statement *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe exact circumstances, location, sampled batches/records, and discrepancy from specified procedure..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 leading-relaxed focus:outline-none focus:border-indigo-500 shadow-2xs"
              required
            />
          </div>

          {/* Evidence Notes & Attachments */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Objective Evidence Notes
            </label>
            <textarea
              rows={2}
              value={evidenceNotes}
              onChange={(e) => setEvidenceNotes(e.target.value)}
              placeholder="Record document reference numbers, photo IDs, timestamps, or interviewed personnel..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>

          {/* Attach Evidence Documents / Photos */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                <span>Evidence Documents & Photos ({attachments.length})</span>
              </span>
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg cursor-pointer border border-slate-200 transition-colors shadow-2xs">
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span>Upload File</span>
                <input
                  type="file"
                  onChange={handleSimulateFileUpload}
                  className="hidden"
                  accept="image/*,application/pdf,.doc,.docx"
                />
              </label>
            </div>

            {/* List attached files */}
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs shadow-2xs"
                  >
                    <div className="flex items-center gap-2 text-slate-700 font-medium truncate">
                      <Paperclip className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="truncate">{att.fileName}</span>
                      <span className="text-slate-400 text-xs">({att.fileSize})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                      className="text-slate-400 hover:text-rose-600 text-sm font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Buttons */}
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
              <Plus className="w-4 h-4" />
              <span>Log Non-Conformity</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
