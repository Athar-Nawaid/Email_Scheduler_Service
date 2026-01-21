type Email = {
  id: number;
  to: string;
  subject: string;
  scheduledAt?: string;
  sentAt?: string;
  status: string;
};

export default function EmailTable({ emails }: { emails: Email[] }) {
  if (emails.length === 0) {
    return <div className="text-gray-500">No emails</div>;
  }

  return (
    <table className="w-full border">
      <thead>
        <tr className="border-b">
          <th className="text-left p-2">To</th>
          <th className="text-left p-2">Subject</th>
          <th className="text-left p-2">Time</th>
          <th className="text-left p-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {emails.map(e => (
          <tr key={e.id} className="border-b">
            <td className="p-2">{e.to}</td>
            <td className="p-2">{e.subject}</td>
            <td className="p-2">
              {e.scheduledAt || e.sentAt}
            </td>
            <td className="p-2">{e.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
