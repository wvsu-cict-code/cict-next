const DEFAULT_NEXT = "/account/";

/** Only same-site paths: start with a single "/", no "//" or backslash tricks. */
export function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/")) return DEFAULT_NEXT;
  if (value.startsWith("//") || value.includes("\\")) return DEFAULT_NEXT;
  return value;
}
