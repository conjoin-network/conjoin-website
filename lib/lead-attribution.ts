export type LeadAttributionMeta = {
  landing_page?: string;
  referrer?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
};

const ATTRIBUTION_MARKER = "[[attribution]]";

function trimTo(value: string | null | undefined, limit: number) {
  if (!value) {
    return "";
  }
  return value.trim().slice(0, limit);
}

export function buildAttributionMeta(input: LeadAttributionMeta): LeadAttributionMeta {
  const landing_page = trimTo(input.landing_page, 500);
  const referrer = trimTo(input.referrer, 500);
  const gclid = trimTo(input.gclid, 200);
  const gbraid = trimTo(input.gbraid, 200);
  const wbraid = trimTo(input.wbraid, 200);

  return {
    ...(landing_page ? { landing_page } : {}),
    ...(referrer ? { referrer } : {}),
    ...(gclid ? { gclid } : {}),
    ...(gbraid ? { gbraid } : {}),
    ...(wbraid ? { wbraid } : {})
  };
}

export function appendAttributionToNotes(notes: string | null | undefined, input: LeadAttributionMeta) {
  const baseNotes = (notes ?? "").trim();
  const meta = buildAttributionMeta(input);
  if (Object.keys(meta).length === 0) {
    return baseNotes || undefined;
  }

  const encoded = `${ATTRIBUTION_MARKER}${JSON.stringify(meta)}`;
  if (!baseNotes) {
    return encoded;
  }

  return `${baseNotes}\n${encoded}`;
}

export function parseAttributionFromNotes(notes: string | null | undefined) {
  const source = (notes ?? "").trim();
  if (!source) {
    return { notes: null as string | null, meta: {} as LeadAttributionMeta };
  }

  const lines = source.split("\n");
  const cleanedLines: string[] = [];
  let meta: LeadAttributionMeta = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith(ATTRIBUTION_MARKER)) {
      cleanedLines.push(line);
      continue;
    }

    const raw = trimmed.slice(ATTRIBUTION_MARKER.length);
    try {
      const parsed = JSON.parse(raw) as LeadAttributionMeta;
      meta = buildAttributionMeta(parsed);
    } catch {
      cleanedLines.push(line);
    }
  }

  const cleaned = cleanedLines.join("\n").trim();
  return {
    notes: cleaned || null,
    meta
  };
}
