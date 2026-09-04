"use client";

import React, { useState, useEffect } from "react";
import { User, UserRole, AuditFirm } from "../../../shared/types/audit";
import { UserPlus, Edit3, X } from "lucide-react";

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  firm: AuditFirm;
  editingUser?: User | null;
  onSave: (userData: {
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
  }) => void;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({
  isOpen,
  onClose,
  firm,
  editingUser,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Auditor");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name || "");
      setEmail(editingUser.email || "");
      setRole(editingUser.role || "Auditor");
      setPhone(editingUser.phone || "");
    } else {
      setName("");
      setEmail("");
      setRole("Auditor");
      setPhone("");
    }
  }, [editingUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      email: email.trim(),
      role,
      phone: phone.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              {editingUser ? (
                <>
                  <Edit3 className="w-5 h-5 text-indigo-600" />
                  <span>Edit Staff - {editingUser.name}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                  <span>Add Staff to {firm.name}</span>
                </>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {editingUser
                ? `Update staff credentials and role permissions under ${firm.code}`
                : `Provision auditor or administrator under ${firm.code}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Arthur Pendelton"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Work Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. arthur.p@auditfirm.com"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assigned Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
              >
                <option value="Auditor">Auditor (Certified)</option>
                <option value="Audit Manager">Audit Manager</option>
                <option value="Company Admin">Company Admin</option>
                <option value="Platform Admin">Platform Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0199"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
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
              {editingUser ? "Save Staff Changes" : "Provision Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
