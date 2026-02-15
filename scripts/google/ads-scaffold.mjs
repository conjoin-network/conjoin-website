#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const docsDir = path.join(rootDir, "docs", "google-setup");
const scaffoldFile = path.join(docsDir, "google-ads-scaffold.json");
const summaryFile = path.join(docsDir, "google-ads-summary.md");

const scaffold = {
  account: {
    project: "ConjoinNetwork",
    status: "scaffold-only",
    note: "No billing profile or payment setup performed."
  },
  campaign: {
    name: "Conjoin Network Search - Core",
    type: "SEARCH",
    status: "PAUSED",
    budget: {
      amount: 100,
      currency: "USD",
      mode: "placeholder"
    },
    bidding: {
      strategy: "MAXIMIZE_CLICKS",
      note: "Switch to Maximize Conversions once conversion tracking is validated."
    },
    geoTargets: ["Canada", "India"]
  },
  adGroups: [
    {
      name: "Home",
      finalUrl: "https://conjoinnetwork.com/",
      keywords: ["it procurement services", "microsoft partner india", "enterprise security solutions"]
    },
    {
      name: "Request Quote",
      finalUrl: "https://conjoinnetwork.com/request-quote",
      keywords: ["request microsoft quote", "seqrite pricing", "it licensing quote"]
    },
    {
      name: "Solutions",
      finalUrl: "https://conjoinnetwork.com/solutions",
      keywords: ["workspace security networking services", "enterprise it solutions"]
    },
    {
      name: "Products",
      finalUrl: "https://conjoinnetwork.com/products",
      keywords: ["endpoint security", "edr solutions", "dlp solutions"]
    }
  ],
  ads: [
    {
      adGroup: "Home",
      headlines: [
        "Enterprise IT. Delivered with Clarity.",
        "Partner-Led IT Procurement",
        "Response in 30 Minutes"
      ],
      descriptions: [
        "Microsoft, Seqrite, Cisco and security service lines with procurement-ready commercial clarity.",
        "Request a quote today and get rollout-ready recommendations for your team."
      ]
    },
    {
      adGroup: "Request Quote",
      headlines: [
        "Request IT Quote Now",
        "Microsoft & Seqrite Pricing",
        "Procurement-Ready Proposals"
      ],
      descriptions: [
        "Share requirements in 5 steps and receive a compliance-ready response.",
        "Built for IT and procurement teams across India and Canada delivery models."
      ]
    }
  ],
  api: {
    createdInGoogleAds: false,
    requiredEnv: [
      "GOOGLE_ADS_DEVELOPER_TOKEN",
      "GOOGLE_ADS_CUSTOMER_ID",
      "GOOGLE_ADS_LOGIN_CUSTOMER_ID",
      "GOOGLE_OAUTH_ACCESS_TOKEN"
    ]
  }
};

mkdirSync(docsDir, { recursive: true });
writeFileSync(scaffoldFile, `${JSON.stringify(scaffold, null, 2)}\n`, "utf8");
writeFileSync(
  summaryFile,
  [
    "# Google Ads Scaffold Summary",
    "",
    "- Account scaffold status: scaffold-only (no billing/payment changes)",
    "- Campaign type: Search",
    "- Geos: Canada, India",
    "- Budget placeholder: $100",
    "- Bidding: Maximize Clicks",
    "- Landing pages:",
    "  - https://conjoinnetwork.com/",
    "  - https://conjoinnetwork.com/request-quote",
    "  - https://conjoinnetwork.com/solutions",
    "  - https://conjoinnetwork.com/products",
    "",
    "To create this in Google Ads API, provide required env vars and extend scripts/google/ads-scaffold.mjs for API mutation calls."
  ].join("\n"),
  "utf8"
);

console.log(`Wrote ${scaffoldFile}`);
console.log(`Wrote ${summaryFile}`);
