import React, { useState } from "react";
import { useAudit } from "../../context/AuditContext";
import { Customer, User, UserRole } from "../../types/audit";
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
  X,
  Briefcase,
  UserPlus,
  Users,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const CustomersView: React.FC = () => {
  const {
    customers,
    audits,
    users,
    currentUser,
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

  // Add user to firm modal state
  const [firmForNewUser, setFirmForNewUser] = useState<Customer | null>(null);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("Auditor");
  const [newUserDepartment, setNewUserDepartment] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Firm form states
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formIndustry, setFormIndustry] = useState("Manufacturing & Logistics");
  const [formContactPerson, setFormContactPerson] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formComplianceRating, setFormComplianceRating] = useState<number>(85);

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

  const firmAudits = selectedFirm
    ? audits.filter((a) => a.customerId === selectedFirm.id)
    : [];

  const getFirmUsers = (firmId: string, firmName: string) => {
    return users.filter(
      (u) =>
        u.companyId === firmId ||
        (firmName && u.companyName && u.companyName.toLowerCase() === firmName.toLowerCase())
    );
  };

  const selectedFirmUsers = selectedFirm
    ? getFirmUsers(selectedFirm.id, selectedFirm.name)
    : [];

  const handleOpenAddModal = () => {
    setFormName("");
    setFormCode(`AF-${Math.floor(100 + Math.random() * 900)}`);
    setFormIndustry("Manufacturing & Logistics");
    setFormContactPerson("");
    setFormEmail("");
    setFormPhone("");
    setFormAddress("");
    setFormComplianceRating(88);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (firm: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCustomer(firm);
    setFormName(firm.name);
    setFormCode(firm.code);
    setFormIndustry(firm.industry);
    setFormContactPerson(firm.contactPerson);
    setFormEmail(firm.email);
    setFormPhone(firm.phone || "");
    setFormAddress(firm.address || "");
    setFormComplianceRating(firm.complianceRating || 85);
  };

  const handleOpenAddUserModal = (firm: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFirmForNewUser(firm);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("Auditor");
    setNewUserDepartment("Compliance");
    setNewUserPhone("");
  };

  const handleSaveFirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formContactPerson.trim() || !formEmail.trim()) {
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name: formName.trim(),
        code: formCode.trim() || editingCustomer.code,
        industry: formIndustry,
        contactPerson: formContactPerson.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        address: formAddress.trim(),
        complianceRating: Number(formComplianceRating) || 85,
      });
      setEditingCustomer(null);
    } else {
      addCustomer({
        name: formName.trim(),
        code: formCode.trim() || `AF-${Math.floor(100 + Math.random() * 900)}`,
        industry: formIndustry,
        contactPerson: formContactPerson.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        address: formAddress.trim(),
        complianceRating: Number(formComplianceRating) || 88,
        riskLevel: "Low",
        assignedManagerId: currentUser.id,
        assignedManagerName: currentUser.name,
      });
      setIsAddModalOpen(false);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firmForNewUser || !newUserName.trim() || !newUserEmail.trim()) return;

    addUserToFirm(firmForNewUser.id, firmForNewUser.name, {
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      department: newUserDepartment.trim() || undefined,
      phone: newUserPhone.trim() || undefined,
    });

    setFirmForNewUser(null);
  };

  const handleDeleteFirm = () => {
    if (customerToDelete) {
      deleteCustomer(customerToDelete.id);
      if (selectedCustomerId === customerToDelete.id) {
        setSelectedCustomerId(null);
      }
      setCustomerToDelete(null);
    }
  };

  const handleDeleteUser = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
      setUserToDelete(null);
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case "Admin":
      case "Company Admin":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Audit Manager":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Auditor":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Client Representative":
      case "Customer Representative":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const canManageFirms =
    currentUser.role === "Admin" ||
    currentUser.role === "Company Admin" ||
    currentUser.role === "Audit Manager";

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
              Audit Firms
            </h1>
            <span className="text-[11px] text-slate-500 font-medium">
              {filteredFirms.length} organizations enrolled
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canManageFirms && (
            <button
              onClick={handleOpenAddModal}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Audit Firm</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search firm, code, contact..."
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
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
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
            className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
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
            className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
              viewMode === "table"
                ? "bg-white text-indigo-700 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="List View"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* Main List Display */}
      {filteredFirms.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-xl border border-slate-200">
          <Building2 className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
          <div className="text-xs font-bold text-slate-700">No matching audit firms</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Try resetting search or filter.</p>
        </div>
      ) : viewMode === "grid" ? (
        /* Cards View - Clean Item First, Click for Details */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredFirms.map((firm) => {
            const firmUsersList = getFirmUsers(firm.id, firm.name);
            const activeAudits = audits.filter(
              (a) => a.customerId === firm.id && a.status === "In Progress"
            ).length;
            const isSelected = selectedCustomerId === firm.id;

            return (
              <div
                key={firm.id}
                onClick={() => setSelectedCustomerId(firm.id)}
                className={`p-3 rounded-xl border bg-white transition-all cursor-pointer flex flex-col justify-between hover:border-indigo-300 hover:shadow-2xs ${
                  isSelected
                    ? "border-indigo-500 ring-1 ring-indigo-500/20 bg-indigo-50/20"
                    : "border-slate-200"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-1.5">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded">
                        {firm.code}
                      </span>
                      <h3 className="font-bold text-slate-900 text-xs mt-1 leading-snug">
                        {firm.name}
                      </h3>
                    </div>

                    {/* Quick action: Add User + Edit */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleOpenAddUserModal(firm, e)}
                        className="p-1 text-indigo-600 hover:bg-indigo-50 border border-indigo-100 rounded flex items-center gap-0.5 text-[10px] font-semibold"
                        title="Add User under this Firm"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>User</span>
                      </button>
                      {canManageFirms && (
                        <button
                          onClick={(e) => handleOpenEditModal(firm, e)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                          title="Edit Firm"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{firm.industry}</span>
                  </div>

                  {/* Users row */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-600 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-indigo-500" />
                      <span className="font-semibold">{firmUsersList.length}</span>
                      <span className="text-slate-400 text-[10px]">users</span>
                    </div>

                    <div className="flex -space-x-1.5 items-center">
                      {firmUsersList.slice(0, 3).map((u) => (
                        <img
                          key={u.id}
                          src={u.avatar}
                          alt={u.name}
                          title={`${u.name} (${u.role})`}
                          className="w-4 h-4 rounded-full ring-1 ring-white object-cover"
                        />
                      ))}
                      {firmUsersList.length > 3 && (
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[8px] font-bold flex items-center justify-center ring-1 ring-white">
                          +{firmUsersList.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer metrics & trigger */}
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">
                    {activeAudits > 0 ? (
                      <span className="text-indigo-600 font-bold">{activeAudits} running audit</span>
                    ) : (
                      "0 active audits"
                    )}
                  </span>

                  <span className="text-indigo-600 font-bold flex items-center gap-0.5 text-[11px]">
                    <span>Details</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table / List View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2 px-3">Firm & Code</th>
                <th className="py-2 px-3">Industry</th>
                <th className="py-2 px-3">Lead Contact</th>
                <th className="py-2 px-3 text-center">Users</th>
                <th className="py-2 px-3 text-center">Compliance</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredFirms.map((firm) => {
                const firmUsersList = getFirmUsers(firm.id, firm.name);
                const isSelected = selectedCustomerId === firm.id;
                return (
                  <tr
                    key={firm.id}
                    onClick={() => setSelectedCustomerId(firm.id)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      isSelected ? "bg-indigo-50/40" : ""
                    }`}
                  >
                    <td className="py-2 px-3">
                      <div className="font-bold text-slate-900">{firm.name}</div>
                      <span className="text-[10px] font-mono text-slate-500">{firm.code}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 text-[11px]">{firm.industry}</td>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-800 text-[11px]">{firm.contactPerson}</div>
                      <div className="text-[10px] text-slate-400">{firm.email}</div>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.2 rounded text-[10px]">
                        {firmUsersList.length}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded text-[10px]">
                        {firm.complianceRating}%
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleOpenAddUserModal(firm, e)}
                          className="px-1.5 py-0.5 text-indigo-600 hover:bg-indigo-50 border border-indigo-100 rounded flex items-center gap-0.5 text-[10px] font-medium"
                          title="Add User"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>User</span>
                        </button>
                        {canManageFirms && (
                          <>
                            <button
                              onClick={(e) => handleOpenEditModal(firm, e)}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCustomerToDelete(firm);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detailed View Modal when an item is clicked */}
      {selectedFirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full p-6 sm:p-8 animate-in zoom-in-95 duration-150 space-y-5 max-h-[92vh] overflow-y-auto flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                    {selectedFirm.name}
                  </h2>
                  <span className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold mt-1 inline-block">
                    {selectedFirm.code} • {selectedFirm.industry}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomerId(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedCustomerId(null);
                  setActiveTab("planning");
                }}
                className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 text-xs transition-colors shadow-2xs"
              >
                <CalendarCheck2 className="w-3.5 h-3.5" />
                <span>Plan Audit</span>
              </button>
              <button
                onClick={() => handleOpenAddUserModal(selectedFirm)}
                className="py-1.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-bold flex items-center justify-center gap-1 text-xs transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add User</span>
              </button>
              {canManageFirms && (
                <button
                  onClick={() => handleOpenEditModal(selectedFirm)}
                  className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center justify-center text-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Contact Details */}
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                Primary Contact
              </div>
              <div className="font-semibold text-slate-900">{selectedFirm.contactPerson}</div>
              <div className="flex flex-wrap gap-3 text-slate-600 text-[11px]">
                <div className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-indigo-500" />
                  <a href={`mailto:${selectedFirm.email}`} className="hover:underline">
                    {selectedFirm.email}
                  </a>
                </div>
                {selectedFirm.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-indigo-500" />
                    <span>{selectedFirm.phone}</span>
                  </div>
                )}
                {selectedFirm.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-indigo-500" />
                    <span>{selectedFirm.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Firm Users Roster */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Enrolled Users ({selectedFirmUsers.length})</span>
                </div>
                <button
                  onClick={() => handleOpenAddUserModal(selectedFirm)}
                  className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add User</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {selectedFirmUsers.length === 0 ? (
                  <div className="text-slate-400 text-center py-2 text-[11px] bg-slate-50 rounded-lg border border-slate-100">
                    No users enrolled under this firm yet.
                  </div>
                ) : (
                  selectedFirmUsers.map((u) => (
                    <div
                      key={u.id}
                      className="p-1.5 px-2 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 text-xs truncate">
                            {u.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">{u.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold border ${getRoleBadgeStyle(
                            u.role
                          )}`}
                        >
                          {u.role}
                        </span>
                        {canManageFirms && u.id !== currentUser.id && (
                          <button
                            onClick={() => setUserToDelete(u)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Remove user"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Audits History */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Audits ({firmAudits.length})</span>
                <span className="text-[10px] font-medium text-slate-500">Compliance: {selectedFirm.complianceRating}%</span>
              </div>

              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {firmAudits.length === 0 ? (
                  <div className="text-slate-400 text-center py-2 text-[11px] bg-slate-50 rounded-lg border border-slate-100">
                    No audits logged for this firm.
                  </div>
                ) : (
                  firmAudits.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => {
                        setSelectedCustomerId(null);
                        if (a.status === "In Progress") {
                          setActiveAuditId(a.id);
                          setActiveTab("perform");
                        } else {
                          setActiveAuditId(a.id);
                          setActiveTab("reports");
                        }
                      }}
                      className="p-1.5 px-2 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 rounded-lg cursor-pointer transition-colors flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-indigo-700 text-[10px]">
                          {a.auditNumber}
                        </span>
                        <div className="font-semibold text-slate-800 text-[11px] truncate max-w-xs">
                          {a.title}
                        </div>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-800">
                        {a.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {firmForNewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 animate-in zoom-in-95 duration-150 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">
                    Add User to {firmForNewUser.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Provision authorized client stakeholder or firm representative</p>
                </div>
              </div>
              <button
                onClick={() => setFirmForNewUser(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-sm">Full Name *</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. John Miller"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-sm">Email Address *</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. j.miller@firm.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-sm">User Role *</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="Admin">Admin</option>
                  <option value="Audit Manager">Audit Manager</option>
                  <option value="Auditor">Auditor</option>
                  <option value="Client Representative">Client Representative</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-sm">Department</label>
                  <input
                    type="text"
                    value={newUserDepartment}
                    onChange={(e) => setNewUserDepartment(e.target.value)}
                    placeholder="e.g. QA / Risk"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-sm">Phone</label>
                  <input
                    type="text"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="+1 555-0182"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setFirmForNewUser(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Audit Firm Modal */}
      {(isAddModalOpen || editingCustomer !== null) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full p-6 sm:p-8 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-2xs shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">
                    {editingCustomer ? "Edit Audit Firm" : "Add Audit Firm"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Register auditee organization profile & contact parameters</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCustomer(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFirm} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-sm">Firm Name *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Apex Engineering"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-sm">Firm Code</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. AF-101"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-sm">Industry</label>
                  <select
                    value={formIndustry}
                    onChange={(e) => setFormIndustry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Manufacturing & Logistics">Manufacturing & Logistics</option>
                    <option value="Cloud SaaS & Tech">Cloud SaaS & Tech</option>
                    <option value="Pharmaceuticals & Biotech">Pharmaceuticals & Biotech</option>
                    <option value="Banking & Finance">Banking & Finance</option>
                    <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                    <option value="Energy & Utilities">Energy & Utilities</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-sm">Compliance (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formComplianceRating}
                    onChange={(e) => setFormComplianceRating(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-sm">Contact Person *</label>
                  <input
                    type="text"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    placeholder="e.g. David Vance"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-sm">Email Address *</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. david@firm.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-sm">Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 text-sm">Address</label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="City, State"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCustomer(null);
                  }}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs shadow-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{editingCustomer ? "Update Firm" : "Save Firm"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in zoom-in-95 duration-150 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Remove Audit Firm?</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Are you sure you want to remove &quot;{customerToDelete.name}&quot;? All associated historical audit records and user assignments will be unlinked.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setCustomerToDelete(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFirm}
                className="px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors"
              >
                Delete Firm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in zoom-in-95 duration-150 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Remove User?</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Remove &quot;{userToDelete.name}&quot; from {userToDelete.companyName || "firm"}? This user will lose access immediately.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors"
              >
                Remove User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
