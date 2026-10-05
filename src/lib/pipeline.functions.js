import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';

const managerRoles = ['admin', 'sales_head'];
const manager = (role) => managerRoles.includes(role);
const assignmentSchema = z.object({ lead_id: z.string().min(1), lead_snapshot: z.record(z.unknown()).default({}), counsellor_id: z.string().uuid() });
const configSchema = z.object({
  name: z.string().trim().min(1), description: z.string(), type: z.enum(['Random Calling', 'Admission Conversion', 'Follow-up', 'Re-engagement', 'Custom']),
  priority: z.enum(['High', 'Medium', 'Low']), starts_on: z.string().nullable(), ends_on: z.string().nullable(),
  status: z.enum(['Draft', 'Active', 'Paused', 'Archived']), filters: z.record(z.unknown()), questions: z.array(z.record(z.unknown())),
});
const fieldSchema = z.object({ id: z.string().uuid(), name: z.string().trim().min(1).max(100), type: z.enum(['Text','Name','ID','Email','Phone','Number','Amount','Quantity','Date','Time','Dropdown','Multi-select']), required: z.boolean(), permission: z.enum(['Everyone','Managers']), kanban: z.boolean(), options: z.array(z.string().trim().min(1)).default([]), prefix: z.string().max(24).default(''), duplicate: z.boolean().default(false) });
const ruleSchema = z.object({ id: z.string().uuid(), outcome: z.string().min(1), action: z.enum(['set_status','follow_up','assign']), value: z.string().min(1) });
const valuesSchema = z.record(z.union([z.string(), z.number(), z.array(z.string()), z.null()]));
const uuid = z.string().uuid();
function validateValues(fields, values, existing = []) {
  for (const field of fields) {
    const value = values[field.id];
    if (field.required && (value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length))) throw new Error(`${field.name} is required.`);
    if (value === undefined || value === null || value === '') continue;
    if (field.type === 'Email' && !z.string().email().safeParse(value).success) throw new Error(`${field.name} must be an email address.`);
    if (field.type === 'Phone' && !/^\+?[0-9 ()-]{7,20}$/.test(String(value))) throw new Error(`${field.name} must be a phone number.`);
    if (['Number','Amount','Quantity'].includes(field.type) && (!Number.isFinite(Number(value)) || (field.type === 'Quantity' && (!Number.isInteger(Number(value)) || Number(value) < 0)))) throw new Error(`${field.name} must be a valid number.`);
    if (['Dropdown','Multi-select'].includes(field.type) && (Array.isArray(value) ? value.some((v) => !field.options.includes(v)) : !field.options.includes(value))) throw new Error(`${field.name} has an invalid option.`);
    if (field.duplicate && existing.some((row) => String(row.field_values?.[field.id] ?? '').toLowerCase() === String(value).toLowerCase())) throw new Error(`Duplicate ${field.name} in this pipeline.`);
  }
}

async function roleFor(context) {
  const { data, error } = await context.supabase.from('user_roles').select('role').eq('user_id', context.userId).single();
  if (error) throw error;
  return data.role;
}

export const pipelineContext = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const role = await roleFor(context);
  let people = [];
  if (manager(role)) {
    // Directory access is reserved for verified managers; role checks never use this privileged client.
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (error) throw error;
    people = (data.users || []).filter((person) => person.email_confirmed_at).map((person) => ({
      user_id: person.id,
      display_name: person.user_metadata?.name || person.email?.split('@')[0] || 'Staff member',
      email: person.email || '',
    })).sort((a, b) => a.display_name.localeCompare(b.display_name));
  }
  return { user: { id: context.userId }, role, people };
});

export const pipelineList = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: pipelines, error } = await context.supabase.from('pipelines').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  const ids = (pipelines || []).map((p) => p.id);
  if (!ids.length) return { pipelines: [], items: [] };
  const { data: items, error: itemError } = await context.supabase.from('pipeline_leads').select('*').in('pipeline_id', ids).order('created_at');
  if (itemError) throw itemError;
  return { pipelines, items: items || [] };
});

