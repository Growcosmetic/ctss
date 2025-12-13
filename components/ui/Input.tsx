import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = "text", id, ...props }, ref) => {
    const inputId = id || `input-${React.useId()}`;
    const errorId = error ? `error-${inputId}` : undefined;
    const helperId = helperText && !error ? `helper-${inputId}` : undefined;
    const describedBy = error ? errorId : helperId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            "w-full px-4 py-2 border rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:border-transparent transition-colors",
            error
              ? "border-danger-500 focus-visible:ring-danger-500"
              : "border-gray-300",
            className
          )}
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          {...props}
        />
        {error && (
          <p id={errorId} className="mt-1 text-sm text-danger-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

