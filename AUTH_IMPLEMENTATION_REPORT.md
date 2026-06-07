# Desert Tech Authentication Verification

## Status - June 7, 2026

The dashboard uses active email/password accounts created by an Owner or Admin. Public
sign-up remains disabled, but users do not need an invitation, email verification,
magic link, or OTP before their first login.

## Production Transition

- Preserved existing users and historical relationships.
- Added the branded `owner@deserttech.com` Owner account.
- Migrated `admin@deserttech.com` to `ADMIN`.
- Migrated `staff@deserttech.com` to `STAFF`.
- Replaced the legacy seeded credentials with the requested branded credentials.
- Added the missing `Session.impersonatedBy` database column required by Better Auth.
- Created the invitation, audit log, password reset, rate limit, and optional two-factor
  tables during the earlier authentication migration.

## Verified And Corrected

- Better Auth uses the Prisma adapter and bcrypt credential verification.
- Public email/password sign-up is disabled.
- Email verification is not required for dashboard login.
- Two-factor infrastructure remains available but is not required.
- The three branded system accounts are bootstrapped when missing during development,
  production startup, and deployment builds.
- Startup bootstrap does not overwrite passwords after the initial legacy transition.
- Owner and Admin can create active credential accounts directly from User Management.
- Admin cannot create, modify, or disable Owner accounts.
- Owner can create another Owner and can disable a different Owner only when another
  active Owner remains.
- Users can change their own password from Settings -> Security.
- Dashboard access validates a real Better Auth session and active account.
- Suspended and disabled accounts are rejected.
- Sidebar items use server-derived roles and permissions.
- Protected order, stock-request, receipt, document, staff, and upload APIs enforce
  server-side permissions.

## Verified Login And Role Behavior

- `owner@deserttech.com` signs in as active `OWNER`.
- `admin@deserttech.com` signs in as active `ADMIN`.
- `staff@deserttech.com` signs in as active `STAFF`.
- Admin-created users can sign in immediately.
- Admin cannot create an Owner.
- Staff cannot access User Management.
- Public self-registration remains disabled.
- Production build, TypeScript checks, Prisma validation, and focused tests pass.

## Required Next Phase

1. Add server-side view-permission guards to every individual dashboard page.
2. Move remaining client/Zustand business mutations behind permission-checked server
   endpoints before relying on STAFF restrictions for separation of duties.
3. Extend Settings -> Security with optional TOTP enrollment, recovery codes, and
   current-user session management if those controls are needed later.
4. Complete User Management UI for role and permission editing and activity views.
5. Standardize unauthenticated error handling in remaining routes.
6. Add automated integration tests for all role and account-status combinations.

## Operational Notes

- Keep `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and `DATABASE_URL` configured in Vercel.
- Do not set `RESET_SYSTEM_USER_PASSWORDS=true` during normal deployments.
- Prefer disabling users over deleting database records with historical relationships.
- See `OWNER_ACCOUNT_TRANSITION.md` for the permanent Owner transition procedure.
