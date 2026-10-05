const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "@/lib/jsx-dev-shim";import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, } from "react";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    _jsxDEV('div', { className: "flex min-h-screen items-center justify-center bg-background px-4"     , children: 
      _jsxDEV('div', { className: "max-w-md text-center" , children: [
        _jsxDEV('h1', { className: "text-7xl font-bold text-foreground"  , children: "404"}, void 0, false, {fileName: _jsxFileName, lineNumber: 20}, this)
        , _jsxDEV('h2', { className: "mt-4 text-xl font-semibold text-foreground"   , children: "Page not found"  }, void 0, false, {fileName: _jsxFileName, lineNumber: 21}, this)
        , _jsxDEV('p', { className: "mt-2 text-sm text-muted-foreground"  , children: "The page you're looking for doesn't exist or has been moved."

        }, void 0, false, {fileName: _jsxFileName, lineNumber: 22}, this)
        , _jsxDEV('div', { className: "mt-6", children: 
          _jsxDEV(Link, {
            to: "/",
            className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"           ,
 children: "Go to dashboard"

          }, void 0, false, {fileName: _jsxFileName, lineNumber: 26}, this)
        }, void 0, false, {fileName: _jsxFileName, lineNumber: 25}, this)
      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 19}, this)
    }, void 0, false, {fileName: _jsxFileName, lineNumber: 18}, this)
  );
}

function ErrorComponent({ error, reset }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    _jsxDEV('div', { className: "flex min-h-screen items-center justify-center bg-background px-4"     , children: 
      _jsxDEV('div', { className: "max-w-md text-center" , children: [
        _jsxDEV('h1', { className: "text-xl font-semibold tracking-tight text-foreground"   , children: "This page didn't load"

        }, void 0, false, {fileName: _jsxFileName, lineNumber: 48}, this)
        , _jsxDEV('p', { className: "mt-2 text-sm text-muted-foreground"  , children: "Something went wrong on our end. You can try refreshing or head back home."

        }, void 0, false, {fileName: _jsxFileName, lineNumber: 51}, this)
        , _jsxDEV('div', { className: "mt-6 flex flex-wrap justify-center gap-2"    , children: [
          _jsxDEV('button', {
            onClick: () => { router.invalidate(); reset(); },
            className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"           ,
 children: "Try again"

          }, void 0, false, {fileName: _jsxFileName, lineNumber: 55}, this)
          , _jsxDEV('a', {
            href: "/",
            className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"             ,
 children: "Go home"

          }, void 0, false, {fileName: _jsxFileName, lineNumber: 61}, this)
        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 54}, this)
      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 47}, this)
    }, void 0, false, {fileName: _jsxFileName, lineNumber: 46}, this)
  );
}

export const Route = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Dashboard —  CRM" },
      { name: "description", content: "Counselling CRM dashboard: today's calls, follow-ups, and application progress across all campaigns." },
      { property: "og:title", content: "Dashboard —  CRM" },
      { property: "og:description", content: "Counselling CRM dashboard: today's calls, follow-ups, and application progress across all campaigns." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Dashboard —  CRM" },
      { name: "twitter:description", content: "Counselling CRM dashboard: today's calls, follow-ups, and application progress across all campaigns." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7dc6df6b-cbb1-4819-b642-00c1a5a9b8fa/id-preview-b6585843--7a970793-ab01-490a-9eea-73d77e3cfdc0.lovable.app-1784387856216.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7dc6df6b-cbb1-4819-b642-00c1a5a9b8fa/id-preview-b6585843--7a970793-ab01-490a-9eea-73d77e3cfdc0.lovable.app-1784387856216.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }) {
  return (
    _jsxDEV('html', { lang: "en", children: [
      _jsxDEV('head', { children: 
        _jsxDEV(HeadContent, {}, void 0, false, {fileName: _jsxFileName, lineNumber: 107}, this )
      }, void 0, false, {fileName: _jsxFileName, lineNumber: 106}, this)
      , _jsxDEV('body', { children: [
        children
        , _jsxDEV(Scripts, {}, void 0, false, {fileName: _jsxFileName, lineNumber: 111}, this )
      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 109}, this)
    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 105}, this)
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    _jsxDEV(QueryClientProvider, { client: queryClient, children: [
      _jsxDEV(Outlet, {}, void 0, false, {fileName: _jsxFileName, lineNumber: 121}, this )
      , _jsxDEV(Toaster, { position: "top-right", richColors: true,}, void 0, false, {fileName: _jsxFileName, lineNumber: 122}, this )
    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 120}, this)
  );
}
