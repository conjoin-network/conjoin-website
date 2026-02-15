#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DOCS_DIR="$ROOT_DIR/docs/google-setup"
KEYS_DIR="$DOCS_DIR/keys"
STATUS_FILE="$DOCS_DIR/gcp-setup-status.json"

PROJECT_NAME="${GCP_PROJECT_NAME:-ConjoinNetwork}"
DEFAULT_ID="conjoinnetwork-$(date +%y%m%d)-$RANDOM"
PROJECT_ID="${GCP_PROJECT_ID:-$DEFAULT_ID}"
SA_NAME="${GCP_SERVICE_ACCOUNT_NAME:-conjoin-automation}"
SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"
KEY_FILE="${GCP_SERVICE_ACCOUNT_KEY_FILE:-$KEYS_DIR/conjoinnetwork-automation-key.json}"

mkdir -p "$DOCS_DIR" "$KEYS_DIR"

if ! command -v gcloud >/dev/null 2>&1; then
  cat > "$STATUS_FILE" <<JSON
{
  "ok": false,
  "status": "blocked",
  "reason": "gcloud_not_installed",
  "projectName": "$PROJECT_NAME",
  "projectId": "$PROJECT_ID",
  "serviceAccount": "$SA_EMAIL",
  "requiredApis": [
    "searchconsole.googleapis.com",
    "siteverification.googleapis.com",
    "googleads.googleapis.com"
  ],
  "next": "Install Google Cloud SDK, run gcloud auth login, and rerun this script."
}
JSON
  echo "gcloud not installed. Wrote $STATUS_FILE"
  exit 0
fi

if ! gcloud auth list --filter=status:ACTIVE --format='value(account)' | grep -q .; then
  cat > "$STATUS_FILE" <<JSON
{
  "ok": false,
  "status": "blocked",
  "reason": "gcloud_not_authenticated",
  "projectName": "$PROJECT_NAME",
  "projectId": "$PROJECT_ID",
  "next": "Run: gcloud auth login"
}
JSON
  echo "No active gcloud auth account. Wrote $STATUS_FILE"
  exit 0
fi

if ! gcloud projects describe "$PROJECT_ID" >/dev/null 2>&1; then
  gcloud projects create "$PROJECT_ID" --name="$PROJECT_NAME"
fi

gcloud config set project "$PROJECT_ID" >/dev/null

gcloud services enable \
  searchconsole.googleapis.com \
  siteverification.googleapis.com \
  googleads.googleapis.com >/dev/null

if ! gcloud iam service-accounts describe "$SA_EMAIL" >/dev/null 2>&1; then
  gcloud iam service-accounts create "$SA_NAME" \
    --display-name="Conjoin Network Automation" >/dev/null
fi

if [ ! -f "$KEY_FILE" ]; then
  gcloud iam service-accounts keys create "$KEY_FILE" \
    --iam-account="$SA_EMAIL" >/dev/null
fi

cat > "$STATUS_FILE" <<JSON
{
  "ok": true,
  "status": "ready",
  "projectName": "$PROJECT_NAME",
  "projectId": "$PROJECT_ID",
  "serviceAccount": "$SA_EMAIL",
  "serviceAccountKey": "$KEY_FILE",
  "enabledApis": [
    "searchconsole.googleapis.com",
    "siteverification.googleapis.com",
    "googleads.googleapis.com"
  ]
}
JSON

echo "GCP setup complete. Status: $STATUS_FILE"
