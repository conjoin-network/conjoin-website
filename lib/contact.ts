import {
  COMPANY_PHONE,
  COMPANY_PHONE_DISPLAY
} from "@/config/site";

export const SALES_EMAIL = "sales@conjoinnetwork.com";
export const SUPPORT_EMAIL = "support@conjoinnetwork.com";
export const LEADS_EMAIL = "leads@conjoinnetwork.com";
export const OPTIONAL_PERSONAL_EMAIL = "manod@conjoinnetwork.com";

// Single source of truth for company phone.
export const PHONE_1 = COMPANY_PHONE;
export const PHONE_2 = COMPANY_PHONE;
export const ADDRESS_LINES = ["2nd Floor, SCO 156-157", "Sector 34A, Chandigarh – 160022", "India"] as const;
export const COVERAGE = ["Chandigarh", "Punjab", "Haryana", "North India"] as const;

export const SALES_PHONE_LANDLINE = PHONE_1;
export const SALES_PHONE_MOBILE = PHONE_2;
export const SALES_PHONE_NUMBER = COMPANY_PHONE;
export const SALES_PHONE_DISPLAY = COMPANY_PHONE_DISPLAY;
export const WHATSAPP_PHONE_NUMBER = COMPANY_PHONE;
export const ORG_NAME = "Conjoin Network Private Limited";
export const ORG_AREA_SERVED = COVERAGE;

export const ORG_POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "2nd Floor, SCO 156-157, Sector 34A",
  addressLocality: "Chandigarh",
  addressRegion: "Chandigarh",
  postalCode: "160022",
  addressCountry: "IN"
} as const;

export const ORG_OFFICE_BLOCK = {
  title: "Registered Office / Chandigarh Office",
  lines: ADDRESS_LINES
} as const;

export function mailto(email: string) {
  return `mailto:${email}`;
}

export function getOrgContactPoints() {
  return [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: SALES_EMAIL,
      telephone: SALES_PHONE_DISPLAY,
      areaServed: "IN",
      availableLanguage: ["en", "hi"]
    },
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: SUPPORT_EMAIL,
      telephone: SALES_PHONE_DISPLAY,
      areaServed: "IN",
      availableLanguage: ["en", "hi"]
    }
  ];
}

export function getOrgEmails() {
  return [SALES_EMAIL, SUPPORT_EMAIL] as const;
}

export function getOrgPhones() {
  return [SALES_PHONE_DISPLAY] as const;
}

export function tel(value: string) {
  return `tel:${value.replace(/[^\d+]/g, "")}`;
}
