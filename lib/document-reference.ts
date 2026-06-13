export function normalizeDocumentPrefix(prefix: string): string {
  return prefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "DT";
}

export function stripDocumentPrefix(reference: string): string {
  const separator = reference.indexOf("-");
  return separator >= 0 ? reference.slice(separator + 1) : reference;
}

export function createDocumentReference(
  prefix: string,
  type: "RCP" | "QTN",
  source: string,
  suffix?: string,
): string {
  return [
    normalizeDocumentPrefix(prefix),
    type,
    stripDocumentPrefix(source),
    suffix,
  ].filter(Boolean).join("-");
}
