/**
 * Safely initialize automated accessibility testing in development
 * Delays initialization until after React mount to prevent Safari render blocking
 */
export const initializeAccessibilityTesting = async () => {
  // Enhanced environment checks
  if (
    process.env.NODE_ENV === "production" ||
    !import.meta.env.DEV ||
    typeof window === "undefined"
  ) {
    return;
  }

  // Browser compatibility check - skip problematic browsers in certain environments
  const userAgent = navigator.userAgent;
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isBrave = /Brave/.test(userAgent) || (navigator as any).brave;

  try {
    // Add delay to ensure React has fully mounted
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Dynamic import with error handling
    const [axeReact, React, ReactDOM] = await Promise.all([
      import("@axe-core/react"),
      import("react"),
      import("react-dom"),
    ]);

    // Additional safety check - ensure DOM is ready
    if (!document.getElementById("root")?.hasChildNodes()) {
      console.warn(
        "⚠️ Accessibility testing skipped - React not fully mounted",
      );
      return;
    }

    // Initialize with timeout and error boundary
    const initTimeout = setTimeout(() => {
      console.warn("⚠️ Accessibility testing initialization timed out");
    }, 5000);

    axeReact.default(React, ReactDOM, 2000, {
      rules: [
        // Enable key WCAG 2.1 Level AA rules (reduced set for performance)
        { id: "color-contrast", enabled: true },
        { id: "aria-required-children", enabled: true },
        { id: "aria-required-parent", enabled: true },
        { id: "button-name", enabled: true },
        { id: "duplicate-id", enabled: true },
        { id: "html-has-lang", enabled: true },
        { id: "image-alt", enabled: true },
        { id: "label", enabled: true },
        { id: "link-name", enabled: true },
      ],
    });

    clearTimeout(initTimeout);
    console.log(
      `🔍 Accessibility testing initialized safely${isSafari ? " (Safari)" : ""}${isBrave ? " (Brave)" : ""}. Violations will be logged to console.`,
    );
  } catch (error) {
    console.warn("⚠️ Accessibility testing failed to initialize:", error);
    // Continue without blocking the app
  }
};

/**
 * Run accessibility audit on demand
 * Useful for testing specific components or states
 */
export const runAccessibilityAudit = async (
  element: HTMLElement = document.body,
) => {
  if (typeof window === "undefined") return;

  try {
    const { default: axeCore } = await import("axe-core");
    const results = await axeCore.run(element, {
      rules: {
        "color-contrast": { enabled: true },
        "aria-required-children": { enabled: true },
        "aria-required-parent": { enabled: true },
        "button-name": { enabled: true },
        "duplicate-id": { enabled: true },
        "html-has-lang": { enabled: true },
        "image-alt": { enabled: true },
        label: { enabled: true },
        "link-name": { enabled: true },
      },
    });

    if (results.violations.length > 0) {
      console.group("🚨 Accessibility Violations Found");
      results.violations.forEach((violation) => {
        console.group(`${violation.impact?.toUpperCase()}: ${violation.help}`);
        console.log("Description:", violation.description);
        console.log("Help URL:", violation.helpUrl);
        console.log("Affected nodes:", violation.nodes.length);

        violation.nodes.forEach((node, index) => {
          console.group(`Node ${index + 1}`);
          console.log("Element:", node.html);
          console.log("Target:", node.target);
          console.log(
            "Fix any of:",
            node.any.map((check) => check.message),
          );
          console.groupEnd();
        });

        console.groupEnd();
      });
      console.groupEnd();

      return {
        passed: false,
        violations: results.violations,
        summary: `Found ${results.violations.length} accessibility violations`,
      };
    }

    console.log("✅ No accessibility violations found");
    return {
      passed: true,
      violations: [],
      summary: "All accessibility checks passed",
    };
  } catch (error) {
    console.error("Error running accessibility audit:", error);
    return {
      passed: false,
      violations: [],
      summary: "Error running audit",
    };
  }
};

/**
 * Log accessibility violations in a user-friendly format
 */
export const logAccessibilityViolations = (violations: any[]) => {
  if (violations.length === 0) {
    console.log("✅ No accessibility violations");
    return;
  }

  const criticalCount = violations.filter(
    (v) => v.impact === "critical",
  ).length;
  const seriousCount = violations.filter((v) => v.impact === "serious").length;
  const moderateCount = violations.filter(
    (v) => v.impact === "moderate",
  ).length;
  const minorCount = violations.filter((v) => v.impact === "minor").length;

  console.group(`🚨 ${violations.length} Accessibility Violations`);

  if (criticalCount > 0) console.error(`🔴 Critical: ${criticalCount}`);
  if (seriousCount > 0) console.warn(`🟠 Serious: ${seriousCount}`);
  if (moderateCount > 0) console.warn(`🟡 Moderate: ${moderateCount}`);
  if (minorCount > 0) console.info(`🔵 Minor: ${minorCount}`);

  console.groupEnd();
};
