 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";





let serverEntryPromise;

async function getServerEntry() {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (_nullishCoalesce(m.default, () => ( m))) ,
    ).catch((error) => {
      // Do not permanently cache a transient module/HMR load failure.
      // Clearing the rejected promise lets the next request recover without
      // requiring the preview server to restart.
      serverEntryPromise = undefined;
      throw error;
    });
  }
  return serverEntryPromise;
}

function errorText(error) {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  return String(error);
}

function isRetryableStartupError(error) {
  const code = error != null && typeof error === "object" && "code" in error
    ? String(error.code)
    : "";
  const message = errorText(error).toLowerCase();

  return ["ERR_MODULE_NOT_FOUND", "ERR_MODULE_NOT_RESOLVABLE", "ERR_LOAD_URL"].includes(code)
    || message.includes("failed to load url")
    || message.includes("module runner")
    || message.includes("outdated optimize dep")
    || message.includes("server is restarting")
    || message.includes("vite server is not ready");
}

class SsrResponseError extends Error {
  constructor(message, cause) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "SsrResponseError";
  }
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response) {
  if (response.status < 500) return response;
  const contentType = _nullishCoalesce(response.headers.get("content-type"), () => ( ""));
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  const capturedError = consumeLastCapturedError();
  const error = new SsrResponseError(
    `h3 swallowed SSR error: ${body}`,
    capturedError,
  );
  console.error(capturedError ?? error);
  throw error;
}

function isH3SwallowedErrorBody(body) {
  try {
    const payload = JSON.parse(body) ;
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch (e) {
    return false;
  }
}

// A preview that has been idle can need several seconds to restore its SSR
// module graph. Keep the first request alive during that window instead of
// immediately serving a dead-end error page.
const RETRY_DELAYS_MS = [250, 500, 1000, 2000, 3000];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default {
  async fetch(request, env, ctx) {
    let lastError;
    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
      try {
        const handler = await getServerEntry();
        const response = await handler.fetch(request, env, ctx);
        return await normalizeCatastrophicSsrResponse(response);
      } catch (error) {
        lastError = error;
        console.error(error);
        // Retrying a render or application error only hides its stack and keeps
        // a bad worker alive. Retry solely while Vite's module graph is waking.
        if (error instanceof SsrResponseError || !isRetryableStartupError(error)) break;

        serverEntryPromise = undefined;
        const retryDelay = RETRY_DELAYS_MS[attempt];
        if (retryDelay !== undefined) await sleep(retryDelay);
      }
    }
    return new Response(renderErrorPage(), {
      status: 500,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store, no-cache, must-revalidate",
        "retry-after": "2",
      },
    });
  },
};

