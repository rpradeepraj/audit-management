"use client";

import React, { useState } from "react";
import { useAudit } from "../../shared/context/AuditContext";
import { Customer, User } from "../../shared/types/audit";
import {
  Building2,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  CalendarCheck2,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  Users,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { CustomerModal } from "./CustomerModal";
import { AddCustomerUserModal } from "./AddCustomerUserModal";
import { CustomerDetailDrawer } from "./CustomerDetailDrawer";
import { StatusBadge } from "../../shared/components/ui";

export const CustomersView: React.FC = () => {
  const {
    customers,
    audits,
    users,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addUserToFirm,
    deleteUser,
    setActiveTab,
    setActiveAuditId,
    searchQuery,
    setSearchQuery,
  } = useAudit();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [firmForNewUser, setFirmForNewUser] = useState<Customer | null>(null);

  const industries = [
    "All",
    "Manufacturing & Logistics",
    "Cloud SaaS & Tech",
    "Pharmaceuticals & Biotech",
    "Banking & Finance",
    "Healthcare & Life Sciences",
    "Energy & Utilities",
  ];

  // Filtered firms
  const filteredFirms = customers.filter((firm) => {
    const matchesSearch =
      firm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      firm.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      firm.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      firm.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      firm.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesIndustry =
      selectedIndustry === "All" ||
      firm.industry.toLowerCase().includes(selectedIndustry.toLowerCase());

    return matchesSearch && matchesIndustry;
  });

  const selectedFirm = customers.find((c) => c.id === selectedCustomerId) || null;

  const handleSaveCustomer = (customerData: Partial<Customer>) => {
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, customerData);
    } else {
      addCustomer(customerData as any);
    }
    setIsAddModalOpen(false);
    setEditingCustomer(null);
  };

  const handleConfirmDeleteCustomer = () => {
    if (customerToDelete) {
      deleteCustomer(customerToDelete.id);
      if (selectedCustomerId === customerToDelete.id) {
        setSelectedCustomerId(null);
      }
      setCustomerToDelete(null);
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
              Auditee Client Organizations
            </h1>
            <span className="text-[11px] text-slate-500 font-medium">
              {filteredFirms.length} client organizations enrolled
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingCustomer(null);
            setIsAddModalOpen(true);
          }}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register Auditee Org</span>
        </button>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search auditee, code, contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Industry Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind === "All" ? "All Industries" : ind}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-white text-indigo-700 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Card View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cards</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              viewMode === "table"
                ? "bg-white text-indigo-700 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Table View"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* Main Listing */}
      {filteredFirms.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-xl border border-slate-200">
          <Building2 className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
          <div className="text-xs font-bold text-slate-700">No matching organizations</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Try resetting search or filter.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFirms.map((firm) => {
            const activeAudits = audits.filter(
              (a) => a.customerId === firm.id && (a.status === "In Progress" || a.status === "Scheduled")
            );

            return (
              <div
                key={firm.id}
                onClick={() => setSelectedCustomerId(firm.id)}
                className="bg-white border border-slate-200/80 hover:border-indigo-300 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                      {firm.code}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {firm.complianceRating || 88}% Compliance
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {firm.name}
                  </h3>
                  <div className="text-[11px] text-slate-500 mt-0.5">{firm.industry}</div>

                  <div className="mt-3 space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{firm.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{firm.email}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">
                    {activeAudits.length} Active Audits
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCustomer(firm);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomerToDelete(firm);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Industry</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredFirms.map((firm) => (
                <tr
                  key={firm.id}
                  onClick={() => setSelectedCustomerId(firm.id)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{firm.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">{firm.code}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{firm.industry}</td>
                  <td className="py-3 px-4">{firm.contactPerson}</td>
                  <td className="py-3 px-4 text-slate-500">{firm.email}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold text-emerald-700">{firm.complianceRating || 88}%</span>
                  </td>
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditingCustomer(firm);
                          setIsAddModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setCustomerToDelete(firm)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Side Drawer */}
      {selectedFirm && (
        <CustomerDetailDrawer
          customer={selectedFirm}
          audits={audits}
          users={users}
          onClose={() => setSelectedCustomerId(null)}
          onOpenAddUser={() => setFirmForNewUser(selectedFirm)}
          onDeleteUser={(id) => deleteUser(id)}
          onOpenAudit={(auditId) => {
            setActiveAuditId(auditId);
            setActiveTab("planning");
          }}
        />
      )}

      {/* Customer Modal (Add/Edit) */}
      <CustomerModal
        isOpen={isAddModalOpen || editingCustomer !== null}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCustomer(null);
        }}
        onSave={handleSaveCustomer}
        editingCustomer={editingCustomer}
      />

      {/* Add User to Customer Modal */}
      {firmForNewUser && (
        <AddCustomerUserModal
          customer={firmForNewUser}
          onClose={() => setFirmForNewUser(null)}
          onSave={(userData) => {
            addUserToFirm(firmForNewUser.id, firmForNewUser.name, userData);
            setFirmForNewUser(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <h3 className="font-bold text-slate-900 text-base">Delete Auditee Organization?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong>{customerToDelete.name}</strong>? This will detach related audit history and profile specs.
            </p>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setCustomerToDelete(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteCustomer}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Delete Organization
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
