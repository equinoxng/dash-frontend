"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  listAddresses, createAddress, updateAddress, deleteAddress,
  type DeliveryAddress, type DeliveryAddressPayload,
} from "@/lib/addresses";
import { getSession } from "@/lib/session";
import { ApiError } from "@/lib/api";

const EMPTY_FORM: DeliveryAddressPayload = {
  label: "", houseNumber: "", street: "", city: "", state: "", landmark: "", defaultAddress: false,
};

export default function AddressSettings() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<DeliveryAddressPayload>(EMPTY_FORM);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = () => {
    const session = getSession();
    if (!session) return;
    listAddresses(session.token).then(setAddresses).catch(() => {});
  };

  useEffect(() => {
    const session = getSession();
    if (!session) { router.push("/signin"); return; }
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (k: keyof DeliveryAddressPayload, v: string | boolean) => { setForm(f => ({ ...f, [k]: v })); setError(""); };

  const startAdd = () => { setForm(EMPTY_FORM); setAdding(true); setEditingId(null); };
  const startEdit = (a: DeliveryAddress) => {
    setForm({
      label: a.label, houseNumber: a.houseNumber ?? "", street: a.street,
      city: a.city, state: a.state ?? "", landmark: a.landmark ?? "", defaultAddress: a.defaultAddress,
    });
    setEditingId(a.id);
    setAdding(true);
  };
  const cancel = () => { setAdding(false); setEditingId(null); setForm(EMPTY_FORM); setError(""); };

  const handleSave = async () => {
    const session = getSession();
    if (!session) return;
    if (!form.label.trim() || !form.street.trim() || !form.city.trim()) {
      setError("Label, street and city are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await updateAddress(session.token, editingId, form);
      } else {
        await createAddress(session.token, form);
      }
      cancel();
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const session = getSession();
    if (!session) return;
    await deleteAddress(session.token, id);
    refresh();
  };

  const inputClass = "w-full border rounded-xl px-4 py-3 text-sm focus:outline-none bg-white text-[#0f0f0f] placeholder-slate-300";
  const borderStyle = { borderColor: "#e0d9d0" };

  return (
    <div className="min-h-screen" style={{ background: "#f5f0eb" }}>
      <nav className="sticky top-0 z-40 border-b px-4" style={{ background: "#f5f0eb", borderColor: "#e0d9d0" }}>
        <div className="max-w-2xl mx-auto h-16 flex items-center gap-4">
          <Link href="/profile" className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "white", border: "1px solid #e0d9d0" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="#0f0f0f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
          <Link href="/dashboard"><Image src="/logo.png" alt="Dash" width={72} height={28} /></Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#0f0f0f]">Delivery addresses</h1>
          {!adding && (
            <button onClick={startAdd}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-80"
              style={{ background: "#1e1240", color: "white" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><line x1="7" y1="2" x2="7" y2="12" stroke="white" strokeWidth="1.8" strokeLinecap="round"/><line x1="2" y1="7" x2="12" y2="7" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
              Add address
            </button>
          )}
        </div>

        {adding && (
          <div className="bg-white rounded-2xl border p-5 space-y-4" style={borderStyle}>
            <h2 className="font-bold text-[#0f0f0f]">{editingId ? "Edit address" : "New address"}</h2>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Label</label>
              <input type="text" placeholder="e.g. Home, Work" value={form.label}
                onChange={e => update("label", e.target.value)} className={inputClass} style={borderStyle} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">House number</label>
                <input type="text" placeholder="14" value={form.houseNumber}
                  onChange={e => update("houseNumber", e.target.value)} className={inputClass} style={borderStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Street</label>
                <input type="text" placeholder="Adeola Odeku St" value={form.street}
                  onChange={e => update("street", e.target.value)} className={inputClass} style={borderStyle} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">City</label>
                <input type="text" placeholder="Victoria Island" value={form.city}
                  onChange={e => update("city", e.target.value)} className={inputClass} style={borderStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">State</label>
                <input type="text" placeholder="Lagos" value={form.state}
                  onChange={e => update("state", e.target.value)} className={inputClass} style={borderStyle} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Landmark <span className="text-slate-300">(optional)</span></label>
              <input type="text" placeholder="Near Access Bank" value={form.landmark}
                onChange={e => update("landmark", e.target.value)} className={inputClass} style={borderStyle} />
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.defaultAddress}
                onChange={e => update("defaultAddress", e.target.checked)}
                className="w-4 h-4 rounded" />
              <span className="text-sm text-slate-700">Set as default</span>
            </label>

            {error && <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button onClick={cancel}
                className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ background: "#f5f0eb", color: "#334155" }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-60 hover:opacity-90"
                style={{ background: "#1e1240" }}>
                {saving ? "Saving…" : "Save address"}
              </button>
            </div>
          </div>
        )}

        {addresses.length === 0 && !adding ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#ede8fb" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="1.8" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <p className="text-[#0f0f0f] font-semibold">No delivery addresses saved</p>
            <p className="text-slate-400 text-sm">Add one to pick it when requesting cash</p>
            <button onClick={startAdd}
              className="mt-1 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: "#1e1240" }}>
              Add address
            </button>
          </div>
        ) : (
          !adding && (
            <div className="space-y-3">
              {addresses.map(a => (
                <div key={a.id} className="flex items-center gap-3 bg-white rounded-2xl px-4 py-4 border" style={borderStyle}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#ede8fb" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b3fc4" strokeWidth="1.8" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[#0f0f0f] font-semibold text-sm">{a.label}</p>
                      {a.defaultAddress && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "#ede8fb", color: "#5b3fc4" }}>Default</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-xs truncate">{a.fullAddress}</p>
                  </div>
                  <button onClick={() => startEdit(a)} className="p-2 rounded-lg hover:bg-[#f5f0eb] transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
