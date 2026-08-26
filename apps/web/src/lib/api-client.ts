let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch("/api/sessions/refresh", {
      method: "POST",
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) return null;

        const data = (await response.json()) as { token: string };
        return data.token;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  const token = await refreshPromise;
  setAccessToken(token);
  return token !== null;
}

export function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Algo deu errado.";
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  let response = await fetch(`/api${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && retry && !path.includes("sessions")) {
    if (await refreshAccessToken()) {
      headers.set("Authorization", `Bearer ${accessToken}`);
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
