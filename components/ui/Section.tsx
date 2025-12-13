"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function Section({
  title,
  description,
  action,
  children,
  className,
}: SectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || description || action) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
}

