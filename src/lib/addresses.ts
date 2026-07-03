import { apiFetch } from "./api";

export type DeliveryAddress = {
  id: string;
  label: string;
  houseNumber: string | null;
  street: string;
  city: string;
  state: string | null;
  landmark: string | null;
  fullAddress: string;
  defaultAddress: boolean;
};

export type DeliveryAddressPayload = {
  label: string;
  houseNumber?: string;
  street: string;
  city: string;
  state?: string;
  landmark?: string;
  defaultAddress: boolean;
};

export function listAddresses(token: string) {
  return apiFetch<DeliveryAddress[]>("/api/addresses", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createAddress(token: string, payload: DeliveryAddressPayload) {
  return apiFetch<DeliveryAddress>("/api/addresses", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function updateAddress(token: string, id: string, payload: DeliveryAddressPayload) {
  return apiFetch<DeliveryAddress>(`/api/addresses/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function deleteAddress(token: string, id: string) {
  return apiFetch<void>(`/api/addresses/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
