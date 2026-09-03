import React, { useState, useEffect } from "react";
import { AuditFirm } from "../../types/audit";
import { Building2, X, Shield, Award, ChevronDown, Search, Check } from "lucide-react";

export const INDUSTRY_SCOPE_OPTIONS = [
  "Information Security & Cybersecurity",
  "Healthcare, Medical Devices & Life Sciences",
  "Aerospace & Defense",
  "Automotive & Transportation",
  "Pharmaceuticals & Biotechnology",
  "Energy, Oil & Gas",
  "Environmental Management & Sustainability",
  "Food Safety & Agriculture",
  "Financial Services & Banking",
  "Manufacturing & Industrial Engineering",
  "Chemical & Materials Processing",
  "Logistics & Supply Chain",
];

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
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [isScopeDropdownOpen, setIsScopeDropdownOpen] = useState(false);
  const [scopeSearchQuery, setScopeSearchQuery] = useState("");
  const scopeDropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        scopeDropdownRef.current &&
        !scopeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsScopeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
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
      const parsedScopes = (editingFirm.industryScope || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      setSelectedScopes(parsedScopes);
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
      setSelectedScopes(["Manufacturing & Industrial Engineering", "Information Security & Cybersecurity"]);
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
        accreditationNumber: accreditationNumber.trim() || (editingFirm ? editingFirm.accreditationNumber : "ANAB-CB-2026"),
        accreditationStandard: accreditationStandard.trim() || (editingFirm ? editingFirm.accreditationStandard : "ISO/IEC 17021-1:2015 & ISO 19011:2018"),
        industryScope: (selectedScopes.length > 0 ? selectedScopes.join(", ") : industryScope).trim(),
        contactEmail: contactEmail.trim(),
        phone: phone.trim(),
        address: address.trim(),
        website: website.trim(),
        establishedYear: establishedYear.trim(),
        qualityPolicy: qualityPolicy.trim(),
        status: status || "Active",
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Industry Scope of Surveillance (Multi-Select)
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {selectedScopes.length} Selected
                </span>
              </div>

              {/* Multi-Select Dropdown Trigger */}
              <div className="relative" ref={scopeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsScopeDropdownOpen((prev) => !prev)}
                  className="w-full min-h-[40px] px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-left flex items-center justify-between gap-2 hover:bg-slate-100/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                    {selectedScopes.length === 0 ? (
                      <span className="text-slate-400">Select industry domains and sectors...</span>
                    ) : (
                      <span className="text-slate-800 font-semibold truncate">
                        {selectedScopes.join(", ")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">
                      {selectedScopes.length}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isScopeDropdownOpen ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {/* Dropdown Popover */}
                {isScopeDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-3 space-y-2 max-h-64 overflow-y-auto">
                    {/* Search inside dropdown */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search or add industry domain..."
                        value={scopeSearchQuery}
                        onChange={(e) => setScopeSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && scopeSearchQuery.trim()) {
                            e.preventDefault();
                            if (!selectedScopes.includes(scopeSearchQuery.trim())) {
                              setSelectedScopes([...selectedScopes, scopeSearchQuery.trim()]);
                            }
                            setScopeSearchQuery("");
                          }
                        }}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Quick select buttons */}
                    <div className="flex items-center justify-between pt-1 pb-1 border-b border-slate-100 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setSelectedScopes([...INDUSTRY_SCOPE_OPTIONS])}
                        className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedScopes([])}
                        className="text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>

                    {/* Options list */}
                    <div className="space-y-1">
                      {INDUSTRY_SCOPE_OPTIONS
                        .filter((item) =>
                          item.toLowerCase().includes(scopeSearchQuery.toLowerCase())
                        )
                        .map((item) => {
                          const isSelected = selectedScopes.includes(item);
                          return (
                            <div
                              key={item}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedScopes(selectedScopes.filter((s) => s !== item));
                                } else {
                                  setSelectedScopes([...selectedScopes, item]);
                                }
                              }}
                              className={`p-2 rounded-lg flex items-center gap-2.5 cursor-pointer transition-colors ${
                                isSelected
                                  ? "bg-indigo-50/80 border border-indigo-200"
                                  : "hover:bg-slate-50 border border-transparent"
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center text-xs shrink-0 border ${
                                  isSelected
                                    ? "bg-indigo-600 border-indigo-600 text-white"
                                    : "border-slate-300 bg-white"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="font-semibold text-xs text-slate-800">{item}</span>
                            </div>
                          );
                        })}

                      {/* Option to add custom query if not already in list */}
                      {scopeSearchQuery.trim() &&
                        !INDUSTRY_SCOPE_OPTIONS.some(
                          (o) => o.toLowerCase() === scopeSearchQuery.trim().toLowerCase()
                        ) && (
                          <button
                            type="button"
                            onClick={() => {
                              if (!selectedScopes.includes(scopeSearchQuery.trim())) {
                                setSelectedScopes([...selectedScopes, scopeSearchQuery.trim()]);
                              }
                              setScopeSearchQuery("");
                            }}
                            className="w-full text-left p-2 rounded-lg bg-indigo-50/60 hover:bg-indigo-100/80 text-indigo-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>+ Add &quot;{scopeSearchQuery.trim()}&quot; as custom scope</span>
                          </button>
                        )}
                    </div>
                  </div>
                )}
              </div>
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
