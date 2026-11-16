export const WVSU_DOMAIN = "wvsu.edu.ph";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Same rule as the before-user-created hook on the server. */
export function isWvsuEmail(email: string): boolean {
  const value = normalizeEmail(email);
  const at = value.lastIndexOf("@");
  return at > 0 && value.slice(at + 1) === WVSU_DOMAIN;
}

export function confirmUrl(origin: string): string {
  return `${origin}/account/confirm/`;
}
