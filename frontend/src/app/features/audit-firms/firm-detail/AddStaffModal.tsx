"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, UserRole, AuditFirm } from "../../../shared/types/audit";
import { UserPlus, Edit3, X, Eye, EyeOff, Upload, Camera, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { authFetch } from "../../../shared/services/authService";

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
    password?: string;
    confirmPassword?: string;
    avatar?: string;
  }) => Promise<void> | void;
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
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setErrorMessage(null);
    setIsSubmitting(false);
    setIsUploadingAvatar(false);
    if (editingUser) {
      setName(editingUser.name || "");
      setEmail(editingUser.email || "");
      setRole(editingUser.role || "Auditor");
      setPhone(editingUser.phone || "");
      setAvatar(editingUser.avatar || "");
      setPassword("");
      setConfirmPassword("");
    } else {
      setName("");
      setEmail("");
      setRole("Auditor");
      setPhone("");
      setPassword("");
      setConfirmPassword("");
      setAvatar("");
    }
  }, [editingUser, isOpen]);

  if (!isOpen) return null;

  // Handle avatar file selection & upload
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (e.g. max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Avatar image size must be under 5MB.");
      return;
    }

    setIsUploadingAvatar(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await authFetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.url) {
        setAvatar(data.url);
      } else {
        // Fallback to local FileReader base64
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            setAvatar(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !email.trim()) {
      setErrorMessage("Please enter full name and email address.");
      return;
    }

    // Password validation for new staff
    if (!editingUser) {
      if (!password) {
        setErrorMessage("Password is required for new staff account.");
        return;
      }
      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage("Password and confirm password do not match.");
        return;
      }
    } else {
      // Optional password update for existing staff
      if (password) {
        if (password.length < 6) {
          setErrorMessage("New password must be at least 6 characters long.");
          return;
        }
        if (password !== confirmPassword) {
          setErrorMessage("Password and confirm password do not match.");
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        email: email.trim(),
        role,
        phone: phone.trim() || undefined,
        password: password || undefined,
        confirmPassword: confirmPassword || undefined,
        avatar: avatar || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save staff member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const userInitials =
    name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ST";

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
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
                ? `Update staff profile and details under ${firm.code}`
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

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload Section */}
          <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex items-center gap-4">
            <div className="relative shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name || "User Avatar"}
                  onError={() => setAvatar("")}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-2xs">
                  {userInitials}
                </div>
              )}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-slate-900/50 rounded-2xl flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <label className="block text-xs font-bold text-slate-800">
                Staff Profile Picture
              </label>
              <p className="text-[11px] text-slate-500">
                Upload JPG, PNG or WebP avatar image (up to 5MB).
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Camera className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{avatar ? "Change Photo" : "Upload Photo"}</span>
                </button>
                {avatar && (
                  <button
                    type="button"
                    onClick={() => setAvatar("")}
                    className="px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl font-semibold transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Full Name */}
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

          {/* Work Email Address */}
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

          {/* Assigned Role & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assigned Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
              >
                <option value="Admin">Admin</option>
                <option value="Audit Manager">Audit Manager</option>
                <option value="Auditor">Auditor</option>
                <option value="Client Representative">Client Representative</option>
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

          {/* Password & Confirm Password - Only shown when creating a new user */}
          {!editingUser && (
            <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  Login Password *
                </label>
                <span className="text-[10px] text-slate-400 font-medium">
                  Min 6 characters
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Password */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create password"
                      className="w-full pl-3 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className={`w-full pl-3 pr-8 py-2 text-xs bg-white border rounded-xl focus:outline-none font-medium ${
                        confirmPassword && password && confirmPassword !== password
                          ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                          : "border-slate-200 focus:border-indigo-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {password && confirmPassword && password === confirmPassword && (
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Passwords match</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
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
              className={`px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                isSubmitting ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {isSubmitting
                  ? editingUser
                    ? "Saving Changes..."
                    : "Provisioning Staff..."
                  : editingUser
                  ? "Save Staff Changes"
                  : "Provision Staff"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;
