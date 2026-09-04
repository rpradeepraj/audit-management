"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check, X } from "lucide-react";

export interface MultiSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface MultiSelectDropdownProps {
  options: (MultiSelectOption | string)[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  searchable?: boolean;
  className?: string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = "Select options...",
  label,
  required = false,
  searchable = true,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedOptions: MultiSelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const filteredOptions = normalizedOptions.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      opt.value.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleSelectAll = () => {
    if (selectedValues.length === normalizedOptions.length) {
      onChange([]);
    } else {
      onChange(normalizedOptions.map((o) => o.value));
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full min-h-[38px] px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-left flex items-center justify-between gap-2 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
        >
          <div className="flex-1 flex flex-wrap gap-1 items-center min-h-[22px]">
            {selectedValues.length === 0 ? (
              <span className="text-slate-400">{placeholder}</span>
            ) : (
              <span className="font-semibold text-slate-800">
                {selectedValues.length} item{selectedValues.length > 1 ? "s" : ""} selected
                <span className="text-slate-500 font-normal ml-1">
                  ({selectedValues.slice(0, 2).join(", ")}
                  {selectedValues.length > 2 ? ` +${selectedValues.length - 2} more` : ""})
                </span>
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            {searchable && (
              <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                  autoFocus
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="p-0.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            <div className="px-2 py-1.5 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50/30">
              <span>{selectedValues.length} selected</span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
              >
                {selectedValues.length === normalizedOptions.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
              {filteredOptions.length === 0 ? (
                <div className="py-3 text-center text-slate-400 text-xs">No matching options</div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = selectedValues.includes(opt.value);
                  return (
                    <div
                      key={opt.value}
                      onClick={() => handleToggle(opt.value)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-indigo-50 text-indigo-900 font-medium"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="truncate">{opt.label}</div>
                        {opt.description && (
                          <div className="text-[10px] text-slate-400 truncate">
                            {opt.description}
                          </div>
                        )}
                      </div>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
