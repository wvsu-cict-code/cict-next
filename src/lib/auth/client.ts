import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { confirmUrl, isWvsuEmail, normalizeEmail } from "./email";

type Client = SupabaseClient<Database>;
export type AuthResult = { error?: string };

const MIN_PASSWORD_LENGTH = 8;
const WVSU_MESSAGE = "Use your WVSU email address (@wvsu.edu.ph) to sign up.";
const SHORT_PASSWORD = `Use a password of at least ${MIN_PASSWORD_LENGTH} characters.`;
const GENERIC = "Something went wrong. Try again.";

type AuthErrorLike = { status?: number; code?: string; message?: string };

export async function signUp(
  client: Client,
  input: { email: string; password: string; displayName: string },
): Promise<AuthResult> {
  if (!isWvsuEmail(input.email)) return { error: WVSU_MESSAGE };
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return { error: SHORT_PASSWORD };
  }
  const { error } = await client.auth.signUp({
    email: normalizeEmail(input.email),
    password: input.password,
    options: {
      data: { display_name: input.displayName.trim() },
      emailRedirectTo: confirmUrl(location.origin),
    },
  });
  if (!error) return {};
  const e = error as AuthErrorLike;
  if (e.status === 403) return { error: WVSU_MESSAGE };
  if (e.code === "user_already_exists") {
    return { error: "That email already has an account. Sign in instead." };
  }
  return { error: e.message || GENERIC };
}

export async function signIn(
  client: Client,
  input: { email: string; password: string },
): Promise<AuthResult> {
  const { error } = await client.auth.signInWithPassword({
    email: normalizeEmail(input.email),
    password: input.password,
  });
  if (!error) return {};
  const e = error as AuthErrorLike;
  if (e.code === "email_not_confirmed") {
    return {
      error: "Confirm your email first — check your inbox for the link.",
    };
  }
  if (e.code === "invalid_credentials") {
    return { error: "That email and password don't match." };
  }
  return { error: e.message || GENERIC };
}

export async function signOut(client: Client): Promise<AuthResult> {
  const { error } = await client.auth.signOut();
  return error ? { error: error.message || GENERIC } : {};
}

export async function requestPasswordReset(
  client: Client,
  email: string,
): Promise<AuthResult> {
  const { error } = await client.auth.resetPasswordForEmail(
    normalizeEmail(email),
    { redirectTo: confirmUrl(location.origin) },
  );
  return error ? { error: error.message || GENERIC } : {};
}

export async function updatePassword(
  client: Client,
  password: string,
): Promise<AuthResult> {
  if (password.length < MIN_PASSWORD_LENGTH) return { error: SHORT_PASSWORD };
  const { error } = await client.auth.updateUser({ password });
  return error ? { error: error.message || GENERIC } : {};
}

export async function verifyEmailLink(
  client: Client,
  params: URLSearchParams,
): Promise<
  { next: "/account/" | "/account/reset-password/" } | { error: string }
> {
  const tokenHash = params.get("token_hash");
  const type = params.get("type");
  if (!tokenHash || (type !== "email" && type !== "recovery")) {
    return {
      error: "This link is incomplete. Open the latest email we sent you.",
    };
  }
  const { error } = await client.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });
  if (error) {
    return {
      error: "This link has expired or was already used. Request a new one.",
    };
  }
  return { next: type === "recovery" ? "/account/reset-password/" : "/account/" };
}
