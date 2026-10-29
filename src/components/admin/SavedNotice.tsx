export default function SavedNotice({
  message = "Changes saved.",
}: {
  message?: string;
}) {
  return (
    <p
      role="status"
      className="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
    >
      {message}
    </p>
  );
}
