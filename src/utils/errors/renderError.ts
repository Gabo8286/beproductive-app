/**
 * Reusable error rendering utility for DOM error display
 * Provides consistent, accessible error UI across the application
 */

/**
 * Render an error message in the DOM with optional diagnostic report
 * @param rootElement - The root DOM element to render into
 * @param title - Error title
 * @param message - Error message or description
 * @param diagnosticsReport - Optional diagnostic report JSON string
 */
export function renderError(
  rootElement: HTMLElement,
  title: string,
  message: string,
  diagnosticsReport?: string,
): void {
  rootElement.innerHTML = `
    <div role="alert" aria-live="assertive" style="
      padding: 2rem;
      max-width: 800px;
      margin: 2rem auto;
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      color: #991b1b;
    ">
      <h1 style="margin-top: 0; color: #dc2626;">${title}</h1>
      <pre style="
        background: #fff;
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
        white-space: pre-wrap;
        color: #374151;
      ">${message}</pre>
      <p style="margin-bottom: 0;">
        Please fix the configuration issues above and refresh the page.
      </p>
      ${diagnosticsReport ? `
      <details style="margin-top: 1rem;">
        <summary style="cursor: pointer; user-select: none;">Diagnostic Report</summary>
        <pre style="
          font-size: 10px; 
          margin-top: 0.5rem;
          background: #fff;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
        ">${diagnosticsReport}</pre>
      </details>
      ` : ''}
    </div>
  `;
}
