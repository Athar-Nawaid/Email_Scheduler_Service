"use client";

import { useState } from "react";

export default function ComposeModal({onClose,onSuccess}: {onClose: () => void;
  onSuccess: () => void;}) {

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [startTime, setStartTime] = useState("");
  const [delayMs, setDelayMs] = useState("5000");
  const [hourlyLimit, setHourlyLimit] = useState("100");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [recipientsText, setRecipientsText] = useState("");




async function submit() {

    setLoading(true);
    try {
      if (file) {
        // CSV upload
        const form = new FormData();
        form.append("file", file);
        form.append("subject", subject);
        form.append("body", body);
        form.append("startTime", startTime);
        form.append("delayMs", delayMs);
        form.append("hourlyLimit", hourlyLimit);
        
        console.log("Sending CSV API request");

        await fetch("http://localhost:4000/campaign/from-csv", {
          method: "POST",
          body: form
        });
    } else {
    // Parse recipients from textarea
        const recipients = recipientsText
            .split(/[\n,]/)
            .map(x => x.trim())
            .filter(x => x.length > 0);

        if (recipients.length === 0) {
            alert("Please enter at least one recipient or upload a CSV");
            setLoading(false);
            return;
        }

        // alert("Sending normal API request");
        // console.log("Sending normal API request");

        const res = await fetch("http://localhost:4000/campaign/create", {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({
            subject,
            body,
            recipients,
            startTime,
            delayMs: Number(delayMs),
            hourlyLimit: Number(hourlyLimit)
            })
        });

        // console.log(res);
        // alert("Sending normal API request");

    }

        

      onSuccess();
      onClose();
    } catch (err) {
      alert("Failed to schedule");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

return (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-white text-black p-6 rounded-lg w-[520px] shadow-2xl">


        <h2 className="text-xl font-bold mb-4">Compose Campaign</h2>

        <div className="space-y-3">
            <input
                className="w-full border border-gray-300 p-2 rounded bg-white text-black placeholder-gray-500"
                placeholder="Subject"
                value={subject}
                onChange={e => setSubject(e.target.value)}
            />

            <textarea
                className="w-full border border-gray-300 p-2 rounded bg-white text-black placeholder-gray-500 h-24"
                placeholder="Body"
                value={body}
                onChange={e => setBody(e.target.value)}
            />

            <div>
                <label className="text-sm text-gray-600">Start time</label>
                <input
                type="datetime-local"
                className="w-full border border-gray-300 p-2 rounded bg-white text-black"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <input
                className="border border-gray-300 p-2 rounded bg-white text-black placeholder-gray-500"
                placeholder="Delay (ms)"
                value={delayMs}
                onChange={e => setDelayMs(e.target.value)}
                />

                <input
                className="border border-gray-300 p-2 rounded bg-white text-black placeholder-gray-500"
                placeholder="Hourly limit"
                value={hourlyLimit}
                onChange={e => setHourlyLimit(e.target.value)}/>

            </div>
            <textarea className="w-full border border-gray-300 p-2 rounded bg-white text-black placeholder-gray-500 h-24"
            placeholder="Recipients (one per line or comma separated)"
            value={recipientsText} onChange={e => setRecipientsText(e.target.value)}/>

            <div className="text-sm text-gray-500">
                You can either paste emails above OR upload a CSV file
            </div>

            <div>
                <label className="text-sm text-gray-600">CSV file (optional)</label>
                <input
                type="file"
                accept=".csv"
                className="w-full border border-gray-300 p-2 rounded bg-white text-black"
                onChange={e => setFile(e.target.files?.[0] || null)}
                />
            </div>
        </div>


        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-400 rounded hover:bg-gray-100">
            Cancel
          </button>

          <button type="button"
            disabled={loading}
            onClick={()=>{alert("CLICK WORKED");
            // console.log("CLICK WORKED");
                submit()}}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
            {loading ? "Scheduling..." : "Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}
