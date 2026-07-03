import { apiFetch } from "./api";

export type Contact = {
  name: string;
  phoneNumber: string;
};

export function listContacts(token: string) {
  return apiFetch<Contact[]>("/api/contacts", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
