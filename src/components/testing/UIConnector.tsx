// UIConnector.tsx
// A component to inject into the app for testing UI interactions

import React, { useEffect, useState } from "react";

interface UIElement {
  type: string;
  count: number;
  connected: boolean;
  examples: string[];
}

const styles = {
  container: {
    position: "fixed" as "fixed",
    bottom: "20px",
    right: "20px",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    color: "white",
    padding: "10px",
    borderRadius: "5px",
    zIndex: 9999,
    width: "300px",
    maxHeight: "80vh",
    overflow: "auto",
    boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
    paddingBottom: "5px",
  },
  button: {
    backgroundColor: "#4299e1",
    color: "white",
    border: "none",
    borderRadius: "3px",
    padding: "5px 10px",
    marginRight: "5px",
    cursor: "pointer",
  },
  buttonRed: {
    backgroundColor: "#e53e3e",
  },
  buttonGreen: {
    backgroundColor: "#48bb78",
  },
  section: {
    marginBottom: "10px",
    padding: "5px",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: "3px",
  },
  title: {
    fontWeight: "bold",
    marginBottom: "5px",
    fontSize: "14px",
  },
  list: {
    margin: 0,
    padding: "0 0 0 20px",
    fontSize: "12px",
  },
  item: {
    margin: "2px 0",
  },
  status: {
    display: "inline-block",
    width: "15px",
    height: "15px",
    borderRadius: "50%",
    marginRight: "5px",
  },
  statusGood: {
    backgroundColor: "#48bb78",
  },
  statusBad: {
    backgroundColor: "#e53e3e",
  },
};

