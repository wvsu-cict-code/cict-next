// Creates (or promotes) a CMS admin account.
//
// Usage:
//   npm run cms:create-admin -- admin@example.com 'a-strong-password'
//
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.
// The secret key bypasses RLS, so keep it out of the browser and out of git.
//
// Self-service sign-up only accepts @wvsu.edu.ph addresses (the
// restrict_signup_to_wvsu auth hook). Admins with any other email address
// can only be created here. The admin API does not run the before-user-created
// hook, so app_metadata.cms_admin is a safeguard rather than what lets the
// account through; it is also the exemption the email-change guard honours,
// so these admins can keep a non-WVSU address. Only the secret key can set it.
// Being an admin is still decided by admin_users alone.

import { createClient } from "@supabase/supabase-js";

const [email, password] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!email || !password) {
  console.error("Usage: npm run cms:create-admin -- <email> <password>");
  process.exit(1);
}

if (!url || !secretKey) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local first.",
  );
  process.exit(1);
}

const supabase = createClient(url, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findUserByEmail(target) {
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) throw error;
    const match = data.users.find(
      (user) => user.email?.toLowerCase() === target.toLowerCase(),
    );
    if (match || data.users.length < 200) return match ?? null;
  }
}

let user = await findUserByEmail(email);

if (user) {
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    password,
    app_metadata: { cms_admin: true },
  });
  if (error) throw error;
  console.log(`Updated password for existing user ${email}`);
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { cms_admin: true },
  });
  if (error) throw error;
  user = data.user;
  console.log(`Created user ${email}`);
}

const { error } = await supabase
  .from("admin_users")
  .upsert({ user_id: user.id }, { onConflict: "user_id" });
if (error) throw error;

console.log(`${email} is now a CMS admin.`);
