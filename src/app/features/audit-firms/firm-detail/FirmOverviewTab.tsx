"use client";

import React, { useState } from "react";
import { AuditFirm } from "../../../shared/types/audit";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Save,
  Check,
} from "lucide-react";
import { MultiSelectDropdown } from "../../../shared/components/ui";
import { INDUSTRY_SCOPE_OPTIONS, parseIndustryScopeString } from "../FirmModal";

interface FirmOverviewTabProps {
  firm: AuditFirm;
  onUpdateFirm: (id: string, updates: Partial<AuditFirm>) => void;
}

export const FirmOverviewTab: React.FC<FirmOverviewTabProps> = ({
  firm,
  onUpdateFirm,
}) => {
  const [profileForm, setProfileForm] = useState<AuditFirm>(firm);
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    if (firm) setProfileForm(firm);
  }, [firm]);

  const currentScopes = parseIndustryScopeString(profileForm.industryScope);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateFirm(firm.id, profileForm);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Certification Agency
            </div>
            <div className="text-base font-black text-slate-900 mt-0.5">{firm.name}</div>
            <div className="text-xs text-indigo-600 font-semibold">{firm.code}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Governance Contact
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">{firm.contactEmail}</div>
            <div className="text-xs text-slate-500">{firm.phone || "No phone listed"}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Headquarters
            </div>
            <div className="text-xs font-bold text-slate-900 mt-0.5 line-clamp-1">
              {firm.address || "No address listed"}
            </div>
            <div className="text-[11px] text-slate-500">
              {firm.establishedYear ? `Est. ${firm.establishedYear}` : "No year recorded"}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Firm Profile & Accreditation Settings</h3>
            <p className="text-xs text-slate-500">Update agency details and surveillance domains</p>
          </div>
          {savedSuccess && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Saved Successfully</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Audit Firm Name *
              </label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Firm Code / Identifier *
              </label>
              <input
                type="text"
                required
                value={profileForm.code}
                onChange={(e) => setProfileForm({ ...profileForm, code: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <MultiSelectDropdown
              label="Industry Scope of Surveillance"
              options={Array.from(new Set([...INDUSTRY_SCOPE_OPTIONS, ...currentScopes]))}
              selectedValues={currentScopes}
              onChange={(values) =>
                setProfileForm({ ...profileForm, industryScope: values.join(", ") })
              }
              placeholder="Select industry domains..."
            />
            {currentScopes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentScopes.map((scope) => (
                  <span
                    key={scope}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold"
                  >
                    <span>{scope}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = currentScopes.filter((s) => s !== scope);
                        setProfileForm({ ...profileForm, industryScope: updated.join(", ") });
                      }}
                      className="text-teal-600 hover:text-teal-900 font-bold ml-0.5 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Governance Email *
              </label>
              <input
                type="email"
                required
                value={profileForm.contactEmail}
                onChange={(e) => setProfileForm({ ...profileForm, contactEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Contact
              </label>
              <input
                type="text"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Corporate Address
              </label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Website
              </label>
              <input
                type="text"
                value={profileForm.website}
                onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Quality & Impartiality Policy
            </label>
            <textarea
              rows={3}
              placeholder="Firm commitment statement on conformity assessment integrity, confidentiality, and impartiality..."
              value={profileForm.qualityPolicy || ""}
              onChange={(e) => setProfileForm({ ...profileForm, qualityPolicy: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white resize-y transition-all"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Firm Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
