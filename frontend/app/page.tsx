"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-black">
      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl text-center w-[360px] border border-gray-700">
        <h1 className="text-2xl font-bold mb-2 text-white">
          Email Scheduler
        </h1>
        <p className="text-gray-400 mb-6">
          Sign in to manage your email campaigns
        </p>

        <button
          onClick={() => signIn("google")}
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
          />
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  );
}
