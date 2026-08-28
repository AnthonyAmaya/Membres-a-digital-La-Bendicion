import { Badge } from "@/components/ui/badge";
import { statusLabel } from "@/lib/catalog";
import type { MemberStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const styles: Record<MemberStatus, string> = {
  visitante:
    "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100",
  nuevo_creyente:
    "border-transparent bg-violet-100 text-violet-800 hover:bg-violet-100",
  activo:
    "border-transparent bg-emerald-600 text-white hover:bg-emerald-600",
  inactivo:
    "border-transparent bg-slate-200 text-slate-600 hover:bg-slate-200",
};

export function StatusBadge({ status }: { status: MemberStatus }) {
  return (
    <Badge className={cn("font-medium", styles[status])}>
      {statusLabel(status)}
    </Badge>
  );
}
