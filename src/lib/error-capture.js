 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }// Captures the original Error out-of-band so server.js can recover the stack
// when h3 has already swallowed the throw into a generic 500 Response.

let lastCapturedError;
// Longer than the complete server retry window so the original stack remains
// available when a delayed startup attempt finally reports its failure.
const TTL_MS = 15000;

function record(error) {
  lastCapturedError = { error, at: Date.now() };
}

if (typeof globalThis.addEventListener === "function") {
  globalThis.addEventListener("error", (event) => record(_nullishCoalesce((event ).error, () => ( event))));
  globalThis.addEventListener("unhandledrejection", (event) =>
    record((event ).reason),
  );
}

export function consumeLastCapturedError() {
  if (!lastCapturedError) return undefined;
  if (Date.now() - lastCapturedError.at > TTL_MS) {
    lastCapturedError = undefined;
    return undefined;
  }
  const { error } = lastCapturedError;
  lastCapturedError = undefined;
  return error;
}
