"use client";

import { useId, useState } from "react";

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
  const formId = useId();
  const [fullName, setFullName] = useState(initial?.fullName ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [stateVal, setStateVal] = useState(initial?.state ?? "");
  const [postalCode, setPostalCode] = useState(initial?.postalCode ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fullName, phone, address, city, state: stateVal, postalCode }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        throw new Error(data?.error ?? "Save failed");
      }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Could not save address",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4" aria-describedby={`${formId}-status`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`${formId}-fullName`} className="text-sm font-medium">
            Full name
          </label>
          <input
            id={`${formId}-fullName`}
            name="fullName"
            autoComplete="name"
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-phone`} className="text-sm font-medium">
            Phone
          </label>
          <input
            id={`${formId}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${formId}-address`} className="text-sm font-medium">
            Address
          </label>
          <textarea
            id={`${formId}-address`}
            name="address"
            autoComplete="street-address"
            className="mt-1 w-full rounded-md border px-3 py-2"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-city`} className="text-sm font-medium">
            City
          </label>
          <input
            id={`${formId}-city`}
            name="city"
            autoComplete="address-level2"
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-state`} className="text-sm font-medium">
            State
          </label>
          <input
            id={`${formId}-state`}
            name="state"
            autoComplete="address-level1"
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={stateVal}
            onChange={(e) => setStateVal(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${formId}-postalCode`} className="text-sm font-medium">
            Postal code
          </label>
          <input
            id={`${formId}-postalCode`}
            name="postalCode"
            autoComplete="postal-code"
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          disabled={status === "saving"}
        >
          {status === "saving" ? "Saving…" : "Save address"}
        </button>
        <span id={`${formId}-status`} role="status" aria-live="polite">
          {status === "saved" && (
            <span className="text-sm text-green-600">Saved</span>
          )}
          {status === "error" && (
            <span className="text-sm text-red-600">
              {errorMessage ?? "Error saving"}
            </span>
          )}
        </span>
      </div>
    </form>
  );
}