export const pipelineSave = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).validator((input) => z.object({ config: configSchema, assignments: z.array(assignmentSchema), existingId: z.string().uuid().optional() }).parse(input)).handler(async ({ context, data }) => {
  if (!manager(await roleFor(context))) throw new Error('Only managers can save pipelines.');
  const { config, assignments, existingId } = data;
  if (!config?.name?.trim() || !Array.isArray(assignments)) throw new Error('Complete the pipeline details.');
  if (new Set(assignments.map((a) => a.lead_id)).size !== assignments.length) throw new Error('A lead can only be selected once in each pipeline.');
  if (config.starts_on && config.ends_on && config.ends_on < config.starts_on) throw new Error('End date must be after the start date.');
  if (assignments.length) {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (usersError) throw usersError;
    const verified = new Set(users.users.filter((person) => person.email_confirmed_at).map((person) => person.id));
    if (assignments.some((a) => !verified.has(a.counsellor_id))) throw new Error('Assign leads to verified staff accounts only.');
  }
  const client = context.supabase;
  const result = existingId
    ? await client.from('pipelines').update(config).eq('id', existingId).select('id').single()
    : await client.from('pipelines').insert({ ...config, created_by: context.userId }).select('id').single();
  if (result.error) throw result.error;
  const id = result.data.id;
  // Keep unchanged assignments intact so existing answers and call history survive edits.
  if (existingId) {
    const { data: previous, error } = await client.from('pipeline_leads').select('id,lead_id,counsellor_id').eq('pipeline_id', id);
    if (error) throw error;
    const wanted = new Map(assignments.map((a) => [a.lead_id, a]));
    const removed = previous.filter((row) => !wanted.has(row.lead_id));
    if (removed.length) {
      const { error: deleteError } = await client.from('pipeline_leads').delete().in('id', removed.map((row) => row.id));
      if (deleteError) throw deleteError;
    }
    for (const row of previous) {
      const changed = wanted.get(row.lead_id);
      if (changed && changed.counsellor_id !== row.counsellor_id) {
        const { error: updateError } = await client.from('pipeline_leads').update({ counsellor_id: changed.counsellor_id }).eq('id', row.id);
        if (updateError) throw updateError;
      }
    }
    const oldIds = new Set(previous.map((row) => row.lead_id));
    const added = assignments.filter((a) => !oldIds.has(a.lead_id));
    if (added.length) {
      const { error: addError } = await client.from('pipeline_leads').insert(added.map((a) => ({ ...a, pipeline_id: id })));
      if (addError) throw addError;
    }
  } else if (assignments.length) {
    const { error } = await client.from('pipeline_leads').insert(assignments.map((a) => ({ ...a, pipeline_id: id })));
    if (error) throw error;
  }
  return id;
});

export const pipelineStatus = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).validator((input) => z.object({ id: z.string().uuid(), status: z.enum(['Active', 'Paused', 'Archived']) }).parse(input)).handler(async ({ context, data }) => {
  if (!manager(await roleFor(context))) throw new Error('Only managers can change pipeline status.');
  if (!['Active', 'Paused', 'Archived'].includes(data.status)) throw new Error('Invalid status.');
  const { error } = await context.supabase.from('pipelines').update({ status: data.status }).eq('id', data.id);
  if (error) throw error;
});

export const pipelineCall = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).validator((input) => z.object({ id: z.string().uuid(), entry: z.object({ responses: z.record(z.unknown()), remarks: z.string(), outcome: z.enum(['Interested', 'Follow-up Required', 'Not Interested', 'Not Connected', 'Invalid Number', 'Enrolled Somewhere Else', 'Application Started', 'Enrolment']) }) }).parse(input)).handler(async ({ context, data }) => {
  const client = context.supabase;
  const { data: row, error } = await client.from('pipeline_leads').select('id,pipeline_id,counsellor_id,call_history,field_values,updated_at').eq('id', data.id).single();
  if (error) throw error;
  const role = await roleFor(context);
  if (!manager(role) && row.counsellor_id !== context.userId) throw new Error('This lead is not assigned to you.');
  const { data: pipeline, error: pipelineError } = await client.from('pipelines').select('status,questions,fields,automations').eq('id', row.pipeline_id).single();
  if (pipelineError) throw pipelineError;
  if (pipeline.status !== 'Active') throw new Error('This pipeline is not active.');
  const entry = data.entry;
  if (!entry || typeof entry.responses !== 'object' || !entry.outcome) throw new Error('Complete the call outcome.');
  if (!['Not Connected', 'Invalid Number'].includes(entry.outcome)) {
    const visible = (pipeline.questions || []).filter((q) => !q.condition?.questionId || (Array.isArray(entry.responses[q.condition.questionId]) ? entry.responses[q.condition.questionId].includes(q.condition.answer) : entry.responses[q.condition.questionId] === q.condition.answer));
    if (visible.some((q) => q.mandatory && (entry.responses[q.id] === undefined || entry.responses[q.id] === '' || (Array.isArray(entry.responses[q.id]) && !entry.responses[q.id].length)))) throw new Error('Complete mandatory questions before saving.');
  }
  const fieldValues = { ...(row.field_values || {}) };
  let assignedTo = row.counsellor_id;
  for (const rule of pipeline.automations || []) {
    if (rule.outcome !== entry.outcome) continue;
    if (rule.action === 'set_status') fieldValues.calling_status = rule.value;
    if (rule.action === 'follow_up') { const days = Math.max(0, Math.min(365, Number(rule.value) || 0)); fieldValues.follow_up_on = new Date(Date.now() + days * 86400000).toISOString().slice(0,10); }
    if (rule.action === 'assign' && manager(role)) {
      const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
      const { data: person, error: personError } = await supabaseAdmin.auth.admin.getUserById(rule.value);
      if (personError || !person.user?.email_confirmed_at) throw new Error('Automation assignee must be verified.');
      assignedTo = rule.value;
    }
  }
  const { data: updated, error: updateError } = await client.from('pipeline_leads').update({
    responses: entry.responses, remarks: entry.remarks || '', outcome: entry.outcome,
    field_values: fieldValues, counsellor_id: assignedTo,
    call_history: [...(row.call_history || []), { ...entry, at: new Date().toISOString(), by: context.userId }],
  }).eq('id', row.id).eq('updated_at', row.updated_at).select('id');
  if (updateError) throw updateError;
  if (!updated?.length) throw new Error('This lead was updated elsewhere. Refresh and try again.');
});

