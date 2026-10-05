import { pipelineContext, pipelineList, pipelineSave, pipelineStatus, pipelineCall, pipelineSettings, pipelineRecord } from './pipeline.functions';

export const isManager = (role) => role === 'admin' || role === 'sales_head';
export const getPipelineContext = () => pipelineContext();
export const getPipelineData = () => pipelineList();
export const savePipeline = (config, assignments, existingId) => pipelineSave({ data: { config, assignments, existingId } });
export const updatePipelineStatus = (id, status) => pipelineStatus({ data: { id, status } });
export const savePipelineCall = (item, entry) => pipelineCall({ data: { id: item.id, entry } });
export const savePipelineSettings = (id, changes) => pipelineSettings({ data: { id, ...changes } });
export const savePipelineRecord = (data) => pipelineRecord({ data });