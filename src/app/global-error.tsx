"use client";

import { useEffect } from "react";

import { captureClientException } from "@/lib/monitoring";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureClientException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center font-sans">
        <h1 className="text-2xl font-bold text-gray-900">
          Application error
        </h1>
        <p className="mt-3 max-w-md text-gray-600">
          A critical error occurred. Please refresh the page or try again
          later.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-8 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
