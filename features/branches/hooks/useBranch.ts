"use client";

import { useState, useEffect } from "react";
import { getBranches, getBranch, getBranchKPIs } from "../services/branchApi";
import { Branch, BranchKPIs } from "../types";

export function useBranch() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [branchKPIs, setBranchKPIs] = useState<BranchKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (currentBranch) {
      loadBranchKPIs(currentBranch.id);
    }
  }, [currentBranch]);

  const loadBranches = async () => {
    try {
      setLoading(true);
      const data = await getBranches();
      setBranches(data);
      // Set first branch as default if available
      if (data.length > 0 && !currentBranch) {
        setCurrentBranch(data[0]);
      } else if (data.length === 0 && !currentBranch) {
        // If no branches, create a mock default branch
        const mockBranch = {
          id: "default-branch",
          name: "Chi nhánh mặc định",
          address: "",
          phone: "",
          email: "",
          isActive: true,
          managerId: null,
          manager: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setBranches([mockBranch]);
        setCurrentBranch(mockBranch);
      }
    } catch (error) {
      console.error("Error loading branches:", error);
      // Set mock branch on error
      if (!currentBranch) {
        const mockBranch = {
          id: "default-branch",
          name: "Chi nhánh mặc định",
          address: "",
          phone: "",
          email: "",
          isActive: true,
          managerId: null,
          manager: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setBranches([mockBranch]);
        setCurrentBranch(mockBranch);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadBranch = async (branchId: string) => {
    try {
      const data = await getBranch(branchId);
      setCurrentBranch(data);
      return data;
    } catch (error) {
      console.error("Error loading branch:", error);
      throw error;
    }
  };

  const loadBranchKPIs = async (branchId: string, timeRange: "today" | "week" | "month" = "today") => {
    try {
      const data = await getBranchKPIs(branchId, timeRange);
      setBranchKPIs(data);
    } catch (error) {
      console.error("Error loading branch KPIs:", error);
    }
  };

  const switchBranch = (branchId: string) => {
    const branch = branches.find((b) => b.id === branchId);
    if (branch) {
      setCurrentBranch(branch);
      // Store in localStorage for persistence
      localStorage.setItem("currentBranchId", branchId);
    }
  };

  // Load saved branch from localStorage on mount
  useEffect(() => {
    const savedBranchId = localStorage.getItem("currentBranchId");
    if (savedBranchId && branches.length > 0) {
      const branch = branches.find((b) => b.id === savedBranchId);
      if (branch) {
        setCurrentBranch(branch);
      }
    }
  }, [branches]);

  return {
    branches,
    currentBranch,
    branchKPIs,
    loading,
    loadBranches,
    loadBranch,
    loadBranchKPIs,
    switchBranch,
  };
}

