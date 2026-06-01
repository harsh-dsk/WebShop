import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <div className="rounded-2xl border border-border bg-card p-1 shadow-sm">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
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
