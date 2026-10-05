const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "@/lib/jsx-dev-shim"; function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/status-badge";
import { LEVEL1_STATUSES, LEVEL2_STATUSES, sampleTimeline, } from "@/lib/crm-data";
import {
  Phone, MessageSquare, Mail, MessageCircle, Calendar, Mic, MicOff, PauseCircle,
  PhoneForwarded, Circle, Timer, User, GraduationCap, MapPin, Sparkles,
  FileText, Award, DollarSign, BookOpen, Link2, ClipboardCheck, PhoneCall,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function LeadDrawer({ lead, open, onOpenChange }



) {
  const [status, setStatus] = useState(_optionalChain([lead, 'optionalAccess', _ => _.status]));
  const [callActive, setCallActive] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [holding, setHolding] = useState(false);

  useEffect(() => { setStatus(_optionalChain([lead, 'optionalAccess', _2 => _2.status])); setCallActive(false); setCallSeconds(0); }, [_optionalChain([lead, 'optionalAccess', _3 => _3.id])]);
  useEffect(() => {
    if (!callActive) return;
    const t = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [callActive]);

  const timeline = useMemo(() => (lead ? sampleTimeline(lead.id) : []), [_optionalChain([lead, 'optionalAccess', _4 => _4.id])]);

  if (!lead) return null;

  const mm = String(Math.floor(callSeconds / 60)).padStart(2, "0");
  const ss = String(callSeconds % 60).padStart(2, "0");

  const showInterested = status === "Interested" || status === "Warm";
  const showFollowup = status === "Follow-up" || status === "Call Back Evening" || status === "Call Back Tomorrow";
  const showWrong = status === "Wrong Number";
  const showNotConnected = status === "Not Connected" || status === "Busy" || status === "Switched Off";

  return (
    _jsxDEV(Sheet, { open: open, onOpenChange: onOpenChange, children: 
      _jsxDEV(SheetContent, { side: "right", className: "w-full sm:max-w-2xl p-0 flex flex-col gap-0 bg-background"      , children: [
        /* Header */
        _jsxDEV(SheetHeader, { className: "p-5 border-b border-border bg-card space-y-3"    , children: [
          _jsxDEV('div', { className: "flex items-start justify-between gap-4"   , children: [
            _jsxDEV('div', { className: "flex items-center gap-3 min-w-0"   , children: [
              _jsxDEV('div', { className: "h-11 w-11 rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center font-semibold shrink-0"           , children: 
                lead.name.split(" ").map((s) => s[0]).slice(0, 2).join("")
              }, void 0, false, {fileName: _jsxFileName, lineNumber: 56}, this)
              , _jsxDEV('div', { className: "min-w-0", children: [
                _jsxDEV(SheetTitle, { className: "text-base truncate" , children: lead.name}, void 0, false, {fileName: _jsxFileName, lineNumber: 60}, this)
                , _jsxDEV('div', { className: "text-xs text-muted-foreground flex items-center gap-2 mt-0.5"     , children: [
                  _jsxDEV('span', { className: "font-mono", children: lead.cwid}, void 0, false, {fileName: _jsxFileName, lineNumber: 62}, this)
                  , _jsxDEV('span', { children: "·"}, void 0, false, {fileName: _jsxFileName, lineNumber: 63}, this)
                  , _jsxDEV('span', { children: lead.mobile}, void 0, false, {fileName: _jsxFileName, lineNumber: 64}, this)
                ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 61}, this)
              ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 59}, this)
            ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 55}, this)
            , _jsxDEV(StatusBadge, { status: _nullishCoalesce(status, () => ( lead.status)),}, void 0, false, {fileName: _jsxFileName, lineNumber: 68}, this )
          ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 54}, this)

          /* Sticky action bar */
          , _jsxDEV('div', { className: "flex items-center gap-2"  , children: [
            _jsxDEV(Button, {
              size: "sm",
              onClick: () => { setCallActive(true); toast.success("Dialing " + lead.mobile); },
              className: "flex-1 bg-[color:var(--success)] hover:bg-[color:var(--success)]/90 text-white gap-2"    ,
 children: [
              _jsxDEV(Phone, { className: "h-4 w-4" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 78}, this ), " Call"
            ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 73}, this)
            , _jsxDEV(Button, { size: "sm", variant: "secondary", onClick: () => toast.success("WhatsApp opened"), className: "gap-2", children: [
              _jsxDEV(MessageCircle, { className: "h-4 w-4" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 81}, this ), " WhatsApp"
            ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 80}, this)
            , _jsxDEV(Button, { size: "sm", variant: "secondary", onClick: () => toast.success("Email composer opened"), className: "gap-2", children: [
              _jsxDEV(Mail, { className: "h-4 w-4" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 84}, this ), " Email"
            ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 83}, this)
            , _jsxDEV(Button, { size: "sm", variant: "secondary", onClick: () => toast.success("SMS drafted"), className: "gap-2", children: [
              _jsxDEV(MessageSquare, { className: "h-4 w-4" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 87}, this ), " SMS"
            ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 86}, this)
          ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 72}, this)

          /* Live call panel */
          , callActive && (
            _jsxDEV('div', { className: "rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 flex items-center gap-3"       , children: [
              _jsxDEV('div', { className: "relative", children: 
                _jsxDEV('div', { className: "h-9 w-9 rounded-full bg-emerald-500 flex items-center justify-center text-white animate-pulse"        , children: 
                  _jsxDEV(PhoneCall, { className: "h-4 w-4" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 96}, this )
                }, void 0, false, {fileName: _jsxFileName, lineNumber: 95}, this)
              }, void 0, false, {fileName: _jsxFileName, lineNumber: 94}, this)
              , _jsxDEV('div', { className: "flex-1 min-w-0" , children: [
                _jsxDEV('div', { className: "text-sm font-medium" , children: ["On call · "   , lead.name]}, void 0, true, {fileName: _jsxFileName, lineNumber: 100}, this)
                , _jsxDEV('div', { className: "text-xs text-muted-foreground flex items-center gap-1"    , children: [_jsxDEV(Timer, { className: "h-3 w-3" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 101}, this ), " " , mm, ":", ss]}, void 0, true, {fileName: _jsxFileName, lineNumber: 101}, this)
              ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 99}, this)
              , _jsxDEV('button', { onClick: () => setMuted((m) => !m), className: cn("p-2 rounded-md hover:bg-muted", muted && "bg-muted"), children: 
                muted ? _jsxDEV(MicOff, { className: "h-4 w-4" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 104}, this ) : _jsxDEV(Mic, { className: "h-4 w-4" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 104}, this )
              }, void 0, false, {fileName: _jsxFileName, lineNumber: 103}, this)
              , _jsxDEV('button', { onClick: () => setHolding((h) => !h), className: cn("p-2 rounded-md hover:bg-muted", holding && "bg-muted"), children: 
                _jsxDEV(PauseCircle, { className: "h-4 w-4" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 107}, this )
              }, void 0, false, {fileName: _jsxFileName, lineNumber: 106}, this)
              , _jsxDEV('button', { className: "p-2 rounded-md hover:bg-muted"  , children: 
                _jsxDEV(PhoneForwarded, { className: "h-4 w-4" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 110}, this )
              }, void 0, false, {fileName: _jsxFileName, lineNumber: 109}, this)
              , _jsxDEV('button', { className: "p-2 rounded-md hover:bg-muted"  , children: 
                _jsxDEV(Circle, { className: "h-4 w-4 text-destructive fill-destructive"   ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 113}, this )
              }, void 0, false, {fileName: _jsxFileName, lineNumber: 112}, this)
              , _jsxDEV(Button, { size: "sm", variant: "destructive", onClick: () => { setCallActive(false); toast("Call ended", { description: `Duration ${mm}:${ss}` }); }, children: "End"

              }, void 0, false, {fileName: _jsxFileName, lineNumber: 115}, this)
            ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 93}, this)
          )
        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 53}, this)

        /* Body */
        , _jsxDEV('div', { className: "flex-1 overflow-y-auto scrollbar-thin"  , children: 
          _jsxDEV(Tabs, { defaultValue: "overview", className: "w-full", children: [
            _jsxDEV('div', { className: "px-5 pt-4 border-b border-border bg-card"    , children: 
              _jsxDEV(TabsList, { className: "bg-transparent p-0 h-auto gap-4"   , children: 
                ["overview", "activity", "application"].map((t) => (
                  _jsxDEV(TabsTrigger, {

                    value: t,
                    className: "px-0 pb-3 pt-1 capitalize text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-muted-foreground"             ,
 children: 
                    t === "application" ? "Application" : t
                  }, t, false, {fileName: _jsxFileName, lineNumber: 128}, this)
                ))
              }, void 0, false, {fileName: _jsxFileName, lineNumber: 126}, this)
            }, void 0, false, {fileName: _jsxFileName, lineNumber: 125}, this)

            , _jsxDEV(TabsContent, { value: "overview", className: "p-5 space-y-5 mt-0"  , children: [
              /* Status */
              _jsxDEV('section', { className: "rounded-xl border border-border bg-card p-4 space-y-3"     , children: [
                _jsxDEV('div', { className: "flex items-center justify-between"  , children: [
                  _jsxDEV('div', { className: "text-sm font-semibold flex items-center gap-2"    , children: [_jsxDEV(Sparkles, { className: "h-4 w-4 text-primary"  ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 143}, this ), " Update lead status"   ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 143}, this)
                  , _jsxDEV('div', { className: "text-xs text-muted-foreground" , children: ["Level " , LEVEL2_STATUSES.includes(status ) ? "2 — Application" : "1 — Activation"]}, void 0, true, {fileName: _jsxFileName, lineNumber: 144}, this)
                ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 142}, this)
                , _jsxDEV(Select, { value: status, onValueChange: (v) => { setStatus(v ); toast.success(`Status updated → ${v}`); }, children: [
                  _jsxDEV(SelectTrigger, { children: _jsxDEV(SelectValue, { placeholder: "Select status" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 147}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 147}, this)
                  , _jsxDEV(SelectContent, { className: "max-h-80", children: [
                    _jsxDEV('div', { className: "px-2 py-1 text-[10px] uppercase text-muted-foreground tracking-wider"     , children: "Level 1 — Activation"   }, void 0, false, {fileName: _jsxFileName, lineNumber: 149}, this)
                    , LEVEL1_STATUSES.map((s) => _jsxDEV(SelectItem, { value: s, children: s}, s, false, {fileName: _jsxFileName, lineNumber: 150}, this))
                    , _jsxDEV('div', { className: "px-2 py-1 mt-1 text-[10px] uppercase text-muted-foreground tracking-wider"      , children: "Level 2 — Application"   }, void 0, false, {fileName: _jsxFileName, lineNumber: 151}, this)
                    , LEVEL2_STATUSES.map((s) => _jsxDEV(SelectItem, { value: s, children: s}, s, false, {fileName: _jsxFileName, lineNumber: 152}, this))
                  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 148}, this)
                ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 146}, this)

                /* Dynamic forms */
                , showInterested && (
                  _jsxDEV('div', { className: "rounded-lg bg-[color:var(--interested)]/5 border border-[color:var(--interested)]/20 p-3 space-y-3"     , children: [
                    _jsxDEV('div', { className: "text-xs font-semibold text-[color:var(--interested)] uppercase tracking-wider"    , children: "Interest profile" }, void 0, false, {fileName: _jsxFileName, lineNumber: 159}, this)
                    , _jsxDEV('div', { className: "grid grid-cols-2 gap-3"  , children: [
                      _jsxDEV(Field, { label: "Interested in" , children: 
                        _jsxDEV(Select, { defaultValue: "Amity", children: [
                          _jsxDEV(SelectTrigger, { children: _jsxDEV(SelectValue, {}, void 0, false, {fileName: _jsxFileName, lineNumber: 163}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 163}, this)
                          , _jsxDEV(SelectContent, { children: 
                            ["Amity", "LPU", "Chandigarh University", "Graphic Era", "Sharda", "Other"].map((s) => (
                              _jsxDEV(SelectItem, { value: s, children: s}, s, false, {fileName: _jsxFileName, lineNumber: 166}, this)
                            ))
                          }, void 0, false, {fileName: _jsxFileName, lineNumber: 164}, this)
                        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 162}, this)
                      }, void 0, false, {fileName: _jsxFileName, lineNumber: 161}, this)
                      , _jsxDEV(Field, { label: "Course interested" , children: _jsxDEV(Input, { placeholder: "e.g. B.Tech CSE"  , defaultValue: lead.interestedCourse,}, void 0, false, {fileName: _jsxFileName, lineNumber: 171}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 171}, this)
                      , _jsxDEV(Field, { label: "Budget", children: _jsxDEV(Input, { placeholder: "₹",}, void 0, false, {fileName: _jsxFileName, lineNumber: 172}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 172}, this)
                      , _jsxDEV(Field, { label: "Preferred city" , children: _jsxDEV(Input, { placeholder: "City", defaultValue: lead.city,}, void 0, false, {fileName: _jsxFileName, lineNumber: 173}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 173}, this)
                      , _jsxDEV(Field, { label: "Admission timeline" , children: 
                        _jsxDEV(Select, { children: [_jsxDEV(SelectTrigger, { children: _jsxDEV(SelectValue, { placeholder: "Select",}, void 0, false, {fileName: _jsxFileName, lineNumber: 175}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 175}, this)
                          , _jsxDEV(SelectContent, { children: ["Immediate", "1 month", "3 months", "6 months"].map((s) => _jsxDEV(SelectItem, { value: s, children: s}, s, false, {fileName: _jsxFileName, lineNumber: 176}, this))}, void 0, false, {fileName: _jsxFileName, lineNumber: 176}, this)
                        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 175}, this)
                      }, void 0, false, {fileName: _jsxFileName, lineNumber: 174}, this)
                      , _jsxDEV(Field, { label: "Preferred intake" , children: 
                        _jsxDEV(Select, { children: [_jsxDEV(SelectTrigger, { children: _jsxDEV(SelectValue, { placeholder: "Select",}, void 0, false, {fileName: _jsxFileName, lineNumber: 180}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 180}, this)
                          , _jsxDEV(SelectContent, { children: ["July 2026", "Jan 2027", "July 2027"].map((s) => _jsxDEV(SelectItem, { value: s, children: s}, s, false, {fileName: _jsxFileName, lineNumber: 181}, this))}, void 0, false, {fileName: _jsxFileName, lineNumber: 181}, this)
                        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 180}, this)
                      }, void 0, false, {fileName: _jsxFileName, lineNumber: 179}, this)
                      , _jsxDEV(Field, { label: "Scholarship required" , children: 
                        _jsxDEV(Select, { children: [_jsxDEV(SelectTrigger, { children: _jsxDEV(SelectValue, { placeholder: "Yes / No"  ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 185}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 185}, this)
                          , _jsxDEV(SelectContent, { children: [_jsxDEV(SelectItem, { value: "Yes", children: "Yes"}, void 0, false, {fileName: _jsxFileName, lineNumber: 186}, this), _jsxDEV(SelectItem, { value: "No", children: "No"}, void 0, false, {fileName: _jsxFileName, lineNumber: 186}, this)]}, void 0, true, {fileName: _jsxFileName, lineNumber: 186}, this)
                        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 185}, this)
                      }, void 0, false, {fileName: _jsxFileName, lineNumber: 184}, this)
                      , _jsxDEV(Field, { label: "Hostel required" , children: 
                        _jsxDEV(Select, { children: [_jsxDEV(SelectTrigger, { children: _jsxDEV(SelectValue, { placeholder: "Yes / No"  ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 190}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 190}, this)
                          , _jsxDEV(SelectContent, { children: [_jsxDEV(SelectItem, { value: "Yes", children: "Yes"}, void 0, false, {fileName: _jsxFileName, lineNumber: 191}, this), _jsxDEV(SelectItem, { value: "No", children: "No"}, void 0, false, {fileName: _jsxFileName, lineNumber: 191}, this)]}, void 0, true, {fileName: _jsxFileName, lineNumber: 191}, this)
                        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 190}, this)
                      }, void 0, false, {fileName: _jsxFileName, lineNumber: 189}, this)
                    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 160}, this)
                    , _jsxDEV(Field, { label: "Remarks", children: _jsxDEV(Textarea, { placeholder: "Notes from the call…"   , rows: 2,}, void 0, false, {fileName: _jsxFileName, lineNumber: 195}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 195}, this)
                  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 158}, this)
                )

                , showFollowup && (
                  _jsxDEV('div', { className: "rounded-lg bg-[color:var(--followup)]/5 border border-[color:var(--followup)]/20 p-3 space-y-3"     , children: [
                    _jsxDEV('div', { className: "text-xs font-semibold text-[color:var(--followup)] uppercase tracking-wider"    , children: "Schedule follow-up" }, void 0, false, {fileName: _jsxFileName, lineNumber: 201}, this)
                    , _jsxDEV('div', { className: "grid grid-cols-2 gap-3"  , children: [
                      _jsxDEV(Field, { label: "Date", children: _jsxDEV(Input, { type: "date",}, void 0, false, {fileName: _jsxFileName, lineNumber: 203}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 203}, this)
                      , _jsxDEV(Field, { label: "Time", children: _jsxDEV(Input, { type: "time",}, void 0, false, {fileName: _jsxFileName, lineNumber: 204}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 204}, this)
                      , _jsxDEV(Field, { label: "Reminder", children: 
                        _jsxDEV(Select, { defaultValue: "15m", children: [_jsxDEV(SelectTrigger, { children: _jsxDEV(SelectValue, {}, void 0, false, {fileName: _jsxFileName, lineNumber: 206}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 206}, this)
                          , _jsxDEV(SelectContent, { children: ["5m", "15m", "30m", "1h", "1d"].map((s) => _jsxDEV(SelectItem, { value: s, children: [s, " before" ]}, s, true, {fileName: _jsxFileName, lineNumber: 207}, this))}, void 0, false, {fileName: _jsxFileName, lineNumber: 207}, this)
                        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 206}, this)
                      }, void 0, false, {fileName: _jsxFileName, lineNumber: 205}, this)
                      , _jsxDEV(Field, { label: "Priority", children: 
                        _jsxDEV(Select, { defaultValue: "Medium", children: [_jsxDEV(SelectTrigger, { children: _jsxDEV(SelectValue, {}, void 0, false, {fileName: _jsxFileName, lineNumber: 211}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 211}, this)
                          , _jsxDEV(SelectContent, { children: ["High", "Medium", "Low"].map((s) => _jsxDEV(SelectItem, { value: s, children: s}, s, false, {fileName: _jsxFileName, lineNumber: 212}, this))}, void 0, false, {fileName: _jsxFileName, lineNumber: 212}, this)
                        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 211}, this)
                      }, void 0, false, {fileName: _jsxFileName, lineNumber: 210}, this)
                    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 202}, this)
                    , _jsxDEV(Field, { label: "Reason", children: _jsxDEV(Textarea, { placeholder: "Why is a follow-up needed?"    , rows: 2,}, void 0, false, {fileName: _jsxFileName, lineNumber: 216}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 216}, this)
                  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 200}, this)
                )

                , showWrong && (
                  _jsxDEV('div', { className: "rounded-lg bg-destructive/5 border border-destructive/20 p-3 space-y-3"     , children: [
                    _jsxDEV('div', { className: "text-xs font-semibold text-destructive uppercase tracking-wider"    , children: "Wrong number" }, void 0, false, {fileName: _jsxFileName, lineNumber: 222}, this)
                    , _jsxDEV(Field, { label: "Alternative number available?"  , children: 
                      _jsxDEV('div', { className: "flex gap-2" , children: [
                        _jsxDEV(Button, { variant: "outline", size: "sm", children: "Yes"}, void 0, false, {fileName: _jsxFileName, lineNumber: 225}, this)
                        , _jsxDEV(Button, { variant: "outline", size: "sm", children: "No"}, void 0, false, {fileName: _jsxFileName, lineNumber: 226}, this)
                      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 224}, this)
                    }, void 0, false, {fileName: _jsxFileName, lineNumber: 223}, this)
                    , _jsxDEV(Field, { label: "Alternative number" , children: _jsxDEV(Input, { placeholder: "+91 …" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 229}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 229}, this)
                  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 221}, this)
                )

                , showNotConnected && (
                  _jsxDEV('div', { className: "rounded-lg bg-muted/60 border border-border p-3 space-y-3"     , children: [
                    _jsxDEV('div', { className: "text-xs font-semibold uppercase tracking-wider"   , children: "Attempt logged" }, void 0, false, {fileName: _jsxFileName, lineNumber: 235}, this)
                    , _jsxDEV(Field, { label: "Attempt number" , children: 
                      _jsxDEV('div', { className: "flex gap-2" , children: 
                        [1, 2, 3, 4].map((n) => (
                          _jsxDEV('button', { className: cn("h-9 w-9 rounded-md border border-border text-sm font-medium hover:border-primary hover:text-primary", n === 2 && "bg-primary text-primary-foreground border-primary"), children: n}, n, false, {fileName: _jsxFileName, lineNumber: 239}, this)
                        ))
                      }, void 0, false, {fileName: _jsxFileName, lineNumber: 237}, this)
                    }, void 0, false, {fileName: _jsxFileName, lineNumber: 236}, this)
                    , _jsxDEV('div', { className: "text-[11px] text-muted-foreground" , children: "Auto-scheduled retry in 2 hours."    }, void 0, false, {fileName: _jsxFileName, lineNumber: 243}, this)
                  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 234}, this)
                )
              ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 141}, this)

              /* Student details */
              , _jsxDEV('section', { className: "rounded-xl border border-border bg-card p-4"    , children: [
                _jsxDEV('div', { className: "text-sm font-semibold mb-3 flex items-center gap-2"     , children: [_jsxDEV(User, { className: "h-4 w-4 text-primary"  ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 250}, this ), " Student details"  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 250}, this)
                , _jsxDEV('div', { className: "grid grid-cols-2 gap-x-6 gap-y-3 text-sm"    , children: [
                  _jsxDEV(InfoRow, { label: "CWID", value: _jsxDEV('span', { className: "font-mono", children: lead.cwid}, void 0, false, {fileName: _jsxFileName, lineNumber: 252}, this),}, void 0, false, {fileName: _jsxFileName, lineNumber: 252}, this )
                  , _jsxDEV(InfoRow, { label: "Mobile", value: lead.mobile,}, void 0, false, {fileName: _jsxFileName, lineNumber: 253}, this )
                  , _jsxDEV(InfoRow, { label: "Alt. Mobile" , value: _nullishCoalesce(lead.altMobile, () => ( "—")),}, void 0, false, {fileName: _jsxFileName, lineNumber: 254}, this )
                  , _jsxDEV(InfoRow, { label: "Email", value: _jsxDEV('span', { className: "truncate", children: lead.email}, void 0, false, {fileName: _jsxFileName, lineNumber: 255}, this),}, void 0, false, {fileName: _jsxFileName, lineNumber: 255}, this )
                  , _jsxDEV(InfoRow, { label: "Parent", value: _nullishCoalesce(lead.parentContact, () => ( "—")),}, void 0, false, {fileName: _jsxFileName, lineNumber: 256}, this )
                  , _jsxDEV(InfoRow, { label: "Qualification", value: lead.qualification, icon: GraduationCap,}, void 0, false, {fileName: _jsxFileName, lineNumber: 257}, this )
                  , _jsxDEV(InfoRow, { label: "City / State"  , value: `${lead.city}, ${lead.state}`, icon: MapPin,}, void 0, false, {fileName: _jsxFileName, lineNumber: 258}, this )
                  , _jsxDEV(InfoRow, { label: "Master course" , value: lead.masterCourse,}, void 0, false, {fileName: _jsxFileName, lineNumber: 259}, this )
                  , _jsxDEV(InfoRow, { label: "Interested course" , value: lead.interestedCourse,}, void 0, false, {fileName: _jsxFileName, lineNumber: 260}, this )
                  , _jsxDEV(InfoRow, { label: "Source", value: lead.source,}, void 0, false, {fileName: _jsxFileName, lineNumber: 261}, this )
                  , _jsxDEV(InfoRow, { label: "Campaign", value: lead.campaign,}, void 0, false, {fileName: _jsxFileName, lineNumber: 262}, this )
                  , _jsxDEV(InfoRow, { label: "Assigned to" , value: lead.counsellor,}, void 0, false, {fileName: _jsxFileName, lineNumber: 263}, this )
                ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 251}, this)
              ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 249}, this)

              /* Templates */
              , _jsxDEV('section', { className: "rounded-xl border border-border bg-card p-4"    , children: [
                _jsxDEV('div', { className: "text-sm font-semibold mb-3 flex items-center gap-2"     , children: [_jsxDEV(FileText, { className: "h-4 w-4 text-primary"  ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 269}, this ), " Quick send"  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 269}, this)
                , _jsxDEV('div', { className: "grid grid-cols-2 gap-2"  , children: 
                  [
                    { icon: BookOpen, label: "Brochure", channel: "WhatsApp" },
                    { icon: DollarSign, label: "Fee Structure", channel: "WhatsApp" },
                    { icon: Award, label: "Scholarship", channel: "WhatsApp" },
                    { icon: Link2, label: "Application Link", channel: "WhatsApp" },
                    { icon: ClipboardCheck, label: "Application Form", channel: "Email" },
                    { icon: FileText, label: "Admission Guide", channel: "Email" },
                  ].map((t) => (
                    _jsxDEV('button', {

                      onClick: () => toast.success(`${t.label} sent via ${t.channel}`),
                      className: "flex items-center gap-2.5 rounded-lg border border-border bg-background hover:border-primary hover:bg-primary/5 px-3 py-2.5 text-left transition-colors"            ,
 children: [
                      _jsxDEV(t.icon, { className: "h-4 w-4 text-primary shrink-0"   ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 284}, this )
                      , _jsxDEV('div', { className: "min-w-0", children: [
                        _jsxDEV('div', { className: "text-xs font-medium truncate"  , children: t.label}, void 0, false, {fileName: _jsxFileName, lineNumber: 286}, this)
                        , _jsxDEV('div', { className: "text-[10px] text-muted-foreground" , children: ["via " , t.channel]}, void 0, true, {fileName: _jsxFileName, lineNumber: 287}, this)
                      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 285}, this)
                    ]}, t.label, true, {fileName: _jsxFileName, lineNumber: 279}, this)
                  ))
                }, void 0, false, {fileName: _jsxFileName, lineNumber: 270}, this)
              ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 268}, this)
            ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 139}, this)

            , _jsxDEV(TabsContent, { value: "activity", className: "p-5 mt-0" , children: 
              _jsxDEV('div', { className: "rounded-xl border border-border bg-card p-4"    , children: [
                _jsxDEV('div', { className: "text-sm font-semibold mb-4"  , children: "Activity timeline" }, void 0, false, {fileName: _jsxFileName, lineNumber: 297}, this)
                , _jsxDEV('ol', { className: "relative border-l border-border ml-2 space-y-4"    , children: 
                  timeline.map((e) => (
                    _jsxDEV('li', { className: "ml-4", children: [
                      _jsxDEV('span', { className: "absolute -left-[7px] flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary/15 ring-4 ring-background"          , children: 
                        _jsxDEV('span', { className: "h-1.5 w-1.5 rounded-full bg-primary"   ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 302}, this )
                      }, void 0, false, {fileName: _jsxFileName, lineNumber: 301}, this)
                      , _jsxDEV('div', { className: "flex items-baseline gap-2"  , children: [
                        _jsxDEV('div', { className: "text-sm font-medium" , children: e.title}, void 0, false, {fileName: _jsxFileName, lineNumber: 305}, this)
                        , _jsxDEV('div', { className: "text-[11px] text-muted-foreground" , children: e.time}, void 0, false, {fileName: _jsxFileName, lineNumber: 306}, this)
                      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 304}, this)
                      , e.detail && _jsxDEV('div', { className: "text-xs text-muted-foreground" , children: e.detail}, void 0, false, {fileName: _jsxFileName, lineNumber: 308}, this)
                    ]}, e.id, true, {fileName: _jsxFileName, lineNumber: 300}, this)
                  ))
                }, void 0, false, {fileName: _jsxFileName, lineNumber: 298}, this)
              ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 296}, this)
            }, void 0, false, {fileName: _jsxFileName, lineNumber: 295}, this)

            , _jsxDEV(TabsContent, { value: "application", className: "p-5 mt-0" , children: 
              _jsxDEV('div', { className: "rounded-xl border border-border bg-card p-4"    , children: [
                _jsxDEV('div', { className: "text-sm font-semibold mb-3"  , children: "Application tracking" }, void 0, false, {fileName: _jsxFileName, lineNumber: 317}, this)
                , _jsxDEV('ol', { className: "space-y-3", children: 
                  [
                    { step: "Counselling Started", done: true },
                    { step: "Brochure Shared", done: true },
                    { step: "Documents Pending", done: true },
                    { step: "Application Started", done: true },
                    { step: "Application Submitted", done: false },
                    { step: "Payment Pending", done: false },
                    { step: "Admission Confirmed", done: false },
                  ].map((s, i) => (
                    _jsxDEV('li', { className: "flex items-center gap-3"  , children: [
                      _jsxDEV('div', { className: cn(
                        "h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-semibold border",
                        s.done ? "bg-[color:var(--success)] text-white border-[color:var(--success)]" : "bg-muted text-muted-foreground border-border",
                      ), children: 
                        s.done ? "✓" : i + 1
                      }, void 0, false, {fileName: _jsxFileName, lineNumber: 329}, this)
                      , _jsxDEV('div', { className: cn("text-sm", s.done ? "text-foreground" : "text-muted-foreground"), children: s.step}, void 0, false, {fileName: _jsxFileName, lineNumber: 335}, this)
                    ]}, s.step, true, {fileName: _jsxFileName, lineNumber: 328}, this)
                  ))
                }, void 0, false, {fileName: _jsxFileName, lineNumber: 318}, this)
                , _jsxDEV('div', { className: "mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3 text-sm"       , children: [
                  _jsxDEV(InfoRow, { label: "Application ID" , value: _jsxDEV('span', { className: "font-mono", children: "APP-2026-01847"}, void 0, false, {fileName: _jsxFileName, lineNumber: 340}, this),}, void 0, false, {fileName: _jsxFileName, lineNumber: 340}, this )
                  , _jsxDEV(InfoRow, { label: "Fee", value: "₹ 1,25,000" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 341}, this )
                  , _jsxDEV(InfoRow, { label: "Scholarship", value: "₹ 25,000" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 342}, this )
                  , _jsxDEV(InfoRow, { label: "Balance", value: "₹ 1,00,000" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 343}, this )
                ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 339}, this)
              ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 316}, this)
            }, void 0, false, {fileName: _jsxFileName, lineNumber: 315}, this)
          ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 124}, this)
        }, void 0, false, {fileName: _jsxFileName, lineNumber: 123}, this)

        /* Sticky footer actions */
        , _jsxDEV('div', { className: "border-t border-border bg-card p-3 flex items-center justify-between gap-2"       , children: [
          _jsxDEV(Button, { variant: "ghost", size: "sm", onClick: () => toast("Follow-up scheduled"), children: [" " , _jsxDEV(Calendar, { className: "h-4 w-4 mr-1"  ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 352}, this ), " Schedule Follow-up"  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 352}, this)
          , _jsxDEV('div', { className: "flex items-center gap-2"  , children: [
            _jsxDEV(Button, { variant: "outline", size: "sm", onClick: () => onOpenChange(false), children: "Close"}, void 0, false, {fileName: _jsxFileName, lineNumber: 354}, this)
            , _jsxDEV(Button, { size: "sm", onClick: () => { toast.success("Lead saved"); onOpenChange(false); }, children: "Save changes" }, void 0, false, {fileName: _jsxFileName, lineNumber: 355}, this)
          ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 353}, this)
        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 351}, this)
      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 51}, this)
    }, void 0, false, {fileName: _jsxFileName, lineNumber: 50}, this)
  );
}

function Field({ label, children }) {
  return (
    _jsxDEV('div', { className: "space-y-1.5", children: [
      _jsxDEV(Label, { className: "text-[11px] text-muted-foreground font-medium"  , children: label}, void 0, false, {fileName: _jsxFileName, lineNumber: 366}, this)
      , children
    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 365}, this)
  );
}

function InfoRow({ label, value, icon: Icon }) {
  return (
    _jsxDEV('div', { className: "min-w-0", children: [
      _jsxDEV('div', { className: "text-[11px] text-muted-foreground uppercase tracking-wider"   , children: label}, void 0, false, {fileName: _jsxFileName, lineNumber: 375}, this)
      , _jsxDEV('div', { className: "text-sm font-medium mt-0.5 flex items-center gap-1.5 min-w-0"      , children: [
        Icon && _jsxDEV(Icon, { className: "h-3.5 w-3.5 text-muted-foreground shrink-0"   ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 377}, this )
        , _jsxDEV('span', { className: "truncate", children: value}, void 0, false, {fileName: _jsxFileName, lineNumber: 378}, this)
      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 376}, this)
    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 374}, this)
  );
}
