"use client";

import { Icon } from "@/components/admin/icons";
import { buttonClass } from "@/components/admin/PageHeader";

interface DeleteButtonProps {
  action: () => Promise<void>;
  confirmMessage: string;
  label?: string;
}

export default function DeleteButton({
  action,
  confirmMessage,
  label = "Delete",
}: DeleteButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <button type="submit" className={buttonClass.danger}>
        <Icon name="trash" className="h-4 w-4" />
        {label}
      </button>
    </form>
  );
}
