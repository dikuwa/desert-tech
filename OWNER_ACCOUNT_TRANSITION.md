# Owner Account Transition

## Initial System Accounts

The application creates these accounts when they are missing:

| Role | Email |
| --- | --- |
| Owner | `owner@deserttech.com` |
| Admin | `admin@deserttech.com` |
| Staff | `staff@deserttech.com` |

They are active, email-verified, and can sign in immediately at `/admin/login`.
Initial passwords must be supplied securely when the explicit bootstrap command is run.
Passwords are never stored in source control. Startup and deployment do not reset a
password that has already been changed.

## Create A Permanent Owner

1. Sign in as `owner@deserttech.com`.
2. Open Dashboard -> Staff.
3. Select **Create User**.
4. Enter the permanent owner's name, email, password, and choose **Owner**.
5. Sign out and verify that the new Owner can sign in.

Only an Owner can create another Owner. Admins can create Admin and Staff accounts.

## Change The Seeded Owner Password

Open Dashboard -> Settings -> Security, enter the current password and a new password,
then save. Other sessions are revoked after the change.

## Disable A Seeded Account Safely

1. Confirm that the permanent Owner can sign in.
2. From Dashboard -> Staff, open the seeded account menu.
3. Choose **Disable Account** and confirm.

The application will not let an Owner disable their own account or the final active
Owner. Disabling preserves historical relationships such as payments, receipts, and
audit logs. Prefer disabling over deleting database records.

## Ownership Data

Ownership is represented by `User.role = OWNER`. No separate store-owner setting needs
to be transferred. Keep at least one active Owner at all times.

## Explicit Credential Reset

For initial setup only, run:

```bash
RESET_SYSTEM_USER_PASSWORDS=true pnpm users:bootstrap
```

This resets the three system-user passwords, removes their active sessions, and clears
their 2FA records. Do not use the reset flag during normal deployments.
