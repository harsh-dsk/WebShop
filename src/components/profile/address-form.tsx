"use client";

import { useState } from "react";

type Props = {
  initial?: {
    fullName?: string | null;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
  };
};

export default function AddressForm({ initial }: Props) {
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [stateVal, setStateVal] = useState(initial?.state ?? "");
  const [postalCode, setPostalCode] = useState(initial?.postalCode ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fullName, phone, address, city, state: stateVal, postalCode }),
      });
      if (!res.ok) throw new Error("Save failed");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-sm">Full name</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm">Phone</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm">Address</label>
          <textarea
            className="mt-1 w-full rounded-md border px-3 py-2"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm">City</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm">State</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={stateVal}
            onChange={(e) => setStateVal(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm">Postal code</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-white"
          disabled={status === "saving"}
        >
          {status === "saving" ? "Saving…" : "Save address"}
        </button>
        {status === "saved" && <span className="text-sm text-green-600">Saved</span>}
        {status === "error" && <span className="text-sm text-red-600">Error saving</span>}
      </div>
    </form>
  );
}
