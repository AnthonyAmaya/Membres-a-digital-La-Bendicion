import Link from "next/link";

import { MemberAvatar } from "@/components/member-avatar";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { assignmentMinistryLabel } from "@/lib/catalog";
import { currentStepLabel, fullName, trajectoryProgress } from "@/lib/format";
import type { Member } from "@/lib/types";

export function MemberCard({
  member,
  compact = false,
}: {
  member: Member;
  compact?: boolean;
}) {
  const progress = trajectoryProgress(member);

  if (compact) {
    return (
      <Link
        href={`/comunidad/${member.id}`}
        className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200 transition active:scale-[0.99] hover:bg-white hover:ring-violet-300"
      >
        <MemberAvatar member={member} className="size-11" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-heading truncate text-[15px] font-semibold text-foreground">
              {fullName(member)}
            </h3>
            <StatusBadge status={member.status} />
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {member.occupation || "Sin ocupación registrada"}
            {member.ministries[0]
              ? ` · ${assignmentMinistryLabel(member.ministries[0])}`
              : ""}
          </p>
          <p className="mt-1 text-xs text-emerald-700">
            {currentStepLabel(member)} · {progress}%
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/comunidad/${member.id}`} className="block">
      <Card className="h-full transition active:scale-[0.99] hover:shadow-md hover:ring-violet-200">
        <CardContent className="flex gap-3">
          <MemberAvatar member={member} className="size-12" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading truncate text-[15px] font-semibold text-foreground">
                {fullName(member)}
              </h3>
              <StatusBadge status={member.status} />
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {member.occupation || "Sin ocupación registrada"}
              {member.ministries[0]
                ? ` · ${assignmentMinistryLabel(member.ministries[0])}`
                : ""}
            </p>
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-xs text-emerald-700">
                <span>{currentStepLabel(member)}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
