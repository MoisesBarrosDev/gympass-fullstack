"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/primitives";
import { api, getErrorMessage } from "@/lib/api-client";
import type { User } from "@/lib/domain";

export function AuthIsland({
  onAuthenticated,
}: {
  onAuthenticated: (user: User) => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    try {
      if (mode === "register") {
        await api("/users", {
          method: "POST",
          body: JSON.stringify({ name: form.get("name"), email, password }),
        });
      }
      const { token } = await api<{ token: string }>("/sessions", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("accessToken", token);
      onAuthenticated(await api<User>("/me"));
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-brand">
        <Logo />
        <div className="brand-copy">
          <span className="eyebrow">SEU RITMO. SEU ESPAÇO.</span>
          <h1>
            Movimento que
            <br />
            <em>transforma.</em>
          </h1>
          <p>
            Encontre academias perto de você, faça seu check-in e acompanhe cada
            passo da sua jornada.
          </p>
          <div className="brand-stats">
            <div>
              <strong>10 km</strong>
              <span>Busca por proximidade</span>
            </div>
            <div>
              <strong>1 toque</strong>
              <span>Check-in rápido</span>
            </div>
          </div>
        </div>
        <i className="orb one" />
        <i className="orb two" />
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <div className="mobile-logo">
            <Logo />
          </div>
          <span className="eyebrow">BEM-VINDO</span>
          <h2>{mode === "login" ? "Entre na sua conta" : "Crie sua conta"}</h2>
          <p>
            {mode === "login"
              ? "Continue construindo sua melhor versão."
              : "Comece hoje sua jornada de movimento."}
          </p>
          <div className="tabs">
            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => setMode("login")}
            >
              Entrar
            </button>
            <button
              className={mode === "register" ? "active" : ""}
              onClick={() => setMode("register")}
            >
              Criar conta
            </button>
          </div>
          <form onSubmit={submit}>
            {mode === "register" && (
              <label>
                Nome completo
                <input
                  name="name"
                  minLength={2}
                  required
                  placeholder="Como podemos te chamar?"
                />
              </label>
            )}
            <label>
              E-mail
              <input
                name="email"
                type="email"
                required
                placeholder="voce@email.com"
              />
            </label>
            <label>
              Senha
              <div className="password-field">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  minLength={6}
                  required
                  placeholder="Mínimo de 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  <Icon name={showPassword ? "eyeOff" : "eye"} />
                </button>
              </div>
            </label>
            {error && <div className="error">{error}</div>}
            <button className="primary full" disabled={loading}>
              {loading
                ? "Aguarde..."
                : mode === "login"
                  ? "Entrar"
                  : "Criar conta"}
              <Icon name="arrow" />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
