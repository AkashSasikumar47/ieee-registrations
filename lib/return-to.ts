export function safeReturnTo(value: unknown) {
  return typeof value === "string" &&
    /^\/admin(\/[a-z0-9-]+)*$/.test(value) &&
    value !== "/admin/login"
    ? value
    : null;
}
