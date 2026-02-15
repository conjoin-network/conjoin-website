import { randomUUID } from "node:crypto";

type ErrorContext = Record<string, unknown>;

type CapturedErrorPayload = {
  id: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  timestamp: string;
};

function resolveDsn() {
  return process.env.SENTRY_DSN?.trim() || process.env.ERROR_LOG_DSN?.trim() || "";
}

function toError(input: unknown): Error {
  if (input instanceof Error) {
    return input;
  }
  return new Error(typeof input === "string" ? input : "Unknown server error");
}

function parseSentryDsn(dsn: string) {
  try {
    const url = new URL(dsn);
    if (!url.username || !url.hostname || !url.pathname) {
      return null;
    }
    const projectId = url.pathname.replace(/^\//, "").split("/")[0];
    if (!projectId) {
      return null;
    }

    const envelopeUrl = `${url.protocol}//${url.hostname}/api/${projectId}/envelope/`;
    return {
      dsn,
      envelopeUrl,
      publicKey: url.username
    };
  } catch {
    return null;
  }
}

async function sendToSentry(dsn: string, payload: CapturedErrorPayload) {
  const parsed = parseSentryDsn(dsn);
  if (!parsed) {
    return false;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const event = {
    event_id: payload.id.replace(/-/g, ""),
    message: payload.message,
    level: "error",
    platform: "node",
    timestamp: nowSeconds,
    extra: payload.context,
    tags: {
      app: "conjoinnetwork-site"
    },
    exception: {
      values: [
        {
          type: "Error",
          value: payload.message,
          stacktrace: payload.stack
            ? {
                frames: payload.stack.split("\n").map((line) => ({
                  filename: line.trim()
                }))
              }
            : undefined
        }
      ]
    }
  };

  const envelope = `${JSON.stringify({ dsn: parsed.dsn })}\n${JSON.stringify({ type: "event" })}\n${JSON.stringify(event)}`;
  const response = await fetch(parsed.envelopeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-sentry-envelope"
    },
    body: envelope
  });

  return response.ok;
}

async function sendToWebhook(url: string, payload: CapturedErrorPayload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return response.ok;
}

export async function captureServerError(errorInput: unknown, context: ErrorContext = {}) {
  const error = toError(errorInput);
  const payload: CapturedErrorPayload = {
    id: randomUUID(),
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  };

  console.error("SERVER_ERROR", {
    message: payload.message,
    context: payload.context,
    timestamp: payload.timestamp
  });

  const dsn = resolveDsn();
  if (!dsn) {
    return;
  }

  try {
    const sent = dsn.includes("@") && dsn.includes("ingest.sentry.io")
      ? await sendToSentry(dsn, payload)
      : await sendToWebhook(dsn, payload);

    if (!sent) {
      console.warn("ERROR_LOGGER_DELIVERY_FAILED", { target: dsn.includes("sentry") ? "sentry" : "webhook" });
    }
  } catch (deliveryError) {
    console.warn("ERROR_LOGGER_EXCEPTION", deliveryError instanceof Error ? deliveryError.message : deliveryError);
  }
}

export function isErrorLoggingEnabled() {
  return Boolean(resolveDsn());
}