export const pipelineSettings = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).validator((input) => z.object({ id: uuid, fields: z.array(fieldSchema).max(100).optional(), questions: z.array(z.record(z.unknown())).optional(), automations: z.array(ruleSchema).max(50).optional() }).parse(input)).handler(async ({ context, data }) => {
  if (!manager(await roleFor(context))) throw new Error('Only managers can change pipeline settings.');
  const patch = {};
  for (const key of ['fields','questions','automations']) if (data[key] !== undefined) patch[key] = data[key];
  if (data.fields && new Set(data.fields.map((f) => f.id)).size !== data.fields.length) throw new Error('Field IDs must be unique.');
  const { data: updated, error } = await context.supabase.from('pipelines').update(patch).eq('id', data.id).select('id');
  if (error) throw error;
  if (!updated?.length) throw new Error('Pipeline not found.');
});

export const pipelineRecord = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).validator((input) => z.object({ pipelineId: uuid, id: uuid.optional(), mode: z.enum(['add','edit','delete']), values: valuesSchema.default({}), counsellorId: uuid.optional() }).parse(input)).handler(async ({ context, data }) => {
  if (!manager(await roleFor(context))) throw new Error('Only managers can manage records.');
  const client = context.supabase;
  const { data: pipeline, error: pipelineError } = await client.from('pipelines').select('fields').eq('id', data.pipelineId).single();
  if (pipelineError) throw pipelineError;
  if (data.mode === 'delete') {
    if (!data.id) throw new Error('Record not found.');
    const { error } = await client.from('pipeline_leads').delete().eq('id', data.id).eq('pipeline_id', data.pipelineId);
    if (error) throw error;
    return;
  }
  const fields = fieldSchema.array().parse(pipeline.fields || []);
  const { data: rows, error: rowsError } = await client.from('pipeline_leads').select('id,field_values').eq('pipeline_id', data.pipelineId);
  if (rowsError) throw rowsError;
  validateValues(fields, data.values, (rows || []).filter((r) => r.id !== data.id));
  if (data.mode === 'edit') {
    if (!data.id) throw new Error('Record not found.');
    const { data: updated, error } = await client.from('pipeline_leads').update({ field_values: data.values }).eq('id', data.id).eq('pipeline_id', data.pipelineId).select('id');
    if (error) throw error;
    if (!updated?.length) throw new Error('Record not found.');
    return;
  }
  if (!data.counsellorId) throw new Error('Choose a counsellor.');
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data: person, error: personError } = await supabaseAdmin.auth.admin.getUserById(data.counsellorId);
  if (personError || !person.user?.email_confirmed_at) throw new Error('Choose a verified staff account.');
  const leadId = `custom:${crypto.randomUUID()}`;
  const name = fields.find((f) => f.type === 'Name');
  const snapshot = { name: String(data.values[name?.id] || 'New record') };
  const { error } = await client.from('pipeline_leads').insert({ pipeline_id: data.pipelineId, lead_id: leadId, lead_snapshot: snapshot, counsellor_id: data.counsellorId, field_values: data.values });
  if (error) throw error;
});