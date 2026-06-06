// jsdom doesn't implement hasPointerCapture, which is required by Radix UI Select
if (typeof window !== "undefined" && !window.Element.prototype.hasPointerCapture) {
  window.Element.prototype.hasPointerCapture = () => false;
}

// jsdom doesn't implement scrollIntoView, required by Radix UI Select
if (typeof window !== "undefined" && !window.Element.prototype.scrollIntoView) {
  window.Element.prototype.scrollIntoView = () => {};
}
