'use client';

import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 mb-6">
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <React.Fragment key={step}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all
              ${currentStep >= step 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'bg-slate-200 text-slate-400'
              }`}>
              {step}
            </div>
            {step < totalSteps && (
              <div className={`h-1 w-12 transition-colors duration-300
                ${currentStep > step ? 'bg-purple-600' : 'bg-slate-200'}
              `} />
            )}
          </React.Fragment>
        ))}
      </div>
      <span className="text-xs text-slate-500 font-medium">
        Étape {currentStep} sur {totalSteps}
      </span>
    </div>
  );
}
