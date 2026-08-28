"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";

import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="username">
          Usuario
        </Label>
        <div className="relative">
          <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="username"
            name="username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="Tu usuario"
            required
            aria-invalid={Boolean(state?.error)}
            className="h-11 rounded-xl bg-slate-50 pl-10 text-[15px]"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">
          Contraseña
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Tu contraseña"
            required
            aria-invalid={Boolean(state?.error)}
            className="h-11 rounded-xl bg-slate-50 pr-11 pl-10 text-[15px]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-foreground"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
      {state?.error ? (
        <p
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          {state.error}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={pending}
        className="mt-1 h-11 w-full rounded-xl bg-[#0077b6] text-[15px] font-semibold tracking-wide hover:bg-[#015f8c]"
      >
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
