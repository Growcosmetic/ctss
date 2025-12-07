"use client";

import React, { useState } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";
import { useBranch } from "../hooks/useBranch";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Branch } from "../types";

interface BranchSelectorProps {
  className?: string;
}

export default function BranchSelector({ className }: BranchSelectorProps) {
  const { branches, currentBranch, switchBranch, loading } = useBranch();
  const { user, hasRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Only show for Admin and Manager
  if (!hasRole("ADMIN") && !hasRole("MANAGER")) {
    return null;
  }

  // Manager only sees their branch
  if (hasRole("MANAGER") && !hasRole("ADMIN")) {
    if (currentBranch) {
      return (
        <div className={`flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg ${className}`}>
          <Building2 className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">{currentBranch.name}</span>
        </div>
      );
    }
    return null;
  }

  // Admin can switch branches
  if (loading || branches.length === 0) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg ${className}`}>
        <Building2 className="w-4 h-4 text-gray-400 animate-pulse" />
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    );
  }

  const handleSelectBranch = (branch: Branch) => {
    switchBranch(branch.id);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
      >
        <Building2 className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {currentBranch?.name || "Select Branch"}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[200px] max-h-[300px] overflow-y-auto">
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => handleSelectBranch(branch)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between ${
                  currentBranch?.id === branch.id ? "bg-blue-50" : ""
                }`}
              >
                <div>
                  <div className="font-medium text-sm text-gray-900">{branch.name}</div>
                  {branch.address && (
                    <div className="text-xs text-gray-500 mt-0.5">{branch.address}</div>
                  )}
                </div>
                {currentBranch?.id === branch.id && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

