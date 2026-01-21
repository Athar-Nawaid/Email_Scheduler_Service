"use client";

import { useSession } from "next-auth/react";
import Header from "@/components/Header"
import { useEffect, useState } from "react";
import EmailTable from "@/components/EmailTable";


export default function Dashboard() {
  const { status } = useSession();
  const [tab, setTab] = useState<"scheduled" | "sent">("scheduled");
  const [scheduled, setScheduled] = useState([]);
  const [sent, setSent] = useState([]);

 useEffect(() => {
    fetch("http://localhost:4000/campaign/scheduled")
      .then(r => r.json())
      .then(setScheduled);

    fetch("http://localhost:4000/campaign/sent")
      .then(r => r.json())
      .then(setSent);
  }, []);
  
  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") return <div>Not logged in</div>;


  return (
    <div className="h-screen flex flex-col">
      <Header />

      <div className="flex-1 p-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab("scheduled")}
            className={`px-4 py-2 rounded ${
              tab === "scheduled"
                ? "bg-black text-white"
                : "border"
            }`}
          >
            Scheduled Emails
          </button>

          <button
            onClick={() => setTab("sent")}
            className={`px-4 py-2 rounded ${
              tab === "sent" ? "bg-black text-white" : "border"
            }`}
          >
            Sent Emails
          </button>

          <button className="ml-auto px-4 py-2 bg-green-600 text-white rounded">
            Compose New Email
          </button>
        </div>

        <div className="border rounded p-4">
          {tab === "scheduled" ? (
            <EmailTable emails={scheduled}/>) : (<EmailTable emails={sent}/>)}
        </div>
      </div>
    </div>
  );
}
