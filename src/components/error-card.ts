export function createErrorCard(message: string): HTMLElement {
  const containerEl = window.createDiv();
  containerEl.addClass("auto-card-link-error-container");

  containerEl.textContent = message;

  return containerEl;
}
