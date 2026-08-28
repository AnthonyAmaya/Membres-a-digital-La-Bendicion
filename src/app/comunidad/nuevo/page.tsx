"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { MemberForm } from "@/components/member-form";
import type { MemberPhotoChange } from "@/components/member-form";
import { useMembers } from "@/components/members-provider";
import type { MemberInput } from "@/lib/types";

export default function NuevoCreyentePage() {
  const router = useRouter();
  const { addMember } = useMembers();

  async function handleSubmit(data: MemberInput, photo?: MemberPhotoChange) {
    const member = await addMember(data, photo);
    toast.success("La persona quedó registrada en la comunidad.");
    router.push(`/comunidad/${member.id}`);
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
            Registro
          </p>
          <h1 className="font-heading mt-1 text-2xl font-bold text-foreground">
            Nuevo creyente
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Anota quién llegó, cómo llegó y en qué podría servir. Después podrás
            marcar su trayectoria e imprimir su ficha.
          </p>
        </div>
      </div>
      <div className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-foreground/10 sm:p-6 lg:p-8">
        <MemberForm
          wide
          submitLabel="Guardar en la comunidad"
          onSubmit={handleSubmit}
          onCancel={() => router.push("/comunidad")}
        />
      </div>
    </div>
  );
}
