"use client";

import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <button
        onClick={() => signIn("google")}
        className="px-6 py-3 bg-black text-white rounded-lg">
        Sign in with Google
      </button>
    </div>
  );
}
