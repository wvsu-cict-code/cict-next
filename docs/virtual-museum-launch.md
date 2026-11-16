# BSEMC Virtual Museum: launch checklist

Student accounts depend on Supabase settings that `supabase/config.toml`
only applies to the local stack. Do these on the hosted project (Supabase
Dashboard) before the museum goes live.

## Checklist

- [ ] **Custom SMTP** (Authentication → Emails → SMTP Settings). The
      built-in sender allows only a few emails per hour, which is not enough
      for confirmation and password-reset emails. Set the sender name and
      address (for example "WVSU CICT").
- [ ] **Allow sign-ups** (Authentication → Sign In / Providers): "Allow new
      users to sign up" on, and the Email provider on.
- [ ] **Email confirmations on** (Authentication → Sign In / Providers →
      Email → "Confirm email").
- [ ] **Site URL and redirect URLs** (Authentication → URL Configuration):
  - Site URL: the school site, for example `https://<school-site>/`.
  - Redirect URLs:
    - `https://<school-site>/account/confirm/` (confirmation and
      password-reset links land here);
    - the CMS URL, for example `https://<cms-site>/**`.
- [ ] **Push the database changes**: `supabase db push` from the repo root,
      linked to the hosted project. This also applies
      `20261116021000_museum_email_change_guard.sql`, which stops students
      from changing their account email (or a pending email change) to a
      non-`@wvsu.edu.ph` address after sign-up. Admins are exempt.
- [ ] **Storage origin**: in the SQL editor run
      `update public.museum_config set storage_origin = '<NEXT_PUBLIC_SUPABASE_URL without trailing slash>';`
      The migration seeds the local value (`http://127.0.0.1:54321`). It must
      equal the project URL the site uses (`NEXT_PUBLIC_SUPABASE_URL`), or
      every student submission is refused with `media_not_owned`.
- [ ] **Before User Created hook** (Authentication → Hooks → "Before User
      Created"): enable it, type Postgres, schema `public`, function
      `restrict_signup_to_wvsu`. The function and its grants come from
      `supabase/migrations/20261116020000_museum_accounts.sql`, so the database
      changes must be pushed first (previous step).
- [ ] **Email templates** (Authentication → Emails → Templates):
  - "Confirm signup": subject `Confirm your WVSU CICT account`, body from
    `supabase/templates/confirmation.html`;
  - "Reset Password": subject `Reset your WVSU CICT account password`, body
    from `supabase/templates/recovery.html`.

  Paste the files as they are. Both links use
  `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=…`, so they work even
  when opened in a different browser from the one the student signed up in.
- [ ] **Storage limits** (Settings → Billing / Storage): confirm the plan's
      total storage is 1 GB (the budget the site shows) and the global
      per-file upload limit is at least 20 MB (videos and audio are up to
      20 MB).
- [ ] **Admins with non-WVSU addresses**: create them with
      `npm run cms:create-admin -- <email> <password>`. Signing up through
      the site only works with an `@wvsu.edu.ph` address.

## Manual test: non-WVSU sign-up is refused

After the steps above, try to sign up with a gmail address. It must be
refused with "Use your WVSU email address (@wvsu.edu.ph) to sign up." and no
user is created.

From the repo root (uses the project URL and publishable key from
`.env.local`; locally, `supabase status` prints them):

```sh
node --env-file=.env.local --input-type=module -e '
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
const { data, error } = await supabase.auth.signUp({
  email: "x@gmail.com",
  password: "not-a-real-password-123",
  options: { data: { display_name: "Test" } },
});
console.log(error ? `${error.status} ${error.message}` : data);
'
```

Expected output: `403 Use your WVSU email address (@wvsu.edu.ph) to sign
up.`

Then check the allowed path: sign up on the site with a real `@wvsu.edu.ph`
address, open the confirmation email, follow the link, and sign in.
