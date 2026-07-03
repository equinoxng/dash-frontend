import { apiFetch, ApiError, API_BASE_URL } from "./api";

export type Role = "user" | "rider" | "merchant";

const ROLE_PATH: Record<Role, string> = {
  user: "users",
  rider: "riders",
  merchant: "merchants",
};

export function requestOtp(role: Role, phoneNumber: string) {
  return apiFetch(`/api/${ROLE_PATH[role]}/otp/request`, {
    method: "POST",
    body: JSON.stringify({ phoneNumber }),
  });
}

export function verifyOtp(role: Role, phoneNumber: string, otp: string) {
  return apiFetch(`/api/${ROLE_PATH[role]}/otp/verify`, {
    method: "POST",
    body: JSON.stringify({ phoneNumber, otp }),
  });
}

export type UserSignupPayload = {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  pin: string;
};

export function registerUser(payload: UserSignupPayload) {
  return apiFetch("/api/users/register", { method: "POST", body: JSON.stringify(payload) });
}

export const VEHICLE_TYPES: Record<string, string> = {
  Bicycle: "BICYCLE",
  Motorcycle: "MOTORCYCLE",
  Car: "CAR",
};

export type RiderSignupPayload = {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  vehicleType: string;
  vehiclePlateNumber: string;
  nin: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
};

export function registerRider(payload: RiderSignupPayload) {
  return apiFetch("/api/riders/register", { method: "POST", body: JSON.stringify(payload) });
}

export type UploadedFile = {
  publicId: string;
  url: string;
};

export function uploadIdentityDocument(phoneNumber: string, file: File, onProgress: (percent: number) => void) {
  const xhr = new XMLHttpRequest();

  const promise = new Promise<UploadedFile>((resolve, reject) => {
    const formData = new FormData();
    formData.append("phoneNumber", phoneNumber);
    formData.append("file", file);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new ApiError(xhr.responseText || "Upload failed. Please try again."));
      }
    };
    xhr.onerror = () => reject(new ApiError("Upload failed. Please try again."));
    xhr.onabort = () => reject(new ApiError("Upload cancelled."));

    xhr.open("POST", `${API_BASE_URL}/api/uploads/identity-document`);
    xhr.send(formData);
  });

  return { promise, abort: () => xhr.abort() };
}

export function deleteIdentityDocument(phoneNumber: string) {
  return apiFetch(`/api/uploads/identity-document?phoneNumber=${encodeURIComponent(phoneNumber)}`, {
    method: "DELETE",
  });
}

export const BUSINESS_CATEGORIES: Record<string, string> = {
  "POS Agent": "POS_AGENT",
  Microfinance: "MICROFINANCE",
  "Cash Agent": "CASH_AGENT",
  Other: "OTHER",
};

export type MerchantSignupPayload = {
  phoneNumber: string;
  businessName: string;
  ownerFirstName: string;
  ownerLastName: string;
  email: string;
  password: string;
  address: string;
  businessRegistrationNumber: string;
  businessCategory: string;
};

export function registerMerchant(payload: MerchantSignupPayload) {
  return apiFetch("/api/merchants/register", { method: "POST", body: JSON.stringify(payload) });
}

export type AccountType = "USER" | "RIDER" | "MERCHANT";

export type LoginResponse = {
  token: string;
  accountType: AccountType;
  accountId: string;
  fullName: string;
  phoneVerified: boolean;
};

export function login(phoneNumber: string, password: string) {
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ phoneNumber, password }),
  });
}

export function logout(token: string) {
  return apiFetch("/api/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function forgotPassword(phoneNumber: string, pin: string) {
  return apiFetch<{ resetToken: string }>("/api/users/password/forgot", {
    method: "POST",
    body: JSON.stringify({ phoneNumber, pin }),
  });
}

export function resetPassword(resetToken: string, newPassword: string) {
  return apiFetch("/api/users/password/reset", {
    method: "POST",
    body: JSON.stringify({ resetToken, newPassword }),
  });
}

export function changePassword(token: string, currentPassword: string, newPassword: string) {
  return apiFetch("/api/users/password/change", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export type UserProfile = {
  id: string;
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string | null;
  houseNumber: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  phoneVerified: boolean;
  verified: boolean;
};

export function getProfile(token: string) {
  return apiFetch<UserProfile>("/api/users/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export type UpdateProfilePayload = {
  firstName: string;
  lastName: string;
  email: string;
  houseNumber: string;
  street: string;
  city: string;
  state: string;
  dateOfBirth: string | null;
};

export function updateProfile(token: string, payload: UpdateProfilePayload) {
  return apiFetch<UserProfile>("/api/users/profile", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

export function changePin(token: string, currentPin: string, newPin: string) {
  return apiFetch("/api/users/pin", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ currentPin, newPin }),
  });
}

export type NotificationPreferences = {
  deliveryUpdates: boolean;
  promotions: boolean;
  securityAlerts: boolean;
};

export function getNotificationPreferences(token: string) {
  return apiFetch<NotificationPreferences>("/api/users/notifications", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function updateNotificationPreferences(token: string, preferences: NotificationPreferences) {
  return apiFetch<NotificationPreferences>("/api/users/notifications", {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(preferences),
  });
}

export const IDENTIFICATION_TYPES: Record<string, string> = {
  "National ID (NIN)": "NIN",
  "Voter's Card": "VOTERS_CARD",
  "International Passport": "INTERNATIONAL_PASSPORT",
  "Driver's License": "DRIVERS_LICENSE",
};

export function submitKyc(
  token: string,
  identificationType: string,
  identificationNumber: string,
  file: File,
  onProgress: (percent: number) => void
) {
  const xhr = new XMLHttpRequest();

  const promise = new Promise<UserProfile>((resolve, reject) => {
    const formData = new FormData();
    formData.append("identificationType", identificationType);
    formData.append("identificationNumber", identificationNumber);
    formData.append("file", file);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new ApiError(xhr.responseText || "Upload failed. Please try again."));
      }
    };
    xhr.onerror = () => reject(new ApiError("Upload failed. Please try again."));
    xhr.onabort = () => reject(new ApiError("Upload cancelled."));

    xhr.open("POST", `${API_BASE_URL}/api/users/kyc`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(formData);
  });

  return { promise, abort: () => xhr.abort() };
}
