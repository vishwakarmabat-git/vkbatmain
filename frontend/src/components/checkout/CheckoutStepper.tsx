import React from 'react';
import { Check, MapPin, CreditCard, ShieldCheck } from 'lucide-react';

export type CheckoutStepId = 1 | 2 | 3;

interface StepItem {
  id: CheckoutStepId;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
}

const STEPS: StepItem[] = [
  { id: 1, title: 'Delivery Address', shortTitle: 'Address', icon: MapPin },
  { id: 2, title: 'Payment Method', shortTitle: 'Payment', icon: CreditCard },
  { id: 3, title: 'Review & Pay', shortTitle: 'Review', icon: ShieldCheck },
];

interface CheckoutStepperProps {
  currentStep: CheckoutStepId;
  onStepClick: (step: CheckoutStepId) => void;
  isStepComplete: (step: CheckoutStepId) => boolean;
}

export const CheckoutStepper: React.FC<CheckoutStepperProps> = ({
  currentStep,
  onStepClick,
  isStepComplete,
}) => {
  return (
    <div className="w-full bg-[#121216] border border-[#1E1E28] rounded-xl p-3 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between relative">
        {STEPS.map((step, idx) => {
          const isCurrent = currentStep === step.id;
          const isCompleted = isStepComplete(step.id) && currentStep > step.id;
          const isAccessible = currentStep >= step.id || isStepComplete(step.id);
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              {/* Step item */}
              <button
                type="button"
                onClick={() => {
                  if (isAccessible) {
                    onStepClick(step.id);
                  }
                }}
                disabled={!isAccessible}
                className={`flex items-center gap-2 sm:gap-3 z-10 transition-all select-none group text-left ${
                  isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {/* Circle / Badge */}
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-sport font-black text-xs sm:text-sm transition-all duration-300 shrink-0 ${
                    isCompleted
                      ? 'bg-[#10B981] text-black shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                      : isCurrent
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black font-black ring-4 ring-[#D4AF37]/20 shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-105'
                      : 'bg-[#181821] border border-[#2A2A38] text-[#71717A]'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>

                {/* Step Labels */}
                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-[10px] sm:text-xs font-sport tracking-wider uppercase font-bold transition-colors ${
                      isCurrent
                        ? 'text-[#D4AF37]'
                        : isCompleted
                        ? 'text-[#10B981]'
                        : 'text-[#71717A]'
                    }`}
                  >
                    STEP {step.id}
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-semibold truncate transition-colors ${
                      isCurrent
                        ? 'text-white'
                        : isCompleted
                        ? 'text-[#E4E4E7]'
                        : 'text-[#52525B]'
                    }`}
                  >
                    <span className="hidden sm:inline">{step.title}</span>
                    <span className="sm:hidden">{step.shortTitle}</span>
                  </span>
                </div>
              </button>

              {/* Connecting Bar */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-4 h-0.5 bg-[#1E1E28] relative overflow-hidden rounded-full">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      currentStep > step.id
                        ? 'bg-gradient-to-r from-[#10B981] to-[#D4AF37] w-full'
                        : currentStep === step.id
                        ? 'bg-[#D4AF37] w-1/2'
                        : 'w-0'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
