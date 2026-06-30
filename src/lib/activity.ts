const ACTIVITY_KEY = "dash_activity";

export type ActivityEntry = {
  id: string;
  amount: number;
  date: string;
  status: "Delivered" | "Cancelled" | "Completed" | "Failed";
  type: "delivery" | "funding" | "sent" | "withdrawal";
  meta?: string; // recipient name for sent, bank name for withdrawal
};

const SEED: ActivityEntry[] = [
  { id: "DSH-00124", amount: 20000, date: "Today, 2:14 PM", status: "Delivered", type: "delivery" },
  { id: "DSH-00123", amount: 8000, date: "Yesterday, 6:40 PM", status: "Delivered", type: "delivery" },
  { id: "DSH-00122", amount: 50000, date: "Jun 19, 11:02 AM", status: "Delivered", type: "delivery" },
  { id: "DSH-00121", amount: 15000, date: "Jun 17, 9:22 AM", status: "Delivered", type: "delivery" },
];

export function getActivity(): ActivityEntry[] {
  if (typeof window === "undefined") return SEED;
  const stored = localStorage.getItem(ACTIVITY_KEY);
  if (!stored) {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(SEED));
    return SEED;
  }
  return JSON.parse(stored);
}

export function addActivity(entry: Omit<ActivityEntry, "id" | "date">) {
  const list = getActivity();
  const next: ActivityEntry = {
    ...entry,
    id: "DSH-" + String(10000 + list.length + 1).slice(-5),
    date: "Just now",
  };
  const updated = [next, ...list];
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updated));
  return updated;
}
