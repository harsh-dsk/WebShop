import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignUpPage() {
  return (
    <div className="rounded-2xl border border-border bg-card p-1 shadow-sm">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        appearance={{
          elements: {
            rootBox: "w-full",
            cardBox: "shadow-none",
          },
        }}
      />
    </div>
  );
}
