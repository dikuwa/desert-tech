# Desert Tech Authentication Verification

## Status - June 7, 2026

The invite-only authentication foundation is deployed and the highest-risk
authentication boundaries are wired. It should be treated as phase 1 of the
authorization rollout, not as a completed security program.

Production migration:

- Applied `prisma/migrations/20260607060000_invite_only_auth/migration.sql`.
- Preserved both existing users and their verified-email state.
- Migrated the existing Admin account to `OWNER`.
- Migrated the existing Staff account to `STAFF`.
- Converted existing credential accounts to Better Auth's `credential` provider.
- Created the invitation, audit log, password reset, rate limit, and two-factor tables.

## Verified And Corrected

- Better Auth uses the Prisma adapter with valid Better Auth 1.6 options.
- Public email/password sign-up is disabled.
- Existing bcrypt passwords remain compatible.
- Invitation-created accounts use Better Auth credential records.
- Invitation tokens and password-reset tokens are stored as hashes.
- Invitation acceptance creates the user, credential account, and accepted invitation
  state in one transaction.
- The two-factor plugin and required `TwoFactor` table are configured.
- The login page handles the authenticator-code challenge for users who enabled 2FA.
- Dashboard access validates a real Better Auth session and active account.
- Suspended and disabled accounts are rejected.
- Sidebar items use server-derived roles and permissions.
- Protected order, stock-request, receipt, document, and upload APIs now enforce
  server-side permissions.
- Storefront order submissions, stock requests, and public document-token lookup remain
  public where required.
- Password resets revoke existing sessions.
- Product upload no longer accepts SVG files.

## Production Verification

- `/admin/login` returns `200`.
- Unauthenticated `/dashboard` redirects to `/admin/login`.
- Unauthenticated protected APIs return `401`.
- A forged Better Auth session cookie is rejected with `401`.
- Public email/password sign-up returns the expected disabled response.
- Public document-token lookup remains reachable.
- Production build and TypeScript checks pass.

## Required Next Phase

1. Add server-side view-permission guards to every individual dashboard page.
2. Move remaining client/Zustand business mutations behind permission-checked server
   endpoints before relying on STAFF restrictions for separation of duties.
3. Add Settings -> Security UI for TOTP enrollment, recovery codes, password changes,
   and current-user session management.
4. Enforce mandatory 2FA enrollment for OWNER and ADMIN after the enrollment UI exists.
5. Complete staff-management UI for role and permission editing, invitation resend and
   revoke, password-reset initiation, and activity views.
6. Standardize unauthenticated error handling in all new staff and invitation APIs so
   invalid sessions consistently return `401` instead of a generic `500`.
7. Add automated integration tests for OWNER, ADMIN, STAFF, suspended users, expired
   and single-use invitations, password reset, and 2FA sign-in.

## Operational Notes

- Keep `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL`, and email-provider
  credentials configured in Vercel production.
- Do not use `prisma db push` for production security-schema changes. Add and review
  data-preserving migrations.
- Review audit logs and rate-limit records regularly once the remaining protected
  mutations are moved server-side.
