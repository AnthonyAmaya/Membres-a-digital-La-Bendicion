"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Printer } from "lucide-react";

import { FichaPrint } from "@/components/ficha-print";
import { useMember } from "@/components/members-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ImprimirFichaPage() {
  const params = useParams<{ id: string }>();
  const { member, ready } = useMember(params.id);

  if (!ready) {
    return <p className="p-6 text-muted-foreground">Preparando la ficha…</p>;
  }

  if (!member) {
    return (
      <div className="grid gap-3 p-6">
        <h1 className="font-heading text-2xl font-bold">Ficha no encontrada</h1>
        <Link href="/comunidad" className={buttonVariants()}>
          Volver a la comunidad
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-white">
      <div className="no-print mx-auto flex max-w-[800px] items-center justify-between gap-3 px-4 py-4">
        <Link
          href={`/comunidad/${member.id}`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Volver a la ficha
        </Link>
        <Button
          onClick={() => window.print()}
        >
          <Printer />
          Imprimir o guardar PDF
        </Button>
      </div>
      <div className="px-4 py-4 print:px-0 print:py-0">
        <FichaPrint member={member} />
      </div>
    </div>
  );
}
