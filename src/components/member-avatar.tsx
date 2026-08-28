"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { photoPublicUrl } from "@/lib/photo-url";
import { fullName, initials } from "@/lib/format";
import type { Member } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MemberAvatar({
  member,
  className,
  size = "default",
}: {
  member: Pick<Member, "firstName" | "lastName" | "photoPath">;
  className?: string;
  size?: "default" | "sm" | "lg";
}) {
  const src = photoPublicUrl(member.photoPath);

  return (
    <Avatar
      size={size}
      className={cn("overflow-hidden bg-slate-600 text-white", className)}
    >
      {src ? (
        <AvatarImage src={src} alt={fullName(member)} className="object-cover" />
      ) : null}
      <AvatarFallback className="bg-slate-600 font-heading text-white">
        {initials(member)}
      </AvatarFallback>
    </Avatar>
  );
}
