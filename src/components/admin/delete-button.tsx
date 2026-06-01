"use client";

import { useTransition } from "react";

import { Button } from "@/components/ui/button";

type DeleteButtonProps = {
  label?: string;
  onDelete: () => Promise<{ error?: string; success?: boolean }>;
};

export function DeleteButton({
  label = "Delete",
  onDelete,
}: DeleteButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      className="border-red-200 text-red-700 hover:bg-red-50"
      onClick={() => {
        if (!confirm(`Are you sure you want to ${label.toLowerCase()}?`)) return;
        startTransition(async () => {
          const result = await onDelete();
          if (result.error) alert(result.error);
        });
      }}
    >
      {pending ? "Deleting…" : label}
    </Button>
  );
}
