import { Badge } from "@/components/ui/badge";
import type { DataStatus } from "@/schemas/hydro";
import { teks } from "@/i18n/id";

export function DataBadge({ status }: { status: DataStatus }) {
  return (
    <Badge variant="outline" className="text-muted-foreground border-dashed">
      {teks.status[status]}
    </Badge>
  );
}
