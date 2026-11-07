import { useEffect, useState } from "react";
import { formatWaktuWib } from "@/lib/format";

export function ClockWib() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return <time dateTime={now.toISOString()}>{formatWaktuWib(now)}</time>;
}
