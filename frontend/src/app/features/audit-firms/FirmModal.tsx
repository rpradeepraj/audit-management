"use client";

import React, { useState, useEffect } from "react";
import { AuditFirm } from "../../shared/types/audit";
import { Building2, X, Shield, Award, ChevronDown, Search, Check, Loader2 } from "lucide-react";

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

export const parseIndustryScopeString = (
  rawScope?: string | null,
  knownOptions: string[] = INDUSTRY_SCOPE_OPTIONS
): string[] => {
  if (!rawScope || !rawScope.trim()) return [];

  let remaining = rawScope.trim();
  const matched: string[] = [];

  // Sort known options by length descending to match longer strings first (e.g. ones with internal commas)
  const sortedOptions = [...knownOptions].sort((a, b) => b.length - a.length);

  for (const option of sortedOptions) {
    if (remaining.includes(option)) {
      matched.push(option);
      remaining = remaining.split(option).join(";;");
    }
  }

  // Split any remaining unmapped tokens by comma or semicolon
  const leftovers = remaining
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const item of leftovers) {
    if (!matched.includes(item)) {
      matched.push(item);
    }
  }

  return matched;
};

interface FirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (firmData: Omit<AuditFirm, "id" | "createdAt">, editingId?: string) => Promise<void> | void;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setIsSubmitting(false);
    if (editingFirm) {
      setName(editingFirm.name || "");
      setCode(editingFirm.code || "");
      setAccreditationNumber(editingFirm.accreditationNumber || "");
      setAccreditationStandard(editingFirm.accreditationStandard || "");
      setIndustryScope(editingFirm.industryScope || "");
      const parsedScopes = parseIndustryScopeString(editingFirm.industryScope);
      setSelectedScopes(parsedScopes);
      setContactEmail(editingFirm.contactEmail || "");
      setPhone(editingFirm.phone || "");
      setAddress(editingFirm.address || "");
      setWebsite(editingFirm.website || "");
      setEstablishedYear(editingFirm.establishedYear || "");
      setQualityPolicy(editingFirm.qualityPolicy || "");
      setStatus(editingFirm.status || "Active");
      setNotes(editingFirm.notes || "");
    } else {
      setName("");
      setCode("");
      setAccreditationNumber("");
      setAccreditationStandard("");
      setIndustryScope("");
      setSelectedScopes([]);
      setContactEmail("");
      setPhone("");
      setAddress("");
      setWebsite("");
      setEstablishedYear("");
      setQualityPolicy("");
      setStatus("Active");
      setNotes("");
    }
  }, [editingFirm, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || isSubmitting) return;

    const initials =
      name
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "AF";

    setIsSubmitting(true);
    try {
      await onSave(
        {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          accreditationNumber: accreditationNumber.trim() || (editingFirm ? editingFirm.accreditationNumber : ""),
          accreditationStandard: accreditationStandard.trim() || (editingFirm ? editingFirm.accreditationStandard : ""),
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
          maintainedTemplateIds: editingFirm ? editingFirm.maintainedTemplateIds : [],
        },
        editingFirm?.id
      );
      onClose();
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
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
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  {selectedScopes.length} Selected
                </span>
              </div>

              {/* Multi-Select Dropdown Trigger */}
              <div className="relative" ref={scopeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsScopeDropdownOpen((prev) => !prev)}
                  className="w-full min-h-[42px] px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 font-medium text-left flex items-center justify-between gap-2 hover:bg-slate-100/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
                    {selectedScopes.length === 0 ? (
                      <span className="text-slate-400">Select industry domains and sectors...</span>
                    ) : (
                      selectedScopes.map((scope) => (
                        <span
                          key={scope}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-semibold"
                        >
                          <span>{scope}</span>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedScopes((prev) => prev.filter((s) => s !== scope));
                            }}
                            className="hover:text-teal-900 cursor-pointer font-bold text-xs"
                          >
                            ×
                          </span>
                        </span>
                      ))
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                    <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded">
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
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    {/* Quick select buttons */}
                    <div className="flex items-center justify-between pt-1 pb-1 border-b border-slate-100 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setSelectedScopes([...INDUSTRY_SCOPE_OPTIONS])}
                        className="text-teal-700 hover:text-teal-900 font-bold cursor-pointer"
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
                      {Array.from(new Set([...INDUSTRY_SCOPE_OPTIONS, ...selectedScopes]))
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
                                  ? "bg-teal-50/80 border border-teal-200"
                                  : "hover:bg-slate-50 border border-transparent"
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center text-xs shrink-0 border ${
                                  isSelected
                                    ? "bg-teal-600 border-teal-600 text-white"
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
                            className="w-full text-left p-2 rounded-lg bg-teal-50/60 hover:bg-teal-100/80 text-teal-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
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
              disabled={isSubmitting}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                isSubmitting ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {isSubmitting
                  ? editingFirm
                    ? "Saving Changes..."
                    : "Registering Firm..."
                  : editingFirm
                  ? "Save Changes"
                  : "Register Firm"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
