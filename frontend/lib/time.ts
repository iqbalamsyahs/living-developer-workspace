/** "HH:mm:ss" (24h, zero padded) for an instant in an IANA time zone. */
export function formatLocalTime(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

/** Short label for a zone: WIB for Jakarta, otherwise the city part of the IANA name. */
export function zoneLabel(timeZone: string): string {
  return timeZone === "Asia/Jakarta" ? "WIB" : (timeZone.split("/").pop() ?? timeZone).replace(/_/g, " ");
}
