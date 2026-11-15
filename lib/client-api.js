// Small fetch wrapper for client components. Throws an Error carrying `.fields` for form errors.
export async function api(url, { method = "GET", body } = {}) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || "Request failed.");
    err.fields = data.fields || {};
    err.status = res.status;
    throw err;
  }
  return data;
}
