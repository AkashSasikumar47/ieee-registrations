export async function send(url: string, init: RequestInit, fallback: string) {
  try {
    const response = await fetch(url, {
      ...init,
      headers: init.body ? { "Content-Type": "application/json" } : undefined,
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) return { data, error: null };
    return { data, error: (data.error as string | undefined) ?? fallback };
  } catch {
    return {
      data: {},
      error: "Couldn't reach the server. Check your connection.",
    };
  }
}
