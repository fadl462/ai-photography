# HotFoto AI V47.7 — Account & Private Intelligence

V47.7 introduces the first account boundary for persistent photographer intelligence.

## What is real
- Email/password registration and sign-in.
- Passwords are never stored plaintext; Node `scrypt` derives a 64-byte password hash with a per-account random salt.
- Session tokens are random, short-lived bearer tokens. Only a SHA-256 hash of each token is stored server-side.
- Expired sessions are removed opportunistically.
- Authenticated requests cannot choose another photographer's `profileId`; the gateway overwrites it from the authenticated session.
- Style DNA, feedback and project memory are therefore account-scoped at the API boundary.

## Important production requirement
The included JSON stores are a deployment foundation, not the final multi-region SaaS database. Before public launch, move accounts, sessions and photographer intelligence to a managed database with encryption at rest, backups, row-level authorization, audit logging and a proper secret manager.

## Deployment
Set:
- `OPENAI_API_KEY`
- `HOTFOTO_APP_ORIGIN` to the exact Studio origin (not `*`)
- `HOTFOTO_SESSION_TTL_MS` as desired
- `HOTFOTO_AUTH_DIR` to persistent storage

Use HTTPS in front of the gateway. Do not expose the gateway's filesystem or `.env`.
