"use client";

import React, { useState, useEffect } from "react";
import { AuditFirm, User } from "../../../shared/types/audit";
import { useFirm } from "../../../shared/context/FirmContext";
import {
  Users,
  UserPlus,
  Search,
  Trash2,
  Edit3,
  Mail,
  Phone,
  LayoutGrid,
  Table,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
} from "lucide-react";
import { AddStaffModal } from "./AddStaffModal";
import { UserAvatar } from "../../../shared/components/ui";
import { authFetch } from "../../../shared/services/authService";

interface FirmStaffTabProps {
  firm: AuditFirm;
  users?: User[];
  onAddUser?: (userData: any) => any;
  onUpdateUser?: (userId: string, updates: Partial<User>) => any;
  onDeleteUser?: (id: string) => any;
}

export const FirmStaffTab: React.FC<FirmStaffTabProps> = ({
  firm,
}) => {
  const { reloadFirms } = useFirm();
  const staff = firm.assignedStaff || [];
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [editingStaffMember, setEditingStaffMember] = useState<User | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Auto-dismiss notification after 4 seconds
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await reloadFirms();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getRoleBadgeStyle = (userRole: string) => {
    switch (userRole) {
      case "Admin":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Audit Manager":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Auditor":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Client Representative":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
    }
  };

  // Filter staff by search text & role
  const filteredStaff = staff.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingStaffMember(null);
    setIsAddStaffOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingStaffMember(user);
    setIsAddStaffOpen(true);
  };

  /**
   * Saves staff via API & reloads firm data.
   * Closes the popup on success, displays feedback message.
   */
  const handleSaveStaff = async (userData: any) => {
    try {
      if (editingStaffMember) {
        // Update user
        const res = await authFetch(`/api/users/${editingStaffMember.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...userData,
            firmId: firm.id,
          }),
        });
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to update staff member.");
        }

        setNotification({
          type: "success",
          message: `Staff member "${userData.name}" details updated successfully!`,
        });
      } else {
        // Create new user assigned to firm
        const res = await authFetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...userData,
            firmId: firm.id,
          }),
        });
        const result = await res.json();
        if (!res.ok || !result.success) {
          throw new Error(result.error || "Failed to create staff member.");
        }

        setNotification({
          type: "success",
          message: `Staff member "${userData.name}" added to ${firm.name} successfully!`,
        });
      }

      // Reload firms to update assignedStaff across entire app
      await reloadFirms();

      // Close popup modal on success
      setIsAddStaffOpen(false);
      setEditingStaffMember(null);
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Operation failed. Please try again.",
      });
      // Re-throw so modal displays error inline
      throw err;
    }
  };

  /**
   * Deletes / removes staff member from roster
   */
  const handleDeleteStaff = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${userName}" from this firm's roster?`)) {
      return;
    }

    setDeletingId(userId);
    try {
      const res = await authFetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to remove staff member.");
      }

      setNotification({
        type: "success",
        message: `Staff member "${userName}" removed successfully.`,
      });

      await reloadFirms();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Failed to remove staff member.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Toast / Notification Banner */}
      {notification && (
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold shadow-xs animate-in slide-in-from-top-2 duration-150 ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Staff Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search staff by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Roles ({staff.length})</option>
            <option value="Admin">Admin</option>
            <option value="Audit Manager">Audit Manager</option>
            <option value="Auditor">Auditor</option>
            <option value="Client Representative">Client Representative</option>
          </select>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Staff Roster"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
          </button>

          {/* View Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-indigo-600 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Table View"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "cards"
                  ? "bg-white text-indigo-600 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* Staff List Body */}
      {filteredStaff.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">No Staff Members Found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || roleFilter !== "ALL"
              ? "No staff members match the active filters."
              : `No staff members are currently registered under ${firm.name}. Click "Add Staff" to enroll team members.`}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add First Staff Member</span>
          </button>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredStaff.map((u) => (
            <div
              key={u.id}
              className="bg-white border border-slate-200/80 hover:border-indigo-300 rounded-2xl p-4 shadow-xs flex flex-col justify-between group space-y-3 transition-all"
            >
              <div className="flex items-start gap-3">
                <UserAvatar
                  src={u.avatar}
                  name={u.name}
                  size="lg"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {u.name}
                  </h4>
                  <div className="text-[11px] text-slate-500 truncate">{u.email}</div>
                  <span className={`mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${getRoleBadgeStyle(u.role)}`}>
                    {u.role}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>{u.phone || "No phone"}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(u)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Staff Member"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteStaff(u.id, u.name)}
                    disabled={deletingId === u.id}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    title="Remove Staff Member"
                  >
                    {deletingId === u.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Email Contact</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStaff.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        src={u.avatar}
                        name={u.name}
                        size="sm"
                      />
                      <span className="font-bold text-slate-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getRoleBadgeStyle(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{u.email}</td>
                  <td className="py-3 px-4 text-slate-500">{u.phone || "—"}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Staff Member"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(u.id, u.name)}
                        disabled={deletingId === u.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        title="Remove Staff"
                      >
                        {deletingId === u.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      {isAddStaffOpen && (
        <AddStaffModal
          isOpen={isAddStaffOpen}
          onClose={() => {
            setIsAddStaffOpen(false);
            setEditingStaffMember(null);
          }}
          firm={firm}
          editingUser={editingStaffMember}
          onSave={handleSaveStaff}
        />
      )}
    </div>
  );
};

export default FirmStaffTab;
