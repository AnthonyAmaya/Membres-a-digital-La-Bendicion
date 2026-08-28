import type { Metadata } from "next";
import Image from "next/image";
import { ClipboardList, Compass, Users } from "lucide-react";

import { LoginForm } from "@/app/login/login-form";
import { CHURCH } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Entrar · La Bendición",
  description:
    "Acceso pastoral a la comunidad de Iglesia La Bendición: registro, trayectoria e impresión de fichas.",
};

const uses = [
  {
    icon: Users,
    title: "Comunidad",
    text: "Registra visitantes y nuevos creyentes con su ficha.",
  },
  {
    icon: Compass,
    title: "Trayectoria",
    text: "Marca el camino de cada persona en la iglesia.",
  },
  {
    icon: ClipboardList,
    title: "Fichas",
    text: "Consulta e imprime el seguimiento pastoral.",
  },
];

function BrandPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-[#013a63] text-white lg:flex lg:flex-col lg:justify-between">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-16 size-[28rem] rounded-full bg-[#0077b6]/45 blur-3xl" />
        <div className="absolute right-[-6rem] bottom-[-5rem] size-[22rem] rounded-full bg-[#48cae4]/25 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.55) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center px-10 py-12 text-center xl:px-16">
        <Image
          src="/logo.png"
          alt="Iglesia La Bendición"
          width={280}
          height={247}
          className="mx-auto h-auto w-[min(100%,17.5rem)] drop-shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
          priority
        />

        <p className="mt-10 max-w-md text-lg leading-relaxed text-white/80">
          Espacio pastoral para acompañar a la comunidad de {CHURCH.name}.
        </p>

        <ul className="mt-10 grid w-full max-w-md gap-4 text-left">
          {uses.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <Icon className="size-4 text-[#90e0ef]" />
                </span>
                <span>
                  <span className="block text-sm font-semibold tracking-wide">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-white/65">
                    {item.text}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="relative border-t border-white/10 px-10 py-6 text-center xl:px-16">
        <p className="text-[11px] font-semibold tracking-[0.28em] text-[#90e0ef] uppercase">
          {CHURCH.motto}
        </p>
      </div>
    </aside>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-svh bg-[#eef6fa] lg:grid-cols-2">
      <header className="relative overflow-hidden bg-[#013a63] px-6 pt-10 pb-8 text-center text-white lg:hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 left-1/2 size-56 -translate-x-1/2 rounded-full bg-[#0077b6]/50 blur-3xl" />
        </div>
        <Image
          src="/logo.png"
          alt="Iglesia La Bendición"
          width={148}
          height={130}
          className="relative mx-auto h-auto w-[7.5rem] drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
          priority
        />
        <p className="relative mt-4 text-[11px] font-semibold tracking-[0.28em] text-[#90e0ef] uppercase">
          {CHURCH.motto}
        </p>
      </header>

      <BrandPanel />

      <main className="flex flex-col justify-center px-5 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-[26rem]">
          <div className="mb-7 lg:mb-8">
            <p className="text-[11px] font-semibold tracking-[0.32em] text-slate-500 uppercase">
              Acceso pastoral
            </p>
            <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-[2.05rem]">
              Iniciar sesión
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Entra para registrar creyentes, marcar la trayectoria e imprimir
              fichas.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_28px_70px_-32px_rgba(15,23,42,0.35)]">
            <div className="h-1 bg-gradient-to-r from-[#013a63] via-[#0077b6] to-[#48cae4]" />
            <div className="p-6 sm:p-8">
              <LoginForm />
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] tracking-wide text-muted-foreground lg:text-left">
            Iglesia {CHURCH.name}
          </p>
        </div>
      </main>
    </div>
  );
}
