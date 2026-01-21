"use client";

import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <div className="h-16 border-b flex items-center px-6">
      <div className="font-bold text-lg">ReachInbox Scheduler</div>

      <div className="ml-auto flex items-center gap-3">
        <img
          src={session?.user?.image || ""}
          className="w-8 h-8 rounded-full"
          alt="avatar"
        />
        <div className="text-sm">
          <div>{session?.user?.name}</div>
          <div className="text-gray-500 text-xs">
            {session?.user?.email}
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="ml-4 px-3 py-1 border rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
