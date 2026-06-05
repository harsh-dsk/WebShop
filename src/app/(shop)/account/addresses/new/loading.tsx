import { FormSkeleton } from "@/components/ui/skeleton";

export default function NewAddressLoading() {
  return (
    <div className="page-container max-w-xl py-10 sm:py-12">
      <FormSkeleton fields={8} />
    </div>
  );
}
