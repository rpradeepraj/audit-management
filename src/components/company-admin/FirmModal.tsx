import React, { useState, useEffect } from "react";
import { AuditFirm } from "../../types/audit";
import { Building2, X, Shield, Award } from "lucide-react";

interface FirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (firmData: Omit<AuditFirm, "id" | "createdAt">, editingId?: string) => void;
  editingFirm?: AuditFirm | null;
}

export const FirmModal: React.FC<FirmModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingFirm,
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [accreditationNumber, setAccreditationNumber] = useState("");
  const [accreditationStandard, setAccreditationStandard] = useState("");
  const [industryScope, setIndustryScope] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [establishedYear, setEstablishedYear] = useState("");
  const [qualityPolicy, setQualityPolicy] = useState("");
  const [status, setStatus] = useState<"Active" | "Pending Accreditation" | "Suspended">("Active");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editingFirm) {
      setName(editingFirm.name);
      setCode(editingFirm.code);
      setAccreditationNumber(editingFirm.accreditationNumber);
      setAccreditationStandard(editingFirm.accreditationStandard);
      setIndustryScope(editingFirm.industryScope);
      setContactEmail(editingFirm.contactEmail);
      setPhone(editingFirm.phone);
      setAddress(editingFirm.address);
      setWebsite(editingFirm.website);
      setEstablishedYear(editingFirm.establishedYear);
      setQualityPolicy(editingFirm.qualityPolicy);
      setStatus(editingFirm.status || "Active");
      setNotes(editingFirm.notes || "");
    } else {
      setName("");
      setCode("");
      setAccreditationNumber("");
      setAccreditationStandard("ISO/IEC 17021-1:2015 & ISO 19011:2018");
      setIndustryScope("");
      setContactEmail("");
      setPhone("");
      setAddress("");
      setWebsite("https://");
      setEstablishedYear(new Date().getFullYear().toString());
      setQualityPolicy(
        "Committed to rigorous conformity assessments, impartiality, and evidence-backed surveillance audits."
      );
      setStatus("Active");
      setNotes("");
    }
  }, [editingFirm, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const initials =
      name
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "AF";

    onSave(
      {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        accreditationNumber: accreditationNumber.trim(),
        accreditationStandard: accreditationStandard.trim(),
        industryScope: industryScope.trim(),
        contactEmail: contactEmail.trim(),
        phone: phone.trim(),
        address: address.trim(),
        website: website.trim(),
        establishedYear: establishedYear.trim(),
        qualityPolicy: qualityPolicy.trim(),
        status,
        notes: notes.trim(),
        logoInitials: initials,
        maintainedTemplateIds: editingFirm
          ? editingFirm.maintainedTemplateIds
          : [
              "tmpl_ind_mfg_9001",
              "tmpl_ind_tech_27001",
              "tmpl_ind_soc2",
            ],
      },
      editingFirm?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">
                {editingFirm ? "Edit Audit Firm Details" : "Register New Audit Firm"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {editingFirm
                  ? "Update accredited body credentials and governance metadata."
                  : "Add an accredited conformity assessment body to the platform."}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Firm Legal Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Global Certification"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Firm Code / Identifier *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AGC-GLOBAL"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Accreditation Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ANAB-CB-2026-9901"
                value={accreditationNumber}
                onChange={(e) => setAccreditationNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Accreditation Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
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
              placeholder="e.g. ISO/IEC 17021-1:2015 & ISO 19011:2018"
              value={accreditationStandard}
              onChange={(e) => setAccreditationStandard(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Industry Scope of Surveillance
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Industrial Manufacturing, Medical Devices, Cloud Security, Automotive..."
              value={industryScope}
              onChange={(e) => setIndustryScope(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Governance Email *
              </label>
              <input
                type="email"
                required
                placeholder="governance@firm.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Contact
              </label>
              <input
                type="text"
                placeholder="+1 (800) 555-AUDIT"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Website
              </label>
              <input
                type="text"
                placeholder="https://www.firm.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Established Year
              </label>
              <input
                type="text"
                placeholder="2018"
                value={establishedYear}
                onChange={(e) => setEstablishedYear(e.target.value)}
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
              placeholder="Address, City, Country"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Quality & Impartiality Policy
            </label>
            <textarea
              rows={2}
              placeholder="Firm statement on independence and compliance..."
              value={qualityPolicy}
              onChange={(e) => setQualityPolicy(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white"
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
              <span>{editingFirm ? "Save Changes" : "Register Firm"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
