import React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
}

export interface SelectContentProps {
  children: React.ReactNode;
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export interface SelectValueProps {
  placeholder?: string;
}

export interface SelectItemProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  value: string;
  children: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <select
          className={cn(
            "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-white",
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

// For compatibility with shadcn/ui Select API
export const SelectContent = ({ children }: SelectContentProps) => <>{children}</>;
export const SelectTrigger = ({ children, className, ...props }: SelectTriggerProps) => (
  <button
    className={cn(
      "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-white text-left flex items-center justify-between",
      className
    )}
    {...props}
  >
    {children}
  </button>
);
export const SelectValue = ({ placeholder }: SelectValueProps) => (
  <span className="text-gray-500">{placeholder}</span>
);
export const SelectItem = ({ children, ...props }: SelectItemProps) => (
  <option {...props}>{children}</option>
);

