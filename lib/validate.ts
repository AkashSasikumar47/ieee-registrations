export const INPUT_PATTERNS = {
  email: "[A-Za-z0-9._%+\\-]+@srmist\\.edu\\.in",
  registerNumber: "RA[0-9]{13}",
  phone: "[6-9][0-9]{9}",
};

export type Participant = {
  name: string;
  email: string;
  register_number: string;
  phone: string;
  answers: Record<string, string>;
};

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function readParticipant(body: Record<string, unknown>): Participant {
  const answers: Record<string, string> = {};
  if (typeof body.answers === "object" && body.answers !== null) {
    for (const [key, value] of Object.entries(body.answers)) {
      if (typeof value === "string") answers[key] = value.trim().slice(0, 1000);
    }
  }
  return {
    name: text(body.name, 100),
    email: text(body.email, 120),
    register_number: text(body.register_number, 20),
    phone: text(body.phone, 15),
    answers,
  };
}

export async function readJson(request: Request) {
  try {
    const body: unknown = await request.json();
    return typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
