import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "conjoin_admin_session";
const ADMIN_SESSION_VERSION = "v2";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

export type PortalRole = "OWNER" | "MANAGER" | "AGENT" | "SUPPORT";

type SessionCookieOptions = {
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: "/";
  maxAge: number;
};

type PortalUserConfig = {
  username: string;
  password: string;
  role: PortalRole;
  displayName: string;
  assignee: string | null;
  canExport: boolean;
  canAssign: boolean;
};

type SessionTokenPayload = {
  v: string;
  u: string;
  r: PortalRole;
  n: string;
  a: string | null;
  x: 1 | 0;
  s: 1 | 0;
  e: number;
};

export type PortalSession = {
  username: string;
  role: PortalRole;
  displayName: string;
  assignee: string | null;
  canExport: boolean;
  canAssign: boolean;
  isManagement: boolean;
};

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function parseBoolean(value: string | undefined, fallbackValue: boolean) {
  if (!value) {
    return fallbackValue;
  }

  const next = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(next)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(next)) {
    return false;
  }
  return fallbackValue;
}

function getSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    process.env.OWNER_PASS?.trim() ||
    process.env.ADMIN_PASSWORD?.trim() ||
    process.env.ADMIN_PASS?.trim() ||
    "change-me"
  );
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) {
    return false;
  }
  return timingSafeEqual(aBuffer, bBuffer);
}

function buildPortalSession(config: PortalUserConfig): PortalSession {
  return {
    username: config.username,
    role: config.role,
    displayName: config.displayName,
    assignee: config.assignee,
    canExport: config.canExport,
    canAssign: config.canAssign,
    isManagement: config.role === "OWNER" || config.role === "MANAGER"
  };
}

function makeUser(config: Partial<PortalUserConfig> & Pick<PortalUserConfig, "role">): PortalUserConfig | null {
  const username = config.username?.trim() ?? "";
  const password = config.password?.trim() ?? "";
  if (!username || !password) {
    return null;
  }

  return {
    username,
    password,
    role: config.role,
    displayName: config.displayName?.trim() || username,
    assignee: config.assignee?.trim() || null,
    canExport: Boolean(config.canExport),
    canAssign: Boolean(config.canAssign)
  };
}

export function getPortalUsers(): PortalUserConfig[] {
  const users: Array<PortalUserConfig | null> = [
    makeUser({
      role: "OWNER",
      username: process.env.OWNER_USER || process.env.ADMIN_USER || "admin",
      password: process.env.OWNER_PASS || process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS,
      displayName: process.env.OWNER_NAME || "Owner",
      canExport: true,
      canAssign: true
    }),
    makeUser({
      role: "MANAGER",
      username: process.env.MANAGER_USER,
      password: process.env.MANAGER_PASS,
      displayName: process.env.MANAGER_NAME || "Manager",
      canExport: parseBoolean(process.env.MANAGER_CAN_EXPORT, false),
      canAssign: true
    }),
    makeUser({
      role: "AGENT",
      username: process.env.AGENT_USER,
      password: process.env.AGENT_PASS,
      displayName: process.env.AGENT_NAME || "Girish",
      assignee: process.env.AGENT_ASSIGNEE || process.env.AGENT_NAME || "Girish",
      canExport: false,
      canAssign: false
    }),
    makeUser({
      role: "SUPPORT",
      username: process.env.SUPPORT_USER,
      password: process.env.SUPPORT_PASS,
      displayName: process.env.SUPPORT_NAME || "Kiran",
      assignee: process.env.SUPPORT_ASSIGNEE || process.env.SUPPORT_NAME || "Kiran",
      canExport: false,
      canAssign: false
    })
  ];

  return users.filter((user): user is PortalUserConfig => Boolean(user));
}

export function isAdminConfigured() {
  return getPortalUsers().length > 0;
}

export function validatePortalCredentials(username: string, password: string): PortalSession | null {
  const normalizedUser = username.trim();
  const normalizedPass = password.trim();
  if (!normalizedUser || !normalizedPass) {
    return null;
  }

  const user = getPortalUsers().find(
    (candidate) => candidate.username === normalizedUser && candidate.password === normalizedPass
  );

  return user ? buildPortalSession(user) : null;
}

export function createPortalSessionToken(session: PortalSession) {
  const payload: SessionTokenPayload = {
    v: ADMIN_SESSION_VERSION,
    u: session.username,
    r: session.role,
    n: session.displayName,
    a: session.assignee,
    x: session.canExport ? 1 : 0,
    s: session.canAssign ? 1 : 0,
    e: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS
  };

  const encoded = toBase64Url(JSON.stringify(payload));
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function readPortalSessionFromToken(token: string | undefined | null): PortalSession | null {
  if (!token) {
    return null;
  }

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expected = sign(encoded);
  if (!safeEqual(expected, signature)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(encoded)) as SessionTokenPayload;
    if (parsed.v !== ADMIN_SESSION_VERSION || parsed.e < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      username: parsed.u,
      role: parsed.r,
      displayName: parsed.n,
      assignee: parsed.a,
      canExport: parsed.x === 1,
      canAssign: parsed.s === 1,
      isManagement: parsed.r === "OWNER" || parsed.r === "MANAGER"
    };
  } catch {
    return null;
  }
}

function parseCookieValue(cookieHeader: string | null, key: string) {
  if (!cookieHeader) {
    return null;
  }

  const cookieEntry = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${key}=`));

  if (!cookieEntry) {
    return null;
  }

  return decodeURIComponent(cookieEntry.slice(key.length + 1));
}

export function getPortalSessionFromRequest(request: Request): PortalSession | null {
  const token = parseCookieValue(request.headers.get("cookie"), ADMIN_SESSION_COOKIE);
  return readPortalSessionFromToken(token);
}

export function getPortalSessionFromCookies(cookies: { get(name: string): { value: string } | undefined }): PortalSession | null {
  return readPortalSessionFromToken(cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export function isValidAdminSessionToken(candidate: string | undefined | null) {
  return Boolean(readPortalSessionFromToken(candidate));
}

export function getAdminSessionCookieOptions(): SessionCookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  };
}

export function clearAdminSessionCookieOptions(): SessionCookieOptions {
  return {
    ...getAdminSessionCookieOptions(),
    maxAge: 0
  };
}

export function getAdminActorLabel(session?: PortalSession | null) {
  if (session?.displayName) {
    return session.displayName;
  }
  return process.env.ADMIN_ACTOR_LABEL?.trim() || "Management";
}
