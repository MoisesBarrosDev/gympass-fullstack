export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Algo deu errado.";
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  const token =
    typeof window === "undefined" ? null : localStorage.getItem("accessToken");

  if (options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response = await fetch(`/api${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && retry && !path.includes("sessions")) {
    const refresh = await fetch("/api/sessions/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (refresh.ok) {
      const data = (await refresh.json()) as { token: string };
      localStorage.setItem("accessToken", data.token);
      headers.set("Authorization", `Bearer ${data.token}`);
      response = await fetch(`/api${path}`, {
        ...options,
        headers,
        credentials: "include",
      });
    }
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(
      body.message ??
        (response.status === 401
          ? "Sua sessão expirou."
          : "Não foi possível completar a ação."),
    );
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}
