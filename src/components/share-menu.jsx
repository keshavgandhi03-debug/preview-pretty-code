import { useState } from "react";
import { Check, Send, ExternalLink } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RESOURCES, resourceUrl, whatsappHref, mailtoHref } from "@/lib/share-resources";

/** Multi-select share menu: pick one or more real resource pages, then send on WhatsApp or by email. */
export function ShareAction({ icon: Icon, label, channel, lead }) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState([]);

  const toggle = (id) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const send = () => {
    if (!picked.length) return;
    const href = channel === "WhatsApp" ? whatsappHref(lead, picked) : mailtoHref(lead, picked);
    if (typeof window !== "undefined") window.open(href, "_blank", "noopener,noreferrer");
    const names = picked.map((id) => RESOURCES.find((r) => r.id === id)?.label).join(", ");
    toast.success(`${names} sent on ${channel}`);
    setPicked([]);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center justify-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/5 py-2 text-[11px] font-medium text-emerald-700 transition-colors hover:bg-emerald-500/10">
          <Icon className="h-3.5 w-3.5" /> {label}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Share via {channel}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Select one or more — they go out as a single message.
        </p>

        <div className="mt-2 space-y-1">
          {RESOURCES.map((r) => {
            const active = picked.includes(r.id);
            return (
              <div
                key={r.id}
                className={cn(
                  "flex items-start gap-2 rounded-md border p-2 text-left transition-colors",
                  active ? "border-emerald-500 bg-emerald-50" : "border-border hover:bg-muted",
                )}
              >
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(r.id)}
                  className="flex min-w-0 flex-1 items-start gap-2 text-left focus-visible:outline-none"
                >
                  <span
                    className={cn(
                      "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border",
                      active ? "border-emerald-600 bg-emerald-600 text-white" : "border-input",
                    )}
                  >
                    {active ? <Check className="h-3 w-3" /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-medium">{r.label}</span>
                    <span className="block text-[11px] text-muted-foreground">{r.blurb}</span>
                  </span>
                </button>
                <a
                  href={resourceUrl(r.id, lead?.clientId)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Preview ${r.label}`}
                  className="mt-0.5 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            );
          })}
        </div>

        <Button size="sm" className="mt-3 h-8 w-full gap-1.5 text-xs" disabled={!picked.length} onClick={send}>
          <Send className="h-3.5 w-3.5" />
          Send {picked.length ? `${picked.length} item${picked.length > 1 ? "s" : ""}` : ""} on {channel}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
