import React from 'react';

const steps = [
  { label: 'Service' },
  { label: 'Provider' },
  { label: 'Date' },
  { label: 'Time' },
  { label: 'Intake' },
  { label: 'Payment' },
];

export default function Stepper({ currentStep }) {
  return (
    <div className="stepper">
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        const status = isCompleted ? 'completed' : isActive ? 'active' : 'inactive';

        return (
          <React.Fragment key={step.label}>
            <div className="step">
              <div className={`step-circle ${status}`}>
                {isCompleted ? '✓' : stepNum}
              </div>
              <span className={`step-label ${status}`}>{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`step-line${isCompleted ? ' completed' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
