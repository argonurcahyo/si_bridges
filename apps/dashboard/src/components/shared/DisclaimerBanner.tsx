import { ShieldAlert } from "lucide-react";
import { teks } from "@/i18n/id";

export function DisclaimerBanner() {
  return (
    <p className="text-muted-foreground flex items-center justify-center gap-2 px-4 py-3 text-center text-xs">
      <ShieldAlert className="size-3.5 shrink-0 text-violet-500" aria-hidden="true" />
      {teks.disclaimer}
    </p>
  );
}
