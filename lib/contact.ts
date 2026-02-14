export const SALES_EMAIL = "sales@conjoinnetwork.com";
export const SUPPORT_EMAIL = "support@conjoinnetwork.com";
export const LEADS_EMAIL = "leads@conjoinnetwork.com";
export const OPTIONAL_PERSONAL_EMAIL = "manod@conjoinnetwork.com";

export const PHONE_1 = "0172-4043839";
export const PHONE_2 = "9466663015";
export const ADDRESS_LINES = ["2nd Floor, SCO 156-157", "Sector 34A, Chandigarh – 160022", "India"] as const;
export const COVERAGE = ["Chandigarh", "Punjab", "Haryana", "North India"] as const;

export const SALES_PHONE_LANDLINE = PHONE_1;
export const SALES_PHONE_MOBILE = PHONE_2;
export const SALES_PHONE_NUMBER = PHONE_2;
export const WHATSAPP_PHONE_NUMBER = PHONE_2;
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
      telephone: `+91-${PHONE_2}`,
      areaServed: "IN",
      availableLanguage: ["en", "hi"]
    },
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: SUPPORT_EMAIL,
      telephone: PHONE_1,
      areaServed: "IN",
      availableLanguage: ["en", "hi"]
    }
  ];
}

export function getOrgEmails() {
  return [SALES_EMAIL, SUPPORT_EMAIL] as const;
}

export function getOrgPhones() {
  return [PHONE_1, PHONE_2] as const;
}

export function tel(value: string) {
  return `tel:${value.replace(/[^\d+]/g, "")}`;
}
