#!/usr/bin/env bash
# scripts/setup-dev.sh
# Run from repo root: bash scripts/setup-dev.sh

set -euo pipefail

ENV_FILE=".env"
ENV_EXAMPLE=".env.example"

if [ ! -f "$ENV_EXAMPLE" ]; then
  echo "Error: $ENV_EXAMPLE not found. Run this from the repo root." >&2
  exit 1
fi

if [ -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE already exists. Remove it first to regenerate." >&2
  echo "  rm $ENV_FILE && bash scripts/setup-dev.sh" >&2
  exit 1
fi

if command -v openssl &>/dev/null; then
  JWT_SECRET=$(openssl rand -hex 32)
elif command -v node &>/dev/null; then
  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
else
  echo "Error: neither openssl nor node found." >&2
  exit 1
fi

sed "s|^JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" "$ENV_EXAMPLE" > "$ENV_FILE"

echo ""
echo "Created $ENV_FILE with a generated JWT_SECRET."
echo ""
echo "Next steps:"
echo "  1. Edit $ENV_FILE and fill in:"
echo "     STRIPE_SECRET_KEY  — Stripe test key (sk_test_...) from dashboard.stripe.com"
echo "     RESEND_API_KEY     — from resend.com (leave blank if not testing email)"
echo "     SITE_URL           — already set to http://localhost:8888"
echo ""
echo "  2. npx netlify login"
echo "  3. npx netlify link"
echo "  4. npm run dev"
echo ""
