# Supabase auth email templates

Paste these into **Supabase → Authentication → Emails**. They are kept here
so changes are reviewable and recoverable — the dashboard has no history.

| File | Supabase template | When members get it |
|---|---|---|
| `magic-link.html` | Magic Link | Every email sign-in. **The important one.** |
| `confirm-signup.html` | Confirm signup | Only if "Confirm email" is ever turned back on |
| `change-email.html` | Change Email Address | Member changes their address |
| `reauthentication.html` | Reauthentication | Sensitive action re-check |

Set the **subject** on each to match the comment at the top of the file.

## Constraints these are written against

Email clients are not browsers, so:

- **Everything is inline styles on tables.** No flexbox, no grid, no
  external CSS; Outlook renders with Word's engine.
- **No web fonts.** The brand faces cannot load, so the stack falls back to
  system sans — the code itself uses a monospace stack so digits stay
  unambiguous.
- **No images.** Most clients block remote images by default, and an OTP
  mail that depends on one is an OTP mail that arrives blank. The wordmark
  is set as text instead.
- **Readable in dark mode.** The header is dark by design, so it holds up
  either way rather than relying on `prefers-color-scheme`, which many
  clients ignore.
- **The code is selectable text**, not an image, so it can be copied.

## Variables available

- `{{ .Token }}` — the numeric code. Must match the length configured under
  Authentication → Sign In / Providers → Email → Email OTP Length, and
  `OTP_LENGTH` in `apps/members/src/features/auth/constants.ts`.
- `{{ .ConfirmationURL }}` — one-click link. Included as a secondary option;
  the code is primary because links break when the mail is opened on a
  different device from the one signing in.
- `{{ .SiteURL }}`, `{{ .Email }}`, `{{ .TokenHash }}` also available.

## After editing

Send yourself one and check it in Gmail (web and phone) and Outlook if you
have it. A login email in the spam folder is an outage: nobody can sign in.
