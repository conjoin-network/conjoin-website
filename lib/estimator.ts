export type EstimatorServiceOption =
  | "Microsoft 365"
  | "Seqrite"
  | "Cisco"
  | "Networking"
  | "Security"
  | "Other";

export const ESTIMATOR_SERVICE_OPTIONS: EstimatorServiceOption[] = [
  "Microsoft 365",
  "Seqrite",
  "Cisco",
  "Networking",
  "Security",
  "Other"
];

export const ESTIMATOR_M365_PLANS = [
  "Business Basic",
  "Business Standard",
  "Business Premium",
  "E3",
  "E5"
] as const;

export const ESTIMATOR_SEQRITE_QTY = ["25", "50", "100", "250", "500"] as const;

export function defaultEstimatorService(pathname: string): EstimatorServiceOption {
  if (pathname.includes("/microsoft-365-chandigarh")) {
    return "Microsoft 365";
  }
  if (pathname.includes("/seqrite-chandigarh")) {
    return "Seqrite";
  }
  return "Other";
}

export function serviceToBrand(service: EstimatorServiceOption) {
  if (service === "Microsoft 365") return "Microsoft";
  if (service === "Seqrite") return "Seqrite";
  if (service === "Cisco") return "Cisco";
  return "Other";
}

type BuildEstimatorQuoteHrefInput = {
  service: EstimatorServiceOption;
  source: string;
  m365Plan?: string;
  seqriteQty?: string;
  details?: string;
};

export function buildEstimatorQuoteHref(input: BuildEstimatorQuoteHrefInput) {
  const params = new URLSearchParams({
    source: input.source,
    brand: serviceToBrand(input.service)
  });

  if (input.service === "Microsoft 365" && input.m365Plan) {
    params.set("plan", input.m365Plan);
    params.set("category", "Microsoft 365");
  }

  if (input.service === "Seqrite") {
    params.set("category", "Endpoint Security");
    if (input.seqriteQty) {
      params.set("qty", input.seqriteQty);
    }
  }

  if (input.service === "Networking" || input.service === "Security") {
    params.set("category", input.service);
  }

  if (input.details?.trim()) {
    params.set("notes", input.details.trim().slice(0, 120));
  }

  return `/request-quote?${params.toString()}`;
}
