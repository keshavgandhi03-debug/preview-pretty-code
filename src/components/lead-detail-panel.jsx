const _jsxFileName = "";import {jsxDEV as _jsxDEV} from "@/lib/jsx-dev-shim"; function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/status-badge";
import { LEVEL1_STATUSES, LEVEL2_STATUSES, sampleTimeline, } from "@/lib/crm-data";
import {
  Phone, MessageSquare, Mail, MessageCircle, Mic, MicOff, PauseCircle,
  PhoneForwarded, Timer, User, GraduationCap, MapPin, Sparkles,
  FileText, Award, DollarSign, BookOpen, Link2, ClipboardCheck, PhoneCall,
  ChevronRight, X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";







export function LeadDetailPanel({ lead, onClose, onSaveAndNext }) {
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

  if (!lead) {
    return (
      _jsxDEV('div', { className: "h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground"       , children: [
        _jsxDEV('div', { className: "h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3"       , children: 
          _jsxDEV(User, { className: "h-6 w-6" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 45}, this )
        }, void 0, false, {fileName: _jsxFileName, lineNumber: 44}, this)
        , _jsxDEV('div', { className: "text-sm font-medium text-foreground"  , children: "No lead selected"  }, void 0, false, {fileName: _jsxFileName, lineNumber: 47}, this)
        , _jsxDEV('div', { className: "text-xs mt-1 max-w-[240px]"  , children: "Click any row in the lead table to open its details, calling controls, and status workflow here."                }, void 0, false, {fileName: _jsxFileName, lineNumber: 48}, this)
      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 43}, this)
    );
  }

  const mm = String(Math.floor(callSeconds / 60)).padStart(2, "0");
  const ss = String(callSeconds % 60).padStart(2, "0");
  const showInterested = status === "Interested" || status === "Warm";
  const showFollowup = status === "Follow-up" || status === "Call Back Evening" || status === "Call Back Tomorrow";
  const showWrong = status === "Wrong Number";
  const showNotConnected = status === "Not Connected" || status === "Busy" || status === "Switched Off";

  return (
    _jsxDEV('div', { className: "h-full flex flex-col bg-background"   , children: [
      /* Header */
      _jsxDEV('div', { className: "p-4 border-b border-border bg-card space-y-3"    , children: [
        _jsxDEV('div', { className: "flex items-start justify-between gap-3"   , children: [
          _jsxDEV('div', { className: "flex items-center gap-3 min-w-0"   , children: [
            _jsxDEV('div', { className: "h-10 w-10 rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center font-semibold shrink-0 text-sm"            , children: 
              lead.name.split(" ").map((s) => s[0]).slice(0, 2).join("")
            }, void 0, false, {fileName: _jsxFileName, lineNumber: 66}, this)
            , _jsxDEV('div', { className: "min-w-0", children: [
              _jsxDEV('div', { className: "text-sm font-semibold truncate"  , children: lead.name}, void 0, false, {fileName: _jsxFileName, lineNumber: 70}, this)
              , _jsxDEV('div', { className: "text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5"     , children: [
                _jsxDEV('span', { className: "font-mono", children: lead.cwid}, void 0, false, {fileName: _jsxFileName, lineNumber: 72}, this)
                , _jsxDEV('span', { children: "·"}, void 0, false, {fileName: _jsxFileName, lineNumber: 73}, this)
                , _jsxDEV('span', { children: lead.mobile}, void 0, false, {fileName: _jsxFileName, lineNumber: 74}, this)
              ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 71}, this)
            ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 69}, this)
          ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 65}, this)
          , _jsxDEV('div', { className: "flex items-center gap-1.5"  , children: [
            _jsxDEV(StatusBadge, { status: _nullishCoalesce(status, () => ( lead.status)),}, void 0, false, {fileName: _jsxFileName, lineNumber: 79}, this )
            , onClose && (
              _jsxDEV('button', { onClick: onClose, className: "p-1 rounded hover:bg-muted text-muted-foreground"   , 'aria-label': "Close", children: 
                _jsxDEV(X, { className: "h-4 w-4" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 82}, this )
              }, void 0, false, {fileName: _jsxFileName, lineNumber: 81}, this)
            )
          ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 78}, this)
        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 64}, this)

        /* Action bar */
        , _jsxDEV('div', { className: "grid grid-cols-4 gap-1.5"  , children: [
          _jsxDEV(Button, {
            size: "sm",
            onClick: () => { setCallActive(true); toast.success("Dialing " + lead.mobile); },
            className: "bg-[color:var(--success)] hover:bg-[color:var(--success)]/90 text-white gap-1.5 h-8"    ,
 children: [
            _jsxDEV(Phone, { className: "h-3.5 w-3.5" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 95}, this ), " Call"
          ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 90}, this)
          , _jsxDEV(Button, { size: "sm", variant: "secondary", onClick: () => toast.success("WhatsApp opened"), className: "gap-1.5 h-8" , children: [
            _jsxDEV(MessageCircle, { className: "h-3.5 w-3.5" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 98}, this ), " WA"
          ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 97}, this)
          , _jsxDEV(Button, { size: "sm", variant: "secondary", onClick: () => toast.success("Email composer opened"), className: "gap-1.5 h-8" , children: [
            _jsxDEV(Mail, { className: "h-3.5 w-3.5" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 101}, this ), " Email"
          ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 100}, this)
          , _jsxDEV(Button, { size: "sm", variant: "secondary", onClick: () => toast.success("SMS drafted"), className: "gap-1.5 h-8" , children: [
            _jsxDEV(MessageSquare, { className: "h-3.5 w-3.5" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 104}, this ), " SMS"
          ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 103}, this)
        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 89}, this)

        , callActive && (
          _jsxDEV('div', { className: "rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2.5 flex items-center gap-2"       , children: [
            _jsxDEV('div', { className: "h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white animate-pulse"        , children: 
              _jsxDEV(PhoneCall, { className: "h-3.5 w-3.5" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 111}, this )
            }, void 0, false, {fileName: _jsxFileName, lineNumber: 110}, this)
            , _jsxDEV('div', { className: "flex-1 min-w-0" , children: [
              _jsxDEV('div', { className: "text-xs font-medium" , children: ["On call · "   , lead.name]}, void 0, true, {fileName: _jsxFileName, lineNumber: 114}, this)
              , _jsxDEV('div', { className: "text-[11px] text-muted-foreground flex items-center gap-1"    , children: [_jsxDEV(Timer, { className: "h-3 w-3" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 115}, this ), " " , mm, ":", ss]}, void 0, true, {fileName: _jsxFileName, lineNumber: 115}, this)
            ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 113}, this)
            , _jsxDEV('button', { onClick: () => setMuted((m) => !m), className: cn("p-1.5 rounded hover:bg-muted", muted && "bg-muted"), children: 
              muted ? _jsxDEV(MicOff, { className: "h-3.5 w-3.5" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 118}, this ) : _jsxDEV(Mic, { className: "h-3.5 w-3.5" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 118}, this )
            }, void 0, false, {fileName: _jsxFileName, lineNumber: 117}, this)
            , _jsxDEV('button', { onClick: () => setHolding((h) => !h), className: cn("p-1.5 rounded hover:bg-muted", holding && "bg-muted"), children: 
              _jsxDEV(PauseCircle, { className: "h-3.5 w-3.5" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 121}, this )
            }, void 0, false, {fileName: _jsxFileName, lineNumber: 120}, this)
            , _jsxDEV('button', { className: "p-1.5 rounded hover:bg-muted"  , children: 
              _jsxDEV(PhoneForwarded, { className: "h-3.5 w-3.5" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 124}, this )
            }, void 0, false, {fileName: _jsxFileName, lineNumber: 123}, this)
            , _jsxDEV(Button, { size: "sm", variant: "destructive", className: "h-7 px-2 text-xs"  , onClick: () => { setCallActive(false); toast("Call ended", { description: `Duration ${mm}:${ss}` }); }, children: "End"

            }, void 0, false, {fileName: _jsxFileName, lineNumber: 126}, this)
          ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 109}, this)
        )
      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 63}, this)

      /* Body */
      , _jsxDEV('div', { className: "flex-1 overflow-y-auto scrollbar-thin min-h-0"   , children: 
        _jsxDEV(Tabs, { defaultValue: "overview", className: "w-full", children: [
          _jsxDEV('div', { className: "px-4 pt-3 border-b border-border bg-card sticky top-0 z-10"       , children: 
            _jsxDEV(TabsList, { className: "bg-transparent p-0 h-auto gap-4"   , children: 
              ["overview", "activity", "application"].map((t) => (
                _jsxDEV(TabsTrigger, {

                  value: t,
                  className: "px-0 pb-2.5 pt-1 capitalize text-xs font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-muted-foreground"             ,
 children: 
                  t
                }, t, false, {fileName: _jsxFileName, lineNumber: 139}, this)
              ))
            }, void 0, false, {fileName: _jsxFileName, lineNumber: 137}, this)
          }, void 0, false, {fileName: _jsxFileName, lineNumber: 136}, this)

          , _jsxDEV(TabsContent, { value: "overview", className: "p-4 space-y-4 mt-0"  , children: [
            _jsxDEV('section', { className: "rounded-lg border border-border bg-card p-3 space-y-3"     , children: [
              _jsxDEV('div', { className: "flex items-center justify-between"  , children: [
                _jsxDEV('div', { className: "text-xs font-semibold flex items-center gap-2"    , children: [_jsxDEV(Sparkles, { className: "h-3.5 w-3.5 text-primary"  ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 153}, this ), " Update status"  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 153}, this)
                , _jsxDEV('div', { className: "text-[10px] text-muted-foreground" , children: ["Level " , LEVEL2_STATUSES.includes(status ) ? "2 — Application" : "1 — Activation"]}, void 0, true, {fileName: _jsxFileName, lineNumber: 154}, this)
              ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 152}, this)
              , _jsxDEV(Select, { value: status, onValueChange: (v) => { setStatus(v ); toast.success(`Status → ${v}`); }, children: [
                _jsxDEV(SelectTrigger, { className: "h-9", children: _jsxDEV(SelectValue, { placeholder: "Select status" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 157}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 157}, this)
                , _jsxDEV(SelectContent, { className: "max-h-80", children: [
                  _jsxDEV('div', { className: "px-2 py-1 text-[10px] uppercase text-muted-foreground tracking-wider"     , children: "Level 1 — Activation"   }, void 0, false, {fileName: _jsxFileName, lineNumber: 159}, this)
                  , LEVEL1_STATUSES.map((s) => _jsxDEV(SelectItem, { value: s, children: s}, s, false, {fileName: _jsxFileName, lineNumber: 160}, this))
                  , _jsxDEV('div', { className: "px-2 py-1 mt-1 text-[10px] uppercase text-muted-foreground tracking-wider"      , children: "Level 2 — Application"   }, void 0, false, {fileName: _jsxFileName, lineNumber: 161}, this)
                  , LEVEL2_STATUSES.map((s) => _jsxDEV(SelectItem, { value: s, children: s}, s, false, {fileName: _jsxFileName, lineNumber: 162}, this))
                ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 158}, this)
              ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 156}, this)

              , showInterested && (
                _jsxDEV('div', { className: "rounded-lg bg-[color:var(--interested)]/5 border border-[color:var(--interested)]/20 p-3 space-y-2.5"     , children: [
                  _jsxDEV('div', { className: "text-[10px] font-semibold text-[color:var(--interested)] uppercase tracking-wider"    , children: "Interest profile" }, void 0, false, {fileName: _jsxFileName, lineNumber: 168}, this)
                  , _jsxDEV('div', { className: "grid grid-cols-2 gap-2.5"  , children: [
                    _jsxDEV(Field, { label: "Course", children: _jsxDEV(Input, { placeholder: "e.g. B.Tech CSE"  , defaultValue: lead.interestedCourse, className: "h-8 text-xs" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 170}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 170}, this)
                    , _jsxDEV(Field, { label: "Budget", children: _jsxDEV(Input, { placeholder: "₹", className: "h-8 text-xs" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 171}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 171}, this)
                    , _jsxDEV(Field, { label: "Timeline", children: 
                      _jsxDEV(Select, { children: [_jsxDEV(SelectTrigger, { className: "h-8 text-xs" , children: _jsxDEV(SelectValue, { placeholder: "Select",}, void 0, false, {fileName: _jsxFileName, lineNumber: 173}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 173}, this)
                        , _jsxDEV(SelectContent, { children: ["Immediate", "1 month", "3 months", "6 months"].map((s) => _jsxDEV(SelectItem, { value: s, children: s}, s, false, {fileName: _jsxFileName, lineNumber: 174}, this))}, void 0, false, {fileName: _jsxFileName, lineNumber: 174}, this)
                      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 173}, this)
                    }, void 0, false, {fileName: _jsxFileName, lineNumber: 172}, this)
                    , _jsxDEV(Field, { label: "Intake", children: 
                      _jsxDEV(Select, { children: [_jsxDEV(SelectTrigger, { className: "h-8 text-xs" , children: _jsxDEV(SelectValue, { placeholder: "Select",}, void 0, false, {fileName: _jsxFileName, lineNumber: 178}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 178}, this)
                        , _jsxDEV(SelectContent, { children: ["July 2026", "Jan 2027", "July 2027"].map((s) => _jsxDEV(SelectItem, { value: s, children: s}, s, false, {fileName: _jsxFileName, lineNumber: 179}, this))}, void 0, false, {fileName: _jsxFileName, lineNumber: 179}, this)
                      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 178}, this)
                    }, void 0, false, {fileName: _jsxFileName, lineNumber: 177}, this)
                  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 169}, this)
                  , _jsxDEV(Field, { label: "Remarks", children: _jsxDEV(Textarea, { placeholder: "Notes from the call…"   , rows: 2, className: "text-xs",}, void 0, false, {fileName: _jsxFileName, lineNumber: 183}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 183}, this)
                ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 167}, this)
              )

              , showFollowup && (
                _jsxDEV('div', { className: "rounded-lg bg-[color:var(--followup)]/5 border border-[color:var(--followup)]/20 p-3 space-y-2.5"     , children: [
                  _jsxDEV('div', { className: "text-[10px] font-semibold text-[color:var(--followup)] uppercase tracking-wider"    , children: "Schedule follow-up" }, void 0, false, {fileName: _jsxFileName, lineNumber: 189}, this)
                  , _jsxDEV('div', { className: "grid grid-cols-2 gap-2.5"  , children: [
                    _jsxDEV(Field, { label: "Date", children: _jsxDEV(Input, { type: "date", className: "h-8 text-xs" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 191}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 191}, this)
                    , _jsxDEV(Field, { label: "Time", children: _jsxDEV(Input, { type: "time", className: "h-8 text-xs" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 192}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 192}, this)
                    , _jsxDEV(Field, { label: "Reminder", children: 
                      _jsxDEV(Select, { defaultValue: "15m", children: [_jsxDEV(SelectTrigger, { className: "h-8 text-xs" , children: _jsxDEV(SelectValue, {}, void 0, false, {fileName: _jsxFileName, lineNumber: 194}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 194}, this)
                        , _jsxDEV(SelectContent, { children: ["5m", "15m", "30m", "1h", "1d"].map((s) => _jsxDEV(SelectItem, { value: s, children: [s, " before" ]}, s, true, {fileName: _jsxFileName, lineNumber: 195}, this))}, void 0, false, {fileName: _jsxFileName, lineNumber: 195}, this)
                      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 194}, this)
                    }, void 0, false, {fileName: _jsxFileName, lineNumber: 193}, this)
                    , _jsxDEV(Field, { label: "Priority", children: 
                      _jsxDEV(Select, { defaultValue: "Medium", children: [_jsxDEV(SelectTrigger, { className: "h-8 text-xs" , children: _jsxDEV(SelectValue, {}, void 0, false, {fileName: _jsxFileName, lineNumber: 199}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 199}, this)
                        , _jsxDEV(SelectContent, { children: ["High", "Medium", "Low"].map((s) => _jsxDEV(SelectItem, { value: s, children: s}, s, false, {fileName: _jsxFileName, lineNumber: 200}, this))}, void 0, false, {fileName: _jsxFileName, lineNumber: 200}, this)
                      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 199}, this)
                    }, void 0, false, {fileName: _jsxFileName, lineNumber: 198}, this)
                  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 190}, this)
                  , _jsxDEV(Field, { label: "Reason", children: _jsxDEV(Textarea, { placeholder: "Why is a follow-up needed?"    , rows: 2, className: "text-xs",}, void 0, false, {fileName: _jsxFileName, lineNumber: 204}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 204}, this)
                ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 188}, this)
              )

              , showWrong && (
                _jsxDEV('div', { className: "rounded-lg bg-destructive/5 border border-destructive/20 p-3 space-y-2.5"     , children: [
                  _jsxDEV('div', { className: "text-[10px] font-semibold text-destructive uppercase tracking-wider"    , children: "Wrong number" }, void 0, false, {fileName: _jsxFileName, lineNumber: 210}, this)
                  , _jsxDEV(Field, { label: "Alternative number" , children: _jsxDEV(Input, { placeholder: "+91 …" , className: "h-8 text-xs" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 211}, this )}, void 0, false, {fileName: _jsxFileName, lineNumber: 211}, this)
                ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 209}, this)
              )

              , showNotConnected && (
                _jsxDEV('div', { className: "rounded-lg bg-muted/60 border border-border p-3 space-y-2"     , children: [
                  _jsxDEV('div', { className: "text-[10px] font-semibold uppercase tracking-wider"   , children: "Attempt logged" }, void 0, false, {fileName: _jsxFileName, lineNumber: 217}, this)
                  , _jsxDEV('div', { className: "text-[11px] text-muted-foreground" , children: "Auto-scheduled retry in 2 hours."    }, void 0, false, {fileName: _jsxFileName, lineNumber: 218}, this)
                ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 216}, this)
              )
            ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 151}, this)

            , _jsxDEV('section', { className: "rounded-lg border border-border bg-card p-3"    , children: [
              _jsxDEV('div', { className: "text-xs font-semibold mb-2.5 flex items-center gap-2"     , children: [_jsxDEV(User, { className: "h-3.5 w-3.5 text-primary"  ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 224}, this ), " Student details"  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 224}, this)
              , _jsxDEV('div', { className: "grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs"    , children: [
                _jsxDEV(InfoRow, { label: "Email", value: _jsxDEV('span', { className: "truncate", children: lead.email}, void 0, false, {fileName: _jsxFileName, lineNumber: 226}, this),}, void 0, false, {fileName: _jsxFileName, lineNumber: 226}, this )
                , _jsxDEV(InfoRow, { label: "Alt. Mobile" , value: _nullishCoalesce(lead.altMobile, () => ( "—")),}, void 0, false, {fileName: _jsxFileName, lineNumber: 227}, this )
                , _jsxDEV(InfoRow, { label: "Parent", value: _nullishCoalesce(lead.parentContact, () => ( "—")),}, void 0, false, {fileName: _jsxFileName, lineNumber: 228}, this )
                , _jsxDEV(InfoRow, { label: "Qualification", value: lead.qualification, icon: GraduationCap,}, void 0, false, {fileName: _jsxFileName, lineNumber: 229}, this )
                , _jsxDEV(InfoRow, { label: "City", value: `${lead.city}, ${lead.state}`, icon: MapPin,}, void 0, false, {fileName: _jsxFileName, lineNumber: 230}, this )
                , _jsxDEV(InfoRow, { label: "Course", value: lead.interestedCourse,}, void 0, false, {fileName: _jsxFileName, lineNumber: 231}, this )
                , _jsxDEV(InfoRow, { label: "Source", value: lead.source,}, void 0, false, {fileName: _jsxFileName, lineNumber: 232}, this )
                , _jsxDEV(InfoRow, { label: "Campaign", value: lead.campaign,}, void 0, false, {fileName: _jsxFileName, lineNumber: 233}, this )
              ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 225}, this)
            ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 223}, this)

            , _jsxDEV('section', { className: "rounded-lg border border-border bg-card p-3"    , children: [
              _jsxDEV('div', { className: "text-xs font-semibold mb-2.5 flex items-center gap-2"     , children: [_jsxDEV(FileText, { className: "h-3.5 w-3.5 text-primary"  ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 238}, this ), " Quick send"  ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 238}, this)
              , _jsxDEV('div', { className: "grid grid-cols-2 gap-1.5"  , children: 
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
                    className: "flex items-center gap-2 rounded-md border border-border bg-background hover:border-primary hover:bg-primary/5 px-2 py-1.5 text-left transition-colors"            ,
 children: [
                    _jsxDEV(t.icon, { className: "h-3.5 w-3.5 text-primary shrink-0"   ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 253}, this )
                    , _jsxDEV('div', { className: "min-w-0", children: [
                      _jsxDEV('div', { className: "text-[11px] font-medium truncate"  , children: t.label}, void 0, false, {fileName: _jsxFileName, lineNumber: 255}, this)
                      , _jsxDEV('div', { className: "text-[9px] text-muted-foreground" , children: ["via " , t.channel]}, void 0, true, {fileName: _jsxFileName, lineNumber: 256}, this)
                    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 254}, this)
                  ]}, t.label, true, {fileName: _jsxFileName, lineNumber: 248}, this)
                ))
              }, void 0, false, {fileName: _jsxFileName, lineNumber: 239}, this)
            ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 237}, this)
          ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 150}, this)

          , _jsxDEV(TabsContent, { value: "activity", className: "p-4 mt-0" , children: 
            _jsxDEV('div', { className: "rounded-lg border border-border bg-card p-3"    , children: [
              _jsxDEV('div', { className: "text-xs font-semibold mb-3"  , children: "Activity timeline" }, void 0, false, {fileName: _jsxFileName, lineNumber: 266}, this)
              , _jsxDEV('ol', { className: "relative border-l border-border ml-2 space-y-3"    , children: 
                timeline.map((e) => (
                  _jsxDEV('li', { className: "ml-4", children: [
                    _jsxDEV('span', { className: "absolute -left-[7px] flex h-3 w-3 items-center justify-center rounded-full bg-primary/15 ring-4 ring-card"          , children: 
                      _jsxDEV('span', { className: "h-1 w-1 rounded-full bg-primary"   ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 271}, this )
                    }, void 0, false, {fileName: _jsxFileName, lineNumber: 270}, this)
                    , _jsxDEV('div', { className: "flex items-baseline gap-2"  , children: [
                      _jsxDEV('div', { className: "text-xs font-medium" , children: e.title}, void 0, false, {fileName: _jsxFileName, lineNumber: 274}, this)
                      , _jsxDEV('div', { className: "text-[10px] text-muted-foreground" , children: e.time}, void 0, false, {fileName: _jsxFileName, lineNumber: 275}, this)
                    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 273}, this)
                    , e.detail && _jsxDEV('div', { className: "text-[11px] text-muted-foreground" , children: e.detail}, void 0, false, {fileName: _jsxFileName, lineNumber: 277}, this)
                  ]}, e.id, true, {fileName: _jsxFileName, lineNumber: 269}, this)
                ))
              }, void 0, false, {fileName: _jsxFileName, lineNumber: 267}, this)
            ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 265}, this)
          }, void 0, false, {fileName: _jsxFileName, lineNumber: 264}, this)

          , _jsxDEV(TabsContent, { value: "application", className: "p-4 mt-0" , children: 
            _jsxDEV('div', { className: "rounded-lg border border-border bg-card p-3"    , children: [
              _jsxDEV('div', { className: "text-xs font-semibold mb-3"  , children: "Application tracking" }, void 0, false, {fileName: _jsxFileName, lineNumber: 286}, this)
              , _jsxDEV('ol', { className: "space-y-2.5", children: 
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
                      "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-semibold border",
                      s.done ? "bg-[color:var(--success)] text-white border-[color:var(--success)]" : "bg-muted text-muted-foreground border-border",
                    ), children: 
                      s.done ? "✓" : i + 1
                    }, void 0, false, {fileName: _jsxFileName, lineNumber: 298}, this)
                    , _jsxDEV('div', { className: cn("text-xs", s.done ? "text-foreground" : "text-muted-foreground"), children: s.step}, void 0, false, {fileName: _jsxFileName, lineNumber: 304}, this)
                  ]}, s.step, true, {fileName: _jsxFileName, lineNumber: 297}, this)
                ))
              }, void 0, false, {fileName: _jsxFileName, lineNumber: 287}, this)
            ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 285}, this)
          }, void 0, false, {fileName: _jsxFileName, lineNumber: 284}, this)
        ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 135}, this)
      }, void 0, false, {fileName: _jsxFileName, lineNumber: 134}, this)

      /* Footer */
      , _jsxDEV('div', { className: "border-t border-border bg-card p-2.5 flex items-center justify-between gap-2"       , children: [
        _jsxDEV(Button, { variant: "outline", size: "sm", onClick: () => toast.success("Lead saved"), className: "h-8 text-xs" , children: "Save changes" }, void 0, false, {fileName: _jsxFileName, lineNumber: 315}, this)
        , onSaveAndNext && (
          _jsxDEV(Button, { size: "sm", onClick: () => { toast.success("Saved · loading next lead"); onSaveAndNext(); }, className: "gap-1 h-8 text-xs"  , children: ["Save & Next "
               , _jsxDEV(ChevronRight, { className: "h-3.5 w-3.5" ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 318}, this )
          ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 317}, this)
        )
      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 314}, this)
    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 61}, this)
  );
}

function Field({ label, children }) {
  return (
    _jsxDEV('div', { className: "space-y-1", children: [
      _jsxDEV(Label, { className: "text-[10px] text-muted-foreground font-medium uppercase tracking-wider"    , children: label}, void 0, false, {fileName: _jsxFileName, lineNumber: 329}, this)
      , children
    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 328}, this)
  );
}

function InfoRow({ label, value, icon: Icon }) {
  return (
    _jsxDEV('div', { className: "min-w-0", children: [
      _jsxDEV('div', { className: "text-[10px] text-muted-foreground uppercase tracking-wider"   , children: label}, void 0, false, {fileName: _jsxFileName, lineNumber: 338}, this)
      , _jsxDEV('div', { className: "text-xs font-medium mt-0.5 flex items-center gap-1.5 min-w-0"      , children: [
        Icon && _jsxDEV(Icon, { className: "h-3 w-3 text-muted-foreground shrink-0"   ,}, void 0, false, {fileName: _jsxFileName, lineNumber: 340}, this )
        , _jsxDEV('span', { className: "truncate", children: value}, void 0, false, {fileName: _jsxFileName, lineNumber: 341}, this)
      ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 339}, this)
    ]}, void 0, true, {fileName: _jsxFileName, lineNumber: 337}, this)
  );
}
