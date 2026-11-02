import { Icon } from "@/components/admin/icons";

export default function SavedNotice({
  message = "Changes saved.",
}: {
  message?: string;
}) {
  return (
    <p
      role="status"
      className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
        <Icon name="check" className="h-3.5 w-3.5" />
      </span>
      {message}
    </p>
  );
}
