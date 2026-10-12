export function safeReturnTo(value: unknown) {
  return typeof value === "string" &&
    /^\/(admin|scan)(\/[a-z0-9-]+)*$/.test(value) &&
    value !== "/admin/login" &&
    value !== "/scan/login"
    ? value
    : null;
}

export function loginFor(returnTo: string | null) {
  return returnTo?.startsWith("/scan") ? "/scan/login" : "/admin/login";
}
