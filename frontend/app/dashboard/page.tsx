"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header"
import { useEffect, useState } from "react";
import EmailTable from "@/components/EmailTable";
import ComposeModal from "@/components/ComposeModal";



export default function Dashboard() {
  const { status } = useSession();
  const [tab, setTab] = useState<"scheduled" | "sent">("scheduled");
  const [scheduled, setScheduled] = useState([]);
  const [sent, setSent] = useState([]);
  const [showCompose, setShowCompose] = useState(false);

  const router = useRouter();


useEffect(() => {
  let timer: NodeJS.Timeout;

  async function load() {
    try {
      const s1 = await fetch("http://localhost:4000/campaign/scheduled");
      const scheduledData = await s1.json();
      setScheduled(scheduledData);

      const s2 = await fetch("http://localhost:4000/campaign/sent");
      const sentData = await s2.json();
      setSent(sentData);
    } catch (err) {
      console.error("Failed to load emails", err);
    }
  }

  load();
  timer = setInterval(load, 5000);

  return () => {
    clearInterval(timer);
  };
}, []);

useEffect(() => {
  if (status === "unauthenticated") {
    router.push("/");
  }
}, [status, router]);


  if (status === "loading") return <div>Loading...</div>;




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
            }`}>
            Scheduled Emails
          </button>

          <button
            onClick={() => setTab("sent")}
            className={`px-4 py-2 rounded ${
              tab === "sent" ? "bg-black text-white" : "border"
            }`}>
            Sent Emails
          </button>

          <button onClick={() => setShowCompose(true)} className="ml-auto px-4 py-2 bg-green-600 text-white rounded">
            Compose New Email
          </button>
        </div>

        <div className="border rounded p-4">
          {tab === "scheduled" ? (
            <EmailTable emails={scheduled}/>) : (<EmailTable emails={sent}/>)}
        </div>
      </div>

      {showCompose && (
          <ComposeModal
            onClose={() => setShowCompose(false)}
            onSuccess={() => {
              // refresh lists
              window.location.reload();
            }}
          />
        )}

    </div>
  );
}
