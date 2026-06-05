"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "animate-dropdown-in",
        },
      }}
    />
  );
}

/** @deprecated Use AppToaster */
export const ShopToaster = AppToaster;
