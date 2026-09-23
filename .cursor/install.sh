#!/usr/bin/env bash
# Idempotent Cloud Agent bootstrap for the Pinbound Next.js app.
# Installs the Bun package manager, ensures a Node.js version the toolchain
# supports, installs dependencies from the lockfile, and seeds a local dev
# env file when one is not already present.
set -euo pipefail

cd "$(dirname "$0")/.."

# --- Bun (package manager + task runner) --------------------------------------
export BUN_INSTALL="$HOME/.bun"
if [ ! -x "$BUN_INSTALL/bin/bun" ]; then
  echo "Installing Bun..."
  curl -fsSL https://bun.sh/install | bash
fi
export PATH="$BUN_INSTALL/bin:$PATH"
echo "Using bun $(bun --version)"

# --- Node.js ------------------------------------------------------------------
# oxlint's TypeScript config loader (used by `ultracite check`) requires
# Node >= 22.18. Use nvm (present in the base image) to install and default
# Node 24, which also matches @types/node@^24.
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "$NVM_DIR/nvm.sh"
  nvm install 24
  nvm alias default 24
  nvm use default
else
  echo "warning: nvm not found; relying on system Node $(node --version)"
fi
echo "Using node $(node --version)"

# --- Dependencies -------------------------------------------------------------
bun install --frozen-lockfile

# --- Local development environment file ---------------------------------------
# Real secrets should be provided via the Cloud Agent Secrets panel (injected as
# environment variables, which take precedence over .env files). When no secrets
# are configured, seed placeholder values so `next dev` can boot and render the
# marketing site. Placeholders satisfy the strict schema in src/env.config.ts
# but do not enable real WorkOS auth, Neon Postgres, or Resend calls.
if [ ! -f .env.local ]; then
  echo "Seeding placeholder .env.local for local development..."
  cat > .env.local <<'ENVEOF'
# Placeholder development values (gitignored).
# Replace with real values via the Cloud Agent Secrets panel or a real
# .env.local to exercise WorkOS auth, Neon Postgres, and Resend end to end.

# Resend
RESEND_API_KEY=re_dev_placeholder_00000000000000000000

# WorkOS
NEXT_PUBLIC_WORKOS_REDIRECT_URI=http://localhost:3000/auth/callback
WORKOS_API_KEY=sk_dev_placeholder_00000000000000000000
WORKOS_CLIENT_ID=client_dev_placeholder_0000000000000000
WORKOS_COOKIE_PASSWORD=dev_cookie_password_placeholder_min_32_chars_long

# Neon
DATABASE_URL=postgresql://user:password@localhost:5432/pinbound

# Misc
COMING_SOON_MODE=false
ENVEOF
fi

echo "Install complete."
