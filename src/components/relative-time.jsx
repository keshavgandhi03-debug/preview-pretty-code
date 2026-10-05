import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

/** Renders a stable absolute date on the server, then a relative label after hydration. */
export function RelativeTime({ value }) {
  const [label, setLabel] = useState(() => new Date(value).toISOString().slice(0, 16).replace("T", " "));
  useEffect(() => {
    setLabel(formatDistanceToNow(new Date(value), { addSuffix: true }));
  }, [value]);
  return <>{label}</>;
}
