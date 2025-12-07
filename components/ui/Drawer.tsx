"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  side?: "left" | "right";
  size?: "sm" | "md" | "lg";
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  side = "right",
  size = "md",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: "w-80",
    md: "w-96",
    lg: "w-[28rem]",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 h-full bg-white shadow-xl transition-transform duration-300 ease-in-out",
          sizes[size],
          side === "left" ? "left-0" : "right-0",
          isOpen
            ? side === "left"
              ? "translate-x-0"
              : "translate-x-0"
            : side === "left"
            ? "-translate-x-full"
            : "translate-x-full"
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex-1">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors ml-4"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="h-[calc(100%-73px)] overflow-y-auto px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
};

