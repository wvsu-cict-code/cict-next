import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  requestPasswordReset,
  signIn,
  signOut,
  signUp,
  updatePassword,
  verifyEmailLink,
} from "./client";

type Client = SupabaseClient<Database>;

function fakeClient(auth: Record<string, unknown>) {
  return { auth } as unknown as Client;
}

const WVSU_MESSAGE = "Use your WVSU email address (@wvsu.edu.ph) to sign up.";

describe("signUp", () => {
  it("rejects a non-WVSU email without calling Supabase", async () => {
    const auth = { signUp: vi.fn() };
    const result = await signUp(fakeClient(auth), {
      email: "ana@gmail.com",
      password: "longenough",
      displayName: "Ana",
    });
    expect(result).toEqual({ error: WVSU_MESSAGE });
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it("requires a password of at least 8 characters", async () => {
    const auth = { signUp: vi.fn() };
    const result = await signUp(fakeClient(auth), {
      email: "ana@wvsu.edu.ph",
      password: "short",
      displayName: "Ana",
    });
    expect(result.error).toBeTruthy();
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it("sends the display name and the redirect URL", async () => {
    const auth = { signUp: vi.fn().mockResolvedValue({ error: null }) };
    const result = await signUp(fakeClient(auth), {
      email: " Ana@WVSU.edu.ph",
      password: "longenough",
      displayName: "Ana",
    });
    expect(result).toEqual({});
    expect(auth.signUp).toHaveBeenCalledWith({
      email: "ana@wvsu.edu.ph",
      password: "longenough",
      options: {
        data: { display_name: "Ana" },
        emailRedirectTo: `${location.origin}/account/confirm/`,
      },
    });
  });

  it("turns a 403 hook error into the WVSU message", async () => {
    const auth = {
      signUp: vi
        .fn()
        .mockResolvedValue({ error: { status: 403, message: "hook said no" } }),
    };
    const result = await signUp(fakeClient(auth), {
      email: "ana@wvsu.edu.ph",
      password: "longenough",
      displayName: "Ana",
    });
    expect(result).toEqual({ error: WVSU_MESSAGE });
  });
});

describe("signIn", () => {
  it("reports a mismatch plainly", async () => {
    const auth = {
      signInWithPassword: vi.fn().mockResolvedValue({
        error: { status: 400, code: "invalid_credentials", message: "x" },
      }),
    };
    expect(
      await signIn(fakeClient(auth), { email: "a@wvsu.edu.ph", password: "p" }),
    ).toEqual({ error: "That email and password don't match." });
  });

  it("asks for confirmation when the email is unconfirmed", async () => {
    const auth = {
      signInWithPassword: vi.fn().mockResolvedValue({
        error: { status: 400, code: "email_not_confirmed", message: "x" },
      }),
    };
    expect(
      await signIn(fakeClient(auth), { email: "a@wvsu.edu.ph", password: "p" }),
    ).toEqual({
      error: "Confirm your email first — check your inbox for the link.",
    });
  });

  it("succeeds with no error", async () => {
    const auth = {
      signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    };
    expect(
      await signIn(fakeClient(auth), { email: " A@wvsu.edu.ph", password: "p" }),
    ).toEqual({});
    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: "a@wvsu.edu.ph",
      password: "p",
    });
  });
});

describe("signOut", () => {
  it("signs out", async () => {
    const auth = { signOut: vi.fn().mockResolvedValue({ error: null }) };
    expect(await signOut(fakeClient(auth))).toEqual({});
  });
});

describe("requestPasswordReset", () => {
  it("sends the confirm redirect URL", async () => {
    const auth = {
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
    };
    expect(await requestPasswordReset(fakeClient(auth), " Ana@wvsu.edu.ph")).toEqual(
      {},
    );
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith("ana@wvsu.edu.ph", {
      redirectTo: `${location.origin}/account/confirm/`,
    });
  });
});

describe("updatePassword", () => {
  it("requires at least 8 characters", async () => {
    const auth = { updateUser: vi.fn() };
    const result = await updatePassword(fakeClient(auth), "short");
    expect(result.error).toBeTruthy();
    expect(auth.updateUser).not.toHaveBeenCalled();
  });

  it("updates the password", async () => {
    const auth = { updateUser: vi.fn().mockResolvedValue({ error: null }) };
    expect(await updatePassword(fakeClient(auth), "longenough")).toEqual({});
    expect(auth.updateUser).toHaveBeenCalledWith({ password: "longenough" });
  });
});

describe("verifyEmailLink", () => {
  it("sends a recovery link to the reset page", async () => {
    const auth = { verifyOtp: vi.fn().mockResolvedValue({ error: null }) };
    const result = await verifyEmailLink(
      fakeClient(auth),
      new URLSearchParams("token_hash=abc&type=recovery"),
    );
    expect(result).toEqual({ next: "/account/reset-password/" });
    expect(auth.verifyOtp).toHaveBeenCalledWith({
      token_hash: "abc",
      type: "recovery",
    });
  });

  it("sends an email link to the account page", async () => {
    const auth = { verifyOtp: vi.fn().mockResolvedValue({ error: null }) };
    const result = await verifyEmailLink(
      fakeClient(auth),
      new URLSearchParams("token_hash=abc&type=email"),
    );
    expect(result).toEqual({ next: "/account/" });
  });

  it("reports a missing token", async () => {
    const auth = { verifyOtp: vi.fn() };
    const result = await verifyEmailLink(
      fakeClient(auth),
      new URLSearchParams("type=email"),
    );
    expect(result).toEqual({
      error: "This link is incomplete. Open the latest email we sent you.",
    });
    expect(auth.verifyOtp).not.toHaveBeenCalled();
  });

  it("reports an expired link", async () => {
    const auth = {
      verifyOtp: vi.fn().mockResolvedValue({ error: { message: "expired" } }),
    };
    const result = await verifyEmailLink(
      fakeClient(auth),
      new URLSearchParams("token_hash=abc&type=email"),
    );
    expect(result).toEqual({
      error: "This link has expired or was already used. Request a new one.",
    });
  });
});
