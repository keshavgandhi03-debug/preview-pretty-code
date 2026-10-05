export function renderErrorPage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p id="status" role="status">Reconnecting automatically…</p>
      <div class="actions">
        <button class="primary" id="retry" type="button">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
    <script>
      (() => {
        const status = document.getElementById('status');
        const retry = document.getElementById('retry');
        let attempt = 0;
        let stopped = false;
        const delays = [1000, 1500, 2500, 4000, 6000, 8000, 10000, 12000];

        const reconnect = async () => {
          if (stopped) return;
          attempt += 1;
          status.textContent = 'Reconnecting… attempt ' + attempt;
          try {
            const url = new URL(location.href);
            url.searchParams.set('_reconnect', Date.now().toString());
            const response = await fetch(url, {
              cache: 'no-store',
              headers: { Accept: 'text/html' },
            });
            const type = response.headers.get('content-type') || '';
            const html = await response.text();
            if (response.ok && type.includes('text/html') && !html.includes("This page didn't load")) {
              // Navigate to the exact cache-busted URL that succeeded instead
              // of re-requesting a potentially cached copy of the failed URL.
              location.replace(url);
              return;
            }
          } catch (_) {
            // The server is still waking. The next scheduled attempt continues recovery.
          }

          if (attempt < delays.length) {
            window.setTimeout(reconnect, delays[attempt]);
          } else {
            status.textContent = 'Still reconnecting. Use Try again to continue.';
          }
        };

        retry.addEventListener('click', () => {
          stopped = true;
          const url = new URL(location.href);
          url.searchParams.set('_reconnect', Date.now().toString());
          location.replace(url);
        });
        window.setTimeout(reconnect, delays[0]);
      })();
    </script>
  </body>
</html>`;
}
