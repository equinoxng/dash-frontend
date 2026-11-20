"use client";

export type RecipientLocation = {
  street: string;
  area: string;
  city: string;
};

const LOCATION_KEY = "dash:recipient-location:v1";

export const DEFAULT_LOCATION: RecipientLocation = {
  street: "",
  area: "",
  city: "Lagos",
};

export function loadRecipientLocation(): RecipientLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(LOCATION_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as Partial<RecipientLocation>;
    return {
      street: typeof parsed.street === "string" ? parsed.street : "",
      area: typeof parsed.area === "string" ? parsed.area : "",
      city: typeof parsed.city === "string" ? parsed.city : "Lagos",
    };
  } catch {
    return null;
  }
}

export function saveRecipientLocation(location: RecipientLocation) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
}
