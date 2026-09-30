const MESSAGES: Record<string, string> = {
  event_not_found: "This event isn't taking registrations.",
  not_open: "Registrations haven't opened yet.",
  closed: "Registrations for this event have closed.",
  already_registered:
    "This register number is already registered for this event.",
  invalid_name: "Enter your full name.",
  invalid_email: "Use your SRM email address (ending in @srmist.edu.in).",
  invalid_register_number:
    "Enter a valid register number, like RA2211003010001.",
  invalid_phone: "Enter a valid 10-digit mobile number.",
  invalid_team_name: "Enter a team name of up to 60 characters.",
  team_not_found: "That invite code doesn't match any team.",
  team_full: "This team is already full.",
  ticket_not_found: "This registration doesn't exist or was cancelled.",
  event_over: "This event is over, so the registration can't be changed.",
};

export function errorMessage(raw: string | undefined, fallback: string) {
  if (!raw) return fallback;
  const [code, detail] = raw.split(":");
  if (code === "missing_field")
    return `Fill in ${detail ?? "every required field"}.`;
  if (code === "invalid_field")
    return `Check the value for ${detail ?? "a field"}.`;
  return MESSAGES[code ?? ""] ?? fallback;
}
