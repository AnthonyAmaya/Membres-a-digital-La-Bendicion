"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Church,
  Compass,
  Home,
  LogOut,
  PanelLeft,
  Users,
  UserPlus,
} from "lucide-react";

import { logoutAction } from "@/app/actions/auth";
import { useMembers } from "@/components/members-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SIDEBAR_KEY = "lb_sidebar_expanded";

export const NAV_LINKS = [
  { href: "/", label: "Inicio", short: "Inicio", icon: Home, accent: false },
  { href: "/comunidad", label: "Comunidad", short: "Comunidad", icon: Users, accent: false },
  {
    href: "/comunidad/nuevo",
    label: "Nuevo creyente",
    short: "Registrar",
    icon: UserPlus,
    accent: true,
  },
  { href: "/ministerios", label: "Ministerios", short: "Ministerios", icon: Church, accent: false },
  { href: "/trayectoria", label: "Trayectoria", short: "Camino", icon: Compass, accent: false },
] as const;

export function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/comunidad") return pathname === "/comunidad";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  expanded,
  onNavigate,
}: {
  expanded: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="grid gap-1">
      {NAV_LINKS.map((link) => {
        const active = isNavActive(pathname, link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            title={expanded ? undefined : link.label}
            onClick={onNavigate}
            className={cn(
              "flex min-h-11 items-center rounded-2xl text-sm font-medium transition",
              expanded ? "gap-3 px-3" : "justify-center px-0",
              active
                ? "bg-[#013a63] text-white shadow-sm"
                : "text-slate-500 hover:bg-[#e8f6fc] hover:text-[#013a63]"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {expanded ? <span className="truncate">{link.label}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}

function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#013a63] text-white md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navegación principal"
    >
      <ul className="grid grid-cols-5">
        {NAV_LINKS.map((link) => {
          const active = isNavActive(pathname, link.href);
          const Icon = link.icon;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium",
                  active ? "text-[#90e0ef]" : "text-white/65"
                )}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full",
                    link.accent && !active && "bg-[#0077b6] text-white",
                    link.accent && active && "bg-[#48cae4] text-[#013a63]",
                    !link.accent && active && "bg-white/10"
                  )}
                >
                  <Icon className="size-4" />
                </span>
                {link.short}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useMembers();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(SIDEBAR_KEY);
    if (stored === "1") setExpanded(true);
  }, []);

  function toggleSidebar() {
    setExpanded((current) => {
      const next = !current;
      window.localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      return next;
    });
  }

  if (pathname.includes("/imprimir") || pathname === "/login") {
    return <>{children}</>;
  }

  const isWorkspace = pathname === "/";

  return (
    <div className="flex min-h-svh bg-zinc-100 md:gap-3 md:p-3">
      <aside
        className={cn(
          "sticky top-3 hidden h-[calc(100svh-1.5rem)] shrink-0 flex-col rounded-3xl bg-white py-4 shadow-sm transition-[width] duration-200 md:flex",
          expanded ? "w-56 px-3" : "w-[5.25rem] px-2"
        )}
      >
        <div className={cn("flex", expanded ? "flex-col gap-3" : "flex-col items-center gap-3")}>
          {expanded ? (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-slate-500"
                onClick={toggleSidebar}
                aria-label="Dejar solo iconos"
              >
                <PanelLeft className="size-4" />
              </Button>
            </div>
          ) : null}
          <Link href="/" className="flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Iglesia La Bendición"
              width={240}
              height={211}
              className={cn(
                "w-auto object-contain",
                expanded ? "h-[4.75rem]" : "h-12"
              )}
              priority
            />
          </Link>
          {expanded ? null : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-slate-400"
              onClick={toggleSidebar}
              aria-label="Mostrar nombres del menú"
            >
              <PanelLeft className="size-4" />
            </Button>
          )}
        </div>

        <div className="mt-6 flex-1">
          <NavLinks expanded={expanded} />
        </div>

        <form action={logoutAction} className={expanded ? "px-0" : "flex justify-center"}>
          <Button
            type="submit"
            variant="ghost"
            title="Cerrar sesión"
            className={cn(
              "h-11 text-slate-500 hover:bg-[#e8f6fc] hover:text-[#013a63]",
              expanded ? "w-full justify-start" : "size-11 px-0"
            )}
            aria-label="Cerrar sesión"
          >
            <LogOut className="size-4" />
            {expanded ? "Salir" : null}
          </Button>
        </form>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between bg-[#013a63] px-4 py-2.5 text-white md:hidden">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Iglesia La Bendición"
              width={200}
              height={176}
              className="h-11 w-auto object-contain"
              priority
            />
          </Link>
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="size-10 text-white hover:bg-white/10 hover:text-white"
              aria-label="Cerrar sesión"
            >
              <LogOut className="size-4" />
            </Button>
          </form>
        </header>

        <header className="mb-3 hidden items-center justify-between rounded-3xl bg-white px-5 py-3 shadow-sm md:flex">
          <p className="font-heading text-sm font-semibold text-foreground">
            {user ? `Sesión de ${user.name}` : "Acceso pastoral"}
          </p>
          <div className="flex size-9 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-white">
            {(user?.name ?? "P").slice(0, 1).toUpperCase()}
          </div>
        </header>

        <main
          className={cn(
            "min-h-0 min-w-0 flex-1",
            isWorkspace
              ? "overflow-hidden md:pb-0"
              : "overflow-auto px-4 pt-5 pb-24 md:rounded-3xl md:bg-white md:px-6 md:py-6 md:pb-6 md:shadow-sm"
          )}
        >
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
