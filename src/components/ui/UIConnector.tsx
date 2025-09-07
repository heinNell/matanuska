import React, { useState, useEffect } from "react";

// Types
interface UIStatus {
  totalElements: number;
  connectedElements: number;
  disconnectedElements: number;
  details: {
    buttons: { total: number; connected: number };
    forms: { total: number; connected: number };
    inputs: { total: number; connected: number };
  };
}

/**
 * UIConnector Component
 *
 * This component provides real-time UI connection monitoring
 * by highlighting connected and disconnected UI elements
 */
const UIConnector: React.FC = () => {
  const [isActive, setIsActive] = useState<boolean>(true);
  const [status, setStatus] = useState<UIStatus>({
    totalElements: 0,
    connectedElements: 0,
    disconnectedElements: 0,
    details: {
      buttons: { total: 0, connected: 0 },
      forms: { total: 0, connected: 0 },
      inputs: { total: 0, connected: 0 },
    },
  });
  const [showReport, setShowReport] = useState<boolean>(false);

  // Apply styles when component mounts
  useEffect(() => {
    if (!isActive) return;

    // Create style element for highlighting UI elements
    const styleEl = document.createElement("style");
    document.head.appendChild(styleEl);

    // CSS to highlight different UI elements
    styleEl.innerHTML = `
      .ui-connector-highlight-button {
        outline: 3px solid #4CAF50 !important;
        position: relative;
      }

      .ui-connector-highlight-no-handler {
        outline: 3px solid #f44336 !important;
        position: relative;
      }

      .ui-connector-highlight-form {
        outline: 2px dotted #2196F3 !important;
        position: relative;
      }

      .ui-connector-tag {
        position: absolute;
        top: -20px;
        left: 0;
        background: #333;
        color: white;
        font-size: 10px;
        padding: 2px 5px;
        border-radius: 3px;
        z-index: 10000;
      }
    `;

    // Analyze the UI
    analyzeUI();

    // Cleanup function
    return () => {
      document.head.removeChild(styleEl);
      removeHighlights();
    };
  }, [isActive]);

  // Function to analyze the UI and apply highlights
  const analyzeUI = () => {
    if (!isActive) return;

    // Remove existing highlights
    removeHighlights();

    // Track statistics
    const stats: UIStatus = {
      totalElements: 0,
      connectedElements: 0,
      disconnectedElements: 0,
      details: {
        buttons: { total: 0, connected: 0 },
        forms: { total: 0, connected: 0 },
        inputs: { total: 0, connected: 0 },
      },
    };

    // Find all buttons
    const buttons = document.querySelectorAll('button, [role="button"], .btn, .button');
    stats.details.buttons.total = buttons.length;
    stats.totalElements += buttons.length;

    buttons.forEach((button) => {
      const element = button as HTMLElement;
      const hasHandler = hasClickHandler(element);

      if (hasHandler) {
        element.classList.add("ui-connector-highlight-button");
        stats.connectedElements++;
        stats.details.buttons.connected++;
        addTag(element, "Button ✓");
      } else {
        element.classList.add("ui-connector-highlight-no-handler");
        stats.disconnectedElements++;
        addTag(element, "Button ✗");
      }
    });

    // Find all forms
    const forms = document.querySelectorAll("form");
    stats.details.forms.total = forms.length;
    stats.totalElements += forms.length;

    forms.forEach((form) => {
      const element = form;
      const hasHandler = hasSubmitHandler(element);

      if (hasHandler) {
        element.classList.add("ui-connector-highlight-form");
        stats.connectedElements++;
        stats.details.forms.connected++;
        addTag(element, "Form ✓");
      } else {
        element.classList.add("ui-connector-highlight-no-handler");
        stats.disconnectedElements++;
        addTag(element, "Form ✗");
      }
    });

    // Find all inputs
    const inputs = document.querySelectorAll("input, select, textarea");
    stats.details.inputs.total = inputs.length;
    stats.totalElements += inputs.length;

    inputs.forEach((input) => {
      const element = input as HTMLInputElement;
      const hasHandler = hasChangeHandler(element);

      if (hasHandler) {
        element.classList.add("ui-connector-highlight-button");
        stats.connectedElements++;
        stats.details.inputs.connected++;
      } else {
        element.classList.add("ui-connector-highlight-no-handler");
        stats.disconnectedElements++;
      }
    });

    // Update status
    setStatus(stats);
  };

  // Helper function to check for click handlers
  const hasClickHandler = (element: HTMLElement): boolean => {
    const clickEvents = getEventListeners(element, "click");
    return clickEvents.length > 0;
  };

  // Helper function to check for submit handlers
  const hasSubmitHandler = (element: HTMLFormElement): boolean => {
    const submitEvents = getEventListeners(element, "submit");
    return submitEvents.length > 0;
  };

  // Helper function to check for change handlers
  const hasChangeHandler = (element: HTMLInputElement): boolean => {
    const changeEvents = getEventListeners(element, "change");
    const inputEvents = getEventListeners(element, "input");
    return changeEvents.length > 0 || inputEvents.length > 0;
  };

  // Helper function to get event listeners (simplified implementation)
  const getEventListeners = (element: HTMLElement, eventType: string): any[] => {
    // This is a simplified approach that won't catch all handlers
    // In a real implementation, we'd need to use browser devtools APIs
    // or monkey-patch addEventListener

    // Check for onclick attribute
    if (eventType === "click" && element.hasAttribute("onclick")) {
      return [{ type: "attribute" }];
    }

    // Check for onsubmit attribute
    if (eventType === "submit" && element.hasAttribute("onsubmit")) {
      return [{ type: "attribute" }];
    }

    // Check for onchange attribute
    if (
      (eventType === "change" || eventType === "input") &&
      (element.hasAttribute("onchange") || element.hasAttribute("oninput"))
    ) {
      return [{ type: "attribute" }];
    }

    // For React components, check for special properties
    // This is a heuristic approach and won't catch all React handlers
    const reactKey = Object.keys(element).find(
      (key) => key.startsWith("__reactProps$") || key.startsWith("__reactEventHandlers$")
    );

    if (reactKey) {
      const reactProps = (element as any)[reactKey];
      if (eventType === "click" && (reactProps.onClick || reactProps.onPress)) {
        return [{ type: "react" }];
      }
      if (eventType === "submit" && reactProps.onSubmit) {
        return [{ type: "react" }];
      }
      if (
        (eventType === "change" || eventType === "input") &&
        (reactProps.onChange || reactProps.onInput)
      ) {
        return [{ type: "react" }];
      }
    }

    return [];
  };

  // Helper function to add tag to element
  const addTag = (element: HTMLElement, text: string) => {
    const tag = document.createElement("div");
    tag.className = "ui-connector-tag";
    tag.textContent = text;
    element.style.position = "relative";
    element.appendChild(tag);
  };

  // Remove all highlights
  const removeHighlights = () => {
    document
      .querySelectorAll(
        ".ui-connector-highlight-button, .ui-connector-highlight-no-handler, .ui-connector-highlight-form"
      )
      .forEach((element) => {
        (element as HTMLElement).classList.remove(
          "ui-connector-highlight-button",
          "ui-connector-highlight-no-handler",
          "ui-connector-highlight-form"
        );
      });

    document.querySelectorAll(".ui-connector-tag").forEach((element) => element.remove());
  };

  // Toggle the connector on/off
  const toggleConnector = () => {
    setIsActive(!isActive);
  };

  // Toggle the report display
  const toggleReport = () => {
    setShowReport(!showReport);
  };

  // Calculate the connection percentage
  const connectionPercentage =
    status.totalElements > 0
      ? Math.round((status.connectedElements / status.totalElements) * 100)
      : 0;

  // Handle button clicks based on button text
  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonText = (event.target as HTMLButtonElement).textContent?.trim();

    if (buttonText === "Show Report" || buttonText === "Hide Report") {
      toggleReport();
    } else if (buttonText === "Enable Highlights" || buttonText === "Disable Highlights") {
      toggleConnector();
    }
  };
  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      {showReport && (
        <div
          style={{
            backgroundColor: "#333",
            color: "white",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "10px",
            width: "300px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0" }}>UI Connection Report</h3>
          <p>Total Elements: {status.totalElements}</p>
          <p style={{ color: "#4CAF50" }}>Connected: {status.connectedElements}</p>
          <p style={{ color: "#f44336" }}>Disconnected: {status.disconnectedElements}</p>
          <div
            style={{
              height: "10px",
              backgroundColor: "#555",
              borderRadius: "5px",
              overflow: "hidden",
              marginTop: "10px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${connectionPercentage}%`,
                backgroundColor:
                  connectionPercentage > 75
                    ? "#4CAF50"
                    : connectionPercentage > 50
                      ? "#FFC107"
                      : "#f44336",
                transition: "width 0.5s ease",
              }}
             />
          </div>
          <p>{connectionPercentage}% connected</p>

          <h4 style={{ margin: "15px 0 5px 0" }}>Details</h4>
          <p>
            Buttons: {status.details.buttons.connected}/{status.details.buttons.total}
          </p>
          <p>
            Forms: {status.details.forms.connected}/{status.details.forms.total}
          </p>
          <p>
            Inputs: {status.details.inputs.connected}/{status.details.inputs.total}
          </p>

          <div style={{ marginTop: "15px" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
              <div
                style={{
                  width: "15px",
                  height: "15px",
                  backgroundColor: "#4CAF50",
                  marginRight: "5px",
                }}
               />
              <span>Connected Element</span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: "15px",
                  height: "15px",
                  backgroundColor: "#f44336",
                  marginRight: "5px",
                }}
               />
              <span>Disconnected Element</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={onClick}
          style={{
            backgroundColor: showReport ? "#555" : "#333",
            color: "white",
            border: "none",
            padding: "8px 15px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {showReport ? "Hide Report" : "Show Report"}
        </button>

        <button
          onClick={onClick}
          style={{
            backgroundColor: isActive ? "#4CAF50" : "#f44336",
            color: "white",
            border: "none",
            padding: "8px 15px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {isActive ? "Disable Highlights" : "Enable Highlights"}
        </button>
      </div>
    </div>
  );
};

export default UIConnector;
