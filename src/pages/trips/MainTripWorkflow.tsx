import { Button } from "../../components/ui";
import { useState } from "react";
import CostForm from "../../components/forms/cost/CostForm";
import { TripForm } from "../../components/forms/trips/TripForm";
import { canProceedToNextStep, defaultTripWorkflowConfig } from "../../config/tripWorkflowConfig";
import FlagInvestigationPanel from "./FlagInvestigationPanel";
import PaymentTrackingPanel from "./PaymentTrackingPanel";
import ReportingPanel from "./ReportingPanel";
import SystemCostGenerator from "./SystemCostGenerator";
import TripCompletionPanel from "./TripCompletionPanel";
import TripInvoicingPanel from "./TripInvoicingPanel";

const MainTripWorkflow = () => {
  const [step, setStep] = useState(0);
  const [trip, setTrip] = useState<any>(null);
  const [costs, setCosts] = useState<any[]>([]);
  const [systemCosts, setSystemCosts] = useState<any[]>([]);
  const [invoice, setInvoice] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<"unpaid" | "paid">("unpaid");

  // Use configuration for system rates
  const systemRates = defaultTripWorkflowConfig.systemRates;
  const steps = defaultTripWorkflowConfig.steps.map((s) => s.name);

  function nextStep() {
    const currentStepId = defaultTripWorkflowConfig.steps[step]?.id;
    const allData = { trip, costs: [...costs, ...systemCosts], invoice, paymentStatus };

    if (currentStepId && canProceedToNextStep(currentStepId, allData)) {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    } else {
      alert("Cannot proceed: Please complete all requirements for this step");
    }
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0));
  }

  // Get flagged costs for the flag investigation step
  const flaggedCosts = [...costs, ...systemCosts].filter((c) => c.isFlagged);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Trip Workflow</h1>
          <span className="text-sm text-gray-500">
            Step {step + 1} of {steps.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          ></div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between text-xs">
          {steps.map((stepName, index) => (
            <div
              key={index}
              className={`text-center ${
                index <= step ? "text-blue-600 font-medium" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${
                  index < step
                    ? "bg-blue-600 text-white"
                    : index === step
                      ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                      : "bg-gray-200 text-gray-400"
                }`}
              >
                {index < step ? "✓" : index + 1}
              </div>
              <div className="max-w-16 mx-auto">{stepName}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{steps[step]}</h2>
        {step === 0 && (
          <TripForm
            onSubmit={(t) => {
              setTrip(t);
              nextStep();
            }}
            onCancel={() => {
              /* maybe navigate elsewhere */
            }}
          />
        )}
        {step === 1 && trip && (
          <CostForm
            tripId={trip.id}
            onSubmit={(c) => {
              setCosts((cs) => [...cs, c]);
            }}
            onCancel={prevStep}
            existingCosts={costs}
          />
        )}
        {step === 2 && trip && (
          <SystemCostGenerator
            trip={trip}
            rates={systemRates}
            onGenerate={(sys) => {
              setSystemCosts(sys);
              nextStep();
            }}
          />
        )}
        {step === 3 && (
          <FlagInvestigationPanel
            flaggedCosts={flaggedCosts}
            onResolve={(costId) => {
              setCosts((cs) => cs.map((c) => (c.id === costId ? { ...c, isFlagged: false } : c)));
              setSystemCosts((sys) =>
                sys.map((c) => (c.id === costId ? { ...c, isFlagged: false } : c))
              );
            }}
          />
        )}
        {step === 4 && (
          <TripCompletionPanel canComplete={flaggedCosts.length === 0} onComplete={nextStep} />
        )}
        {step === 5 && (
          <TripInvoicingPanel
            onSubmit={(inv) => {
              setInvoice(inv);
              nextStep();
            }}
            onCancel={prevStep}
          />
        )}
        {step === 6 && (
          <PaymentTrackingPanel
            invoice={invoice}
            paymentStatus={paymentStatus}
            onUpdateStatus={(status) => setPaymentStatus(status)}
          />
        )}
        {step === 7 && (
          <ReportingPanel
            trip={{
              ...trip,
              costs: [...costs, ...systemCosts],
              proofOfDelivery: invoice?.proofOfDelivery,
            }}
          />
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Button variant="outline" onClick={prevStep} disabled={step === 0}>
          Previous
        </Button>

        <div className="text-sm text-gray-500">
          {step + 1} of {steps.length}
        </div>

        {step < steps.length - 1 && step !== 2 && step !== 4 && step !== 5 && (
          <Button onClick={nextStep}>Next</Button>
        )}

        {step === steps.length - 1 && <Button variant="outline">Complete Workflow</Button>}
      </div>
    </div>
  );
};

export default MainTripWorkflow;
