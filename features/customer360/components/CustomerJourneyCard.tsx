"use client";

import {
  getJourneyStageLabel,
  getJourneyStageDescription,
  getJourneyStageColor,
  getJourneyProgress,
} from "@/core/customerJourney/utils";
import type { CustomerJourneyState } from "@/core/customerJourney/types";

interface CustomerJourneyCardProps {
  journeyState: CustomerJourneyState;
}

export function CustomerJourneyCard({ journeyState }: CustomerJourneyCardProps) {
  const label = getJourneyStageLabel(journeyState);
  const description = getJourneyStageDescription(journeyState);
  const colors = getJourneyStageColor(journeyState);
  const progress = getJourneyProgress(journeyState);

  // Journey stages array
  const stages: CustomerJourneyState[] = [
    "AWARENESS",
    "CONSIDERATION",
    "BOOKING",
    "IN_SALON",
    "POST_SERVICE",
    "RETENTION",
  ];

  const currentIndex = stages.indexOf(journeyState);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-indigo-600">🗺️</span> Hành trình khách hàng
      </h3>

      {/* Current State Badge */}
      <div
        className={`px-4 py-3 rounded-lg border mb-4 ${colors.bg} ${colors.border}`}
      >
        <div className={`font-semibold ${colors.text}`}>{label}</div>
        <div className={`text-sm mt-1 ${colors.text} opacity-80`}>
          {description}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-600 mb-2">
          <span>Tiến độ</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Journey Map */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-700 mb-3">
          6 Giai đoạn hành trình:
        </div>
        {stages.map((stage, index) => {
          const stageColors = getJourneyStageColor(stage);
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <div
              key={stage}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                isActive
                  ? `${stageColors.bg} ${stageColors.border} shadow-sm`
                  : isCompleted
                  ? "bg-gray-50 border-gray-200"
                  : "bg-white border-gray-200 opacity-60"
              }`}
            >
              {/* Step Number */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  isActive
                    ? `${stageColors.text} ${stageColors.bg}`
                    : isCompleted
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? "✓" : index + 1}
              </div>

              {/* Stage Info */}
              <div className="flex-1">
                <div
                  className={`font-medium ${
                    isActive ? stageColors.text : "text-gray-700"
                  }`}
                >
                  {getJourneyStageLabel(stage)}
                </div>
                {isActive && (
                  <div className="text-xs text-gray-600 mt-0.5">
                    Giai đoạn hiện tại
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

