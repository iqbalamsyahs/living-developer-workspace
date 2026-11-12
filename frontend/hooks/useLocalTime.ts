"use client";

import { useEffect, useState } from "react";
import { formatLocalTime } from "@/lib/time";

/** Live "HH:mm:ss" in the given zone. Null until mounted, so server and first client render match. */
export function useLocalTime(timeZone: string): string | null {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => setTime(formatLocalTime(new Date(), timeZone));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timeZone]);
  return time;
}
