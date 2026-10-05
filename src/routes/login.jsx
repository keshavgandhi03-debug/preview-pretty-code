import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  authenticate,
  register,
  useSession,
  DEFAULT_EMAIL,
  INVALID_CREDENTIALS_MESSAGE,
} from "@/lib/auth";
import logoUrl from "@/assets/walrus-logo.png";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Walrus Counsellor Panel" },
      { name: "description", content: "Sign in to the Walrus counsellor panel to manage campaigns, leads and follow-ups." },
      { property: "og:title", content: "Sign in — Walrus Counsellor Panel" },
      { property: "og:description", content: "Sign in to the Walrus counsellor panel to manage campaigns, leads and follow-ups." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { ready, user } = useSession();
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | success

  useEffect(() => {
    if (ready && user && status === "idle") navigate({ to: "/", replace: true });
  }, [ready, user, status, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!email.trim()) errs.email = "Email is required.";
    if (!password) errs.password = "Password is required.";
    if (creating && !name.trim()) errs.name = "Name is required.";
    setFieldErrors(errs);
    setError("");
    if (Object.keys(errs).length) return;

    setStatus("loading");
    try {
      if (creating) {
        const result = await register({ email, password, name });
        if (result.needsConfirmation) { setStatus('confirmation'); return; }
      } else {
        await authenticate({ email, password });
      }
      setStatus("success");
      setTimeout(() => navigate({ to: "/", replace: true }), 700);
    } catch (err) {
      setStatus("idle");
      setError(!creating && err?.message?.toLowerCase().includes('invalid login credentials')
        ? `${INVALID_CREDENTIALS_MESSAGE} The previous demo account was not transferred. If you used it, create an account with a new, stronger password first.`
        : err?.message || INVALID_CREDENTIALS_MESSAGE);
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#f4f5f7] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[420px]">
        <div className="rounded-2xl border border-[#e5e7eb] bg-white px-6 py-8 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_rgba(16,24,40,0.06)] sm:px-8 sm:py-10">
          <div className="flex justify-center">
            <img src={logoUrl} alt="Walrus" className="h-20 w-auto" />
          </div>

          <h1 className="mt-7 text-center text-xl font-semibold tracking-tight text-[#111827] sm:text-[22px]">
            {creating ? 'Create your account' : 'Sign in to your account'}
          </h1>

          {creating ? <p className="mt-3 text-center text-sm text-muted-foreground">Previous demo accounts were not transferred. Use your work email and a new, stronger password. You’ll need to confirm your email before signing in.</p> : null}

          {status === "confirmation" ? <div role="status" className="mt-6 rounded-lg border border-border bg-muted px-3 py-2.5 text-sm">Check your email to confirm your account, then sign in.</div> : null}
          {status === "success" ? (
            <div
              role="status"
              className="mt-6 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              Signed in successfully. Taking you to your dashboard…
            </div>
          ) : null}

          <form className="mt-7 space-y-5" onSubmit={onSubmit} noValidate>
            {creating && <div className="space-y-1.5"><Label htmlFor="name">Name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />{fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}</div>}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px] font-medium text-[#374151]">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                required
                className="h-11 rounded-lg border-[#d1d5db] bg-white text-sm text-[#111827] focus-visible:ring-2 focus-visible:ring-[#2563eb]/40 focus-visible:border-[#2563eb]"
              />
              {fieldErrors.email ? (
                <p id="email-error" className="text-xs font-medium text-destructive">
                  {fieldErrors.email}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[13px] font-medium text-[#374151]">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                  required
                  className="h-11 rounded-lg border-[#d1d5db] bg-white pr-11 text-sm text-[#111827] focus-visible:ring-2 focus-visible:ring-[#2563eb]/40 focus-visible:border-[#2563eb]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-[#6b7280] transition-colors hover:text-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/50"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password ? (
                <p id="password-error" className="text-xs font-medium text-destructive">
                  {fieldErrors.password}
                </p>
              ) : null}
            </div>

            {error ? (
              <p role="alert" className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm font-medium text-destructive">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={status !== "idle"}
              className="h-11 w-full rounded-lg bg-[#2563eb] text-sm font-semibold text-white hover:bg-[#1d4ed8] focus-visible:ring-2 focus-visible:ring-[#2563eb]/50 focus-visible:ring-offset-2"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Signing in…
                </>
              ) : (
                creating ? "Create account" : "Sign In"
              )}
            </Button>
          </form>
          <Button type="button" variant="link" className="mt-4 w-full" onClick={() => { setCreating((value) => !value); setStatus('idle'); setError(''); }}>{creating ? 'Already have an account? Sign in' : 'New staff member? Create an account'}</Button>
        </div>
      </div>
    </main>
  );
}
