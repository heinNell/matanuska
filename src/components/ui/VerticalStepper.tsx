

import React, { useState } from "react";
import { Card, CardContent } from "./Card";
import { Button } from "./Button";

interface Step {
  title: string;
  content: React.ReactNode;
}

const steps: Step[] = [
  {
    title: "Step 1",
    content: <div>Content for Step 1</div>,
  },
  {
    title: "Step 2",
    content: <div>Content for Step 2</div>,
  },
  {
    title: "Step 3",
    content: <div>Content for Step 3</div>,
  },
];

const VerticalStepper: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {steps.map((step, idx) => (
        <Card key={idx} className={`mb-4 w-full max-w-md ${idx === currentStep ? "border-blue-500 border-2" : "border-gray-200 border"}`}>
          <CardContent>
            <div className="font-bold text-lg mb-2">{step.title}</div>
            <div className="mb-4">{step.content}</div>
            {idx === currentStep && (
              <div className="flex justify-end gap-2">
                <Button onClick={handlePrevious} disabled={currentStep === 0}>
                  Previous
                </Button>
                <Button onClick={handleNext} disabled={currentStep === steps.length - 1}>
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default VerticalStepper;
