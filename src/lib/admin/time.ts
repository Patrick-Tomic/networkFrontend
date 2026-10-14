// Event times are entered and shown in Wesley Chapel time, and stored in UTC.
const TZ = "America/New_York";

/** UTC ISO string → "YYYY-MM-DDTHH:MM" in Eastern time, for <input type="datetime-local">. */
export function toEasternInput(iso: string | null | undefined) {
  if (!iso) return "";
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

/** "YYYY-MM-DDTHH:MM" in Eastern time → UTC ISO string. */
export function fromEasternInput(value: string) {
  const guess = new Date(`${value}:00Z`);
  if (Number.isNaN(guess.getTime())) return null;
  const shown = toEasternInput(guess.toISOString());
  const offset = new Date(`${shown}:00Z`).getTime() - guess.getTime();
  return new Date(guess.getTime() - offset).toISOString();
}

/** "Oct 17, 2026, 10:00 AM" in Eastern time. */
export function formatEastern(iso: string | null | undefined) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
