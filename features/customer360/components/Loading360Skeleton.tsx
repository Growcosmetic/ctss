// ============================================
// Customer360 Loading Skeleton
// ============================================

"use client";

import React from "react";

export function Loading360Skeleton() {
  return (
    <div className="w-full p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen animate-fadeIn">
      {/* Header Skeleton */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN — HISTORY SKELETONS */}
        <div className="lg:col-span-2 space-y-6">
          {/* Loyalty Panel Skeleton */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="h-20 bg-gray-100 rounded-lg"></div>
              <div className="h-20 bg-gray-100 rounded-lg"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>

          {/* Charts Skeleton */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="h-24 bg-gray-100 rounded-lg"></div>
              <div className="h-24 bg-gray-100 rounded-lg"></div>
              <div className="h-24 bg-gray-100 rounded-lg"></div>
            </div>
            <div className="h-32 bg-gray-100 rounded-lg"></div>
          </div>

          {/* Timeline Skeleton */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice List Skeleton */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — AI INSIGHTS SKELETONS */}
        <div className="space-y-6">
          {/* Persona Card Skeleton */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              <div className="h-3 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>

          {/* Prediction Card Skeleton */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
            <div className="space-y-4">
              <div className="h-16 bg-gray-100 rounded-lg"></div>
              <div className="h-12 bg-gray-100 rounded-lg"></div>
            </div>
          </div>

          {/* Risk Card Skeleton */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-12 bg-gray-100 rounded-lg"></div>
          </div>

          {/* NBA Card Skeleton */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="space-y-3">
              <div className="h-8 bg-gray-100 rounded"></div>
              <div className="h-20 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

