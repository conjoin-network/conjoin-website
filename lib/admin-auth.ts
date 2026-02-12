type BasicAuthCredentials = {
  username: string;
  password: string;
};

function decodeBase64(value: string) {
  try {
    return atob(value);
  } catch {
    return "";
  }
}

export function parseBasicAuthHeader(headerValue: string | null): BasicAuthCredentials | null {
  if (!headerValue || !headerValue.startsWith("Basic ")) {
    return null;
  }

  const encoded = headerValue.slice(6).trim();
  const decoded = decodeBase64(encoded);
  if (!decoded.includes(":")) {
    return null;
  }

  const separator = decoded.indexOf(":");
  const username = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);

  return { username, password };
}

export function getAdminCredentialsFromEnv(): BasicAuthCredentials | null {
  const username = process.env.ADMIN_USER?.trim();
  const password = process.env.ADMIN_PASS?.trim();
  if (!username || !password) {
    return null;
  }

  return { username, password };
}

export function isAuthorizedBasicAuth(headerValue: string | null, expected: BasicAuthCredentials) {
  const parsed = parseBasicAuthHeader(headerValue);
  if (!parsed) {
    return false;
  }

  return parsed.username === expected.username && parsed.password === expected.password;
}

export function getAuthorizedUsername(headerValue: string | null) {
  const parsed = parseBasicAuthHeader(headerValue);
  return parsed?.username ?? "Admin";
}
