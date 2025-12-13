"use client";

import React, { useEffect, useRef, useId } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { useFocusTrap } from "@/lib/hooks/useFocusTrap";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  showCloseButton = true,
  className,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const modalRef = useFocusTrap(isOpen);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Save previous focus element
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Disable body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // Restore focus when closing
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          "bg-white rounded-lg shadow-xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col",
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || description || showCloseButton) && (
          <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between">
            <div className="flex-1">
              {title && (
                <h2 id={titleId} className="text-xl font-bold text-gray-900">{title}</h2>
              )}
              {description && (
                <p id={descriptionId} className="text-sm text-gray-500 mt-1">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors ml-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                aria-label="Đóng modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
