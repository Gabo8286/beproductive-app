export type ProcessStatus = 'draft' | 'review' | 'approved' | 'active' | 'deprecated' | 'archived';
export type ProcessCategory = 'operational' | 'administrative' | 'strategic' | 'compliance' | 'quality' | 'hr' | 'finance' | 'it' | 'other';
export type ProcessComplexity = 'simple' | 'moderate' | 'complex' | 'very_complex';
export type ProcessPriority = 'low' | 'medium' | 'high' | 'critical';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'needs_revision';

export interface ProcessStep {
  id: string;
  order: number;
  title: string;
  description?: string;
  type: 'task' | 'decision' | 'approval' | 'input' | 'output' | 'delay';
  responsible_role?: string;
  estimated_duration?: number; // in minutes
  dependencies?: string[]; // IDs of previous steps
  conditions?: Record<string, any>;
  attachments?: string[];
  notes?: string;
}

export interface ProcessMetrics {
  avg_completion_time?: number; // in minutes
  success_rate?: number; // percentage
  cost_per_execution?: number;
  frequency_per_month?: number;
  last_executed?: string;
  total_executions?: number;
}

export interface Process {
  id: string;
  workspace_id: string;
  title: string;
  description?: string | null;
  category: ProcessCategory;
  status: ProcessStatus;
  complexity: ProcessComplexity;
  priority: ProcessPriority;
  version: number;
  is_current_version: boolean;
  parent_process_id?: string | null; // For process versioning
  owner_id: string;
  stakeholders: string[]; // User IDs
  tags: string[];
  steps: ProcessStep[];
  triggers: string[]; // What initiates this process
  inputs: string[]; // Required inputs
  outputs: string[]; // Expected outputs
  risks: string[]; // Identified risks
  controls: string[]; // Risk controls
  metrics: ProcessMetrics;
  approval_workflow?: ProcessApproval[];
  attachments: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by: string;
  last_modified_by: string;
  approved_at?: string | null;
  approved_by?: string | null;
}

export interface ProcessApproval {
  id: string;
  process_id: string;
  process_version: number;
  approver_id: string;
  status: ApprovalStatus;
  comments?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProcessExecution {
  id: string;
  process_id: string;
  process_version: number;
  executed_by: string;
  started_at: string;
  completed_at?: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  current_step?: number;
  execution_data: Record<string, any>;
  duration?: number; // in minutes
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProcessTemplate {
  id: string;
  name: string;
  description: string;
  category: ProcessCategory;
  complexity: ProcessComplexity;
  template_data: Omit<Process, 'id' | 'workspace_id' | 'created_at' | 'updated_at' | 'created_by'>;
  usage_count: number;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProcessInput {
  workspace_id: string;
  title: string;
  description?: string;
  category?: ProcessCategory;
  complexity?: ProcessComplexity;
  priority?: ProcessPriority;
  stakeholders?: string[];
  tags?: string[];
  steps?: ProcessStep[];
  triggers?: string[];
  inputs?: string[];
  outputs?: string[];
  risks?: string[];
  controls?: string[];
}

export interface UpdateProcessInput {
  title?: string;
  description?: string;
  category?: ProcessCategory;
  complexity?: ProcessComplexity;
  priority?: ProcessPriority;
  stakeholders?: string[];
  tags?: string[];
  steps?: ProcessStep[];
  triggers?: string[];
  inputs?: string[];
  outputs?: string[];
  risks?: string[];
  controls?: string[];
  status?: ProcessStatus;
}

export interface ProcessAnalytics {
  total_processes: number;
  by_status: Record<ProcessStatus, number>;
  by_category: Record<ProcessCategory, number>;
  by_complexity: Record<ProcessComplexity, number>;
  avg_completion_time: number;
  most_executed: Process[];
  recently_updated: Process[];
  pending_approvals: number;
  compliance_score: number;
}