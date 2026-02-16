export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

export const isGAEnabled = Boolean(GA_ID);

export function event(..._args: unknown[]) {
  return;
}

export function pageview(..._args: unknown[]) {
  return;
}
