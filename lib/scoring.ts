import type { LeadPriority } from "@/lib/quote-catalog";

type LeadScoreInput = {
  brand: string;
  qty: number;
  timeline?: string;
  source?: string;
  category?: string;
  city?: string;
};

const HOT_THRESHOLD = 80;
const WARM_THRESHOLD = 45;

function normalize(value: string | undefined) {
  return (value ?? "").trim().toLowerCase();
}

export function calculateLeadScore(input: LeadScoreInput) {
  let score = 25;

  const brand = normalize(input.brand);
  const timeline = normalize(input.timeline);
  const source = normalize(input.source);
  const category = normalize(input.category);
  const city = normalize(input.city);

  if (brand === "microsoft" || brand === "seqrite") {
    score += 20;
  } else if (brand === "cisco") {
    score += 14;
  } else {
    score += 8;
  }

  if (input.qty >= 250) {
    score += 24;
  } else if (input.qty >= 100) {
    score += 18;
  } else if (input.qty >= 30) {
    score += 12;
  } else if (input.qty >= 10) {
    score += 8;
  } else if (input.qty > 0) {
    score += 4;
  }

  if (timeline.includes("today") || timeline.includes("urgent")) {
    score += 16;
  } else if (timeline.includes("week")) {
    score += 11;
  } else if (timeline.includes("month")) {
    score += 7;
  } else if (timeline.length > 0) {
    score += 4;
  }

  if (source.includes("google") || source.includes("ads") || source.includes("bark")) {
    score += 8;
  }

  if (category.includes("enterprise") || category.includes("security")) {
    score += 6;
  }

  if (city.includes("chandigarh") || city.includes("mohali") || city.includes("panchkula")) {
    score += 5;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

export function scoreToPriority(score: number): LeadPriority {
  if (score >= HOT_THRESHOLD) {
    return "HOT";
  }
  if (score >= WARM_THRESHOLD) {
    return "WARM";
  }
  return "COLD";
}

export function scoreBand(score: number) {
  if (score >= HOT_THRESHOLD) {
    return "hot";
  }
  if (score >= WARM_THRESHOLD) {
    return "warm";
  }
  return "cold";
}