export const UIConnector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [highlightActive, setHighlightActive] = useState(false);
  const [uiReport, setUiReport] = useState<{
    buttons: UIElement[];
    forms: UIElement[];
    links: UIElement[];
  }>({
    buttons: [],
    forms: [],
    links: [],
  });

  useEffect(() => {
    analyzeUI();
  }, []);

  const analyzeUI = () => {
    // Find buttons
    const buttons = document.querySelectorAll(
      'button, input[type="submit"], input[type="button"], .btn, [role="button"]'
    );

    // Find forms
    const forms = document.querySelectorAll("form");

    // Find links
    const links = document.querySelectorAll("a:not(.btn)");

    // Analyze buttons
    const buttonElements: UIElement[] = [];
    buttons.forEach((button) => {
      // Check if button has click handler
      const hasHandler =
        (button as any)?.onclick !== null ||
        button.getAttribute("onClick") !== null ||
        button.getAttribute("on-click") !== null;

      buttonElements.push({
        type: button.tagName.toLowerCase(),
        count: 1,
        connected: hasHandler,
        examples: [button.textContent || button.getAttribute("value") || "Unnamed button"],
      });
    });

    // Analyze forms
    const formElements: UIElement[] = [];
    forms.forEach((form) => {
      // Check if form has submit handler
      const hasHandler =
        (form as any)?.onsubmit !== null ||
        form.getAttribute("onSubmit") !== null ||
        form.getAttribute("on-submit") !== null;

      formElements.push({
        type: "form",
        count: 1,
        connected: hasHandler,
        examples: [form.getAttribute("id") || form.getAttribute("name") || "Unnamed form"],
      });
    });

    // Analyze links
    const linkElements: UIElement[] = [];
    links.forEach((link) => {
      linkElements.push({
        type: "a",
        count: 1,
        connected: link.hasAttribute("href") && link.getAttribute("href") !== "#",
        examples: [link.textContent || link.getAttribute("title") || "Unnamed link"],
      });
    });

    setUiReport({
      buttons: buttonElements,
      forms: formElements,
      links: linkElements,
    });
  };

  const highlightElements = (type: "buttons" | "forms" | "links", connected: boolean) => {
    // Remove previous highlights
    document.querySelectorAll("[data-ui-highlighted]").forEach((el) => {
      (el as HTMLElement).style.outline = "";
      el.removeAttribute("data-ui-highlighted");
    });

    setHighlightActive(true);

    // Add highlights based on type
    let selector = "";
    let color = "";

    if (type === "buttons") {
      selector = 'button, input[type="submit"], input[type="button"], .btn, [role="button"]';
      color = connected ? "3px solid green" : "3px solid red";
    } else if (type === "forms") {
      selector = "form";
      color = connected ? "3px dashed green" : "3px dashed red";
    } else if (type === "links") {
      selector = "a:not(.btn)";
      color = connected ? "3px dotted blue" : "3px dotted orange";
    }

    document.querySelectorAll(selector).forEach((el) => {
      // For buttons, check connection status
      if (type === "buttons") {
        const isConnected =
          (el as any)?.onclick !== null ||
          el.getAttribute("onClick") !== null ||
          el.getAttribute("on-click") !== null;

        if (connected === isConnected) {
          (el as HTMLElement).style.outline = color;
          el.setAttribute("data-ui-highlighted", "true");
        }
      }
      // For forms, check connection status
      else if (type === "forms") {
        const isConnected =
          (el as any)?.onsubmit !== null ||
          el.getAttribute("onSubmit") !== null ||
          el.getAttribute("on-submit") !== null;

        if (connected === isConnected) {
          (el as HTMLElement).style.outline = color;
          el.setAttribute("data-ui-highlighted", "true");
        }
      }
      // For links, check if href is valid
      else if (type === "links") {
        const isConnected = el.hasAttribute("href") && el.getAttribute("href") !== "#";

        if (connected === isConnected) {
          (el as HTMLElement).style.outline = color;
          el.setAttribute("data-ui-highlighted", "true");
        }
      }
    });
  };

  const removeHighlights = () => {
    document.querySelectorAll("[data-ui-highlighted]").forEach((el) => {
      (el as HTMLElement).style.outline = "";
      el.removeAttribute("data-ui-highlighted");
    });
    setHighlightActive(false);
  };

  const onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const buttonText = event.currentTarget.textContent?.trim();

    // Handle toggle open/close
    if (buttonText === "UI Tester" || buttonText === "✕") {
      setIsOpen(!isOpen);
      removeHighlights();
      return;
    }

    // Handle re-analyze
    if (buttonText === "Re-analyze Page") {
      analyzeUI();
      removeHighlights();
      return;
    }

    // Handle remove highlights
    if (buttonText === "Remove Highlights") {
      removeHighlights();
      return;
    }

    // Handle highlight buttons
    if (buttonText?.includes("Highlight")) {
      const connected = buttonText.includes("Connected");
      const parentTitle = event.currentTarget
        .closest('[style*="section"]')
        ?.querySelector('[style*="title"]')?.textContent;

      if (parentTitle?.includes("Buttons")) {
        highlightElements("buttons", connected);
      } else if (parentTitle?.includes("Forms")) {
        highlightElements("forms", connected);
      } else if (parentTitle?.includes("Links")) {
        highlightElements("links", connected);
      }
    }
  };

  if (!isOpen) {
    return (
      <button
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 9999,
          padding: "10px",
          backgroundColor: "#4299e1",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={onClick}
      >
        UI Tester
      </button>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={{ margin: 0 }}>UI Connection Tester</h3>
        <button style={{ ...styles.button, ...styles.buttonRed }} onClick={onClick}>
          ✕
        </button>
      </div>

      <div style={styles.section}>
        <div style={styles.title}>Buttons ({uiReport.buttons.length})</div>
        <div>
          <button style={{ ...styles.button, marginBottom: "5px" }} onClick={onClick}>
            Highlight Connected
          </button>
          <button style={{ ...styles.button, marginBottom: "5px" }} onClick={onClick}>
            Highlight Disconnected
          </button>
        </div>
        <ul style={styles.list}>
          {uiReport.buttons.slice(0, 5).map((button, i) => (
            <li key={`button-${i}`} style={styles.item}>
              <span
                style={{
                  ...styles.status,
                  ...(button.connected ? styles.statusGood : styles.statusBad),
                }}
              ></span>
              {button.examples[0]}
            </li>
          ))}
          {uiReport.buttons.length > 5 && <li>...and {uiReport.buttons.length - 5} more</li>}
        </ul>
      </div>

      <div style={styles.section}>
        <div style={styles.title}>Forms ({uiReport.forms.length})</div>
        <div>
          <button style={{ ...styles.button, marginBottom: "5px" }} onClick={onClick}>
            Highlight Connected
          </button>
          <button style={{ ...styles.button, marginBottom: "5px" }} onClick={onClick}>
            Highlight Disconnected
          </button>
        </div>
        <ul style={styles.list}>
          {uiReport.forms.map((form, i) => (
            <li key={`form-${i}`} style={styles.item}>
              <span
                style={{
                  ...styles.status,
                  ...(form.connected ? styles.statusGood : styles.statusBad),
                }}
              ></span>
              {form.examples[0]}
            </li>
          ))}
        </ul>
      </div>

      <div style={styles.section}>
        <div style={styles.title}>Links ({uiReport.links.length})</div>
        <div>
          <button style={{ ...styles.button, marginBottom: "5px" }} onClick={onClick}>
            Highlight Connected
          </button>
          <button style={{ ...styles.button, marginBottom: "5px" }} onClick={onClick}>
            Highlight Disconnected
          </button>
        </div>
        <ul style={styles.list}>
          {uiReport.links.slice(0, 5).map((link, i) => (
            <li key={`link-${i}`} style={styles.item}>
              <span
                style={{
                  ...styles.status,
                  ...(link.connected ? styles.statusGood : styles.statusBad),
                }}
              ></span>
              {link.examples[0]}
            </li>
          ))}
          {uiReport.links.length > 5 && <li>...and {uiReport.links.length - 5} more</li>}
        </ul>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
        {highlightActive && (
          <button style={{ ...styles.button, ...styles.buttonRed }} onClick={onClick}>
            Remove Highlights
          </button>
        )}
        <button style={{ ...styles.button, ...styles.buttonGreen }} onClick={onClick}>
          Re-analyze Page
        </button>
      </div>
    </div>
  );
};

export default UIConnector;
