import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';

export const ANSWER_TYPES = ['Single Select', 'Multiple Select', 'Dropdown', 'Text Answer', 'Number', 'Date'];
export const choiceType = (type) => ANSWER_TYPES.slice(0, 3).includes(type);
const field = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';
export const newQuestion = () => ({ id: crypto.randomUUID(), text: '', type: 'Single Select', options: ['Yes', 'No'], mandatory: true, condition: null, indicators: {}, triggers: {} });

export function QuestionBuilder({ questions, onChange, preview = false }) {
  const update = (id, patch) => onChange(questions.map((q) => q.id === id ? { ...q, ...patch } : q));
  const move = (index, offset) => { const next = [...questions]; [next[index], next[index + offset]] = [next[index + offset], next[index]]; onChange(next); };
  return <div className="space-y-3">
    {questions.map((q, index) => <section key={q.id} className="rounded-md border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2"><span className="text-xs font-semibold text-muted-foreground">Question {index + 1}</span><div className="flex gap-1">
        <Button type="button" variant="ghost" size="icon" aria-label="Move question up" title="Move up" disabled={!index} onClick={() => move(index, -1)}><ArrowUp /></Button>
        <Button type="button" variant="ghost" size="icon" aria-label="Move question down" title="Move down" disabled={index === questions.length - 1} onClick={() => move(index, 1)}><ArrowDown /></Button>
        <Button type="button" variant="ghost" size="icon" aria-label="Delete question" title="Delete question" onClick={() => onChange(questions.filter((item) => item.id !== q.id))}><Trash2 /></Button>
      </div></div>
      <div className="grid gap-3 sm:grid-cols-[1fr_180px]"><label className="text-xs font-medium">Question text<Input required value={q.text} onChange={(e) => update(q.id, { text: e.target.value })} className="mt-1" placeholder="What would you like to ask?" /></label>
      <label className="text-xs font-medium">Answer type<select value={q.type} onChange={(e) => update(q.id, { type: e.target.value })} className={`mt-1 ${field}`}>{ANSWER_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label></div>
      {choiceType(q.type) && <div className="mt-3 space-y-2"><p className="text-xs font-medium">Answer options <span className="font-normal text-muted-foreground">· flag answers for conversion or follow-up</span></p>{(q.options || []).map((opt, i) => <div key={i} className="flex flex-wrap items-center gap-2"><Input aria-label={`Option ${i + 1}`} value={opt} className="min-w-32 flex-1" onChange={(e) => update(q.id, { options: q.options.map((o, j) => i === j ? e.target.value : o) })} /><label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={!!q.indicators?.[i]} onChange={(e) => update(q.id, { indicators: { ...q.indicators, [i]: e.target.checked } })} /> Conversion</label><label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={!!q.triggers?.[i]} onChange={(e) => update(q.id, { triggers: { ...q.triggers, [i]: e.target.checked } })} /> Follow-up</label><Button type="button" variant="ghost" size="icon" title="Remove option" aria-label="Remove option" disabled={q.options.length <= 1} onClick={() => update(q.id, { options: q.options.filter((_, j) => j !== i) })}><Trash2 /></Button></div>)}<Button type="button" variant="outline" size="sm" onClick={() => update(q.id, { options: [...q.options, ''] })}><Plus /> Add option</Button></div>}
      <div className="mt-4 flex flex-wrap items-end gap-4"><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={q.mandatory} onChange={(e) => update(q.id, { mandatory: e.target.checked })} /> Mandatory</label>{index > 0 && <><label className="text-xs">Show only if question<select value={q.condition?.questionId || ''} onChange={(e) => update(q.id, { condition: e.target.value ? { questionId: e.target.value, answer: '' } : null })} className={`mt-1 ${field}`}><option value="">Always show</option>{questions.slice(0, index).filter((prior) => choiceType(prior.type)).map((prior, i) => <option key={prior.id} value={prior.id}>{prior.text || `Question ${i + 1}`}</option>)}</select></label>{q.condition?.questionId && <label className="text-xs">Answer matches<select value={q.condition.answer} onChange={(e) => update(q.id, { condition: { ...q.condition, answer: e.target.value } })} className={`mt-1 ${field}`}><option value="">Select answer</option>{questions.find((prior) => prior.id === q.condition.questionId)?.options?.map((o, i) => <option key={i} value={o}>{o || `Option ${i + 1}`}</option>)}</select></label>}</>}</div>
    </section>)}
    {!preview && <Button type="button" variant="outline" onClick={() => onChange([...questions, newQuestion()])}><Plus /> Add Question</Button>}
  </div>;
}

export function AnswerForm({ questions, initial = {}, onSave, saving }) {
  const [responses, setResponses] = useState(initial);
  const [remarks, setRemarks] = useState('');
  const [outcome, setOutcome] = useState('Interested');
  const visible = questions.filter((q) => !q.condition?.questionId || (Array.isArray(responses[q.condition.questionId]) ? responses[q.condition.questionId].includes(q.condition.answer) : responses[q.condition.questionId] === q.condition.answer));
  const missing = visible.some((q) => q.mandatory && (responses[q.id] === undefined || responses[q.id] === '' || (Array.isArray(responses[q.id]) && !responses[q.id].length)));
   return <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSave({ responses, remarks, outcome }); }}>
    {visible.map((q, index) => <div key={q.id} className="border-b border-border pb-4"><label className="mb-2 block text-sm font-medium">{index + 1}. {q.text}{q.mandatory && <span className="ml-1 text-destructive">*</span>}</label>
      {q.type === 'Single Select' || q.type === 'Multiple Select' ? <div className="flex flex-wrap gap-3">{q.options.map((opt, i) => <label key={i} className="flex items-center gap-1.5 text-sm"><input type={q.type === 'Single Select' ? 'radio' : 'checkbox'} name={q.id} checked={q.type === 'Single Select' ? responses[q.id] === opt : (responses[q.id] || []).includes(opt)} onChange={() => setResponses((prev) => ({ ...prev, [q.id]: q.type === 'Single Select' ? opt : (prev[q.id] || []).includes(opt) ? prev[q.id].filter((v) => v !== opt) : [...(prev[q.id] || []), opt] }))} />{opt}</label>)}</div> : q.type === 'Dropdown' ? <select className={field} value={responses[q.id] || ''} onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}><option value="">Select answer</option>{q.options.map((opt, i) => <option key={i}>{opt}</option>)}</select> : <Input type={q.type === 'Number' ? 'number' : q.type === 'Date' ? 'date' : 'text'} value={responses[q.id] || ''} onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })} />}</div>)}
    <label className="block text-sm font-medium">Remarks<Textarea className="mt-1" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Call notes…" /></label>
    <label className="block text-sm font-medium">Call outcome<select className={`mt-1 ${field}`} value={outcome} onChange={(e) => setOutcome(e.target.value)}>{['Interested', 'Follow-up Required', 'Not Interested', 'Not Connected', 'Invalid Number', 'Enrolled Somewhere Else', 'Application Started', 'Enrolment'].map((o) => <option key={o}>{o}</option>)}</select></label>
    <Button type="submit" disabled={saving || (missing && !['Not Connected', 'Invalid Number'].includes(outcome))}>{saving ? 'Saving…' : 'Save Responses & Call Outcome'}</Button>
    {missing && !['Not Connected', 'Invalid Number'].includes(outcome) && <p className="text-xs text-destructive">Complete mandatory questions before saving this outcome.</p>}
  </form>;
}
