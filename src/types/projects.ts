// Projects Module TypeScript Types
// Complete type definitions for project management system

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'archived';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectVisibility = 'private' | 'workspace' | 'public';
export type ProjectMemberRole = 'owner' | 'manager' | 'member' | 'viewer';

export interface ProjectMemberPermissions {
  can_edit: boolean;
  can_delete: boolean;
  can_manage_members: boolean;
}

// Core Project interface
export interface Project {
  id: string;
  workspace_id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  visibility: ProjectVisibility;

  // Ownership and assignment
  created_by?: string;
  project_manager?: string;

  // Dates and timeline
  start_date?: string; // ISO date string
  target_date?: string; // ISO date string
  completed_at?: string; // ISO datetime string

  // Organization
  tags: string[];
  color: string;
  icon: string;

  // Progress tracking
  progress_percentage: number;

  // Budget and resources
  estimated_hours?: number;
  actual_hours: number;
  budget_amount?: number;

  // Organization and sorting
  position: number;
  is_template: boolean;
  template_id?: string;

  // Additional data
  metadata: Record<string, any>;

  // Timestamps
  created_at: string;
  updated_at: string;
}

// Project with related data
export interface ProjectWithRelations extends Project {
  created_by_profile?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
  project_manager_profile?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
  members?: ProjectMember[];
  milestones?: ProjectMilestone[];
  tasks_count?: number;
  completed_tasks_count?: number;
  goals_count?: number;
  total_members?: number;
}

// Project Member interface
export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectMemberRole;
  permissions: ProjectMemberPermissions;
  joined_at: string;
  invited_by?: string;

  // User profile data
  user_profile?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    email?: string;
  };
}

// Project Milestone interface
export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date?: string; // ISO date string
  completed_at?: string; // ISO datetime string
  position: number;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

// Project Template interface
export interface ProjectTemplate {
  id: string;
  title: string;
  description?: string;
  category: string;

  // Template structure
  template_data: {
    estimated_hours?: number;
    default_priority?: ProjectPriority;
    default_tags?: string[];
    default_color?: string;
    default_icon?: string;
    [key: string]: any;
  };
  default_milestones: Array<{
    title: string;
    description?: string;
    position: number;
    estimated_days?: number;
  }>;
  default_tasks: Array<{
    title: string;
    description?: string;
    priority?: number;
    estimated_hours?: number;
    milestone_position?: number;
  }>;

  // Metadata
  is_public: boolean;
  created_by?: string;
  usage_count: number;

  created_at: string;
  updated_at: string;
}

// Input types for creating/updating projects
export interface CreateProjectInput {
  workspace_id: string;
  title: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  visibility?: ProjectVisibility;
  project_manager?: string;
  start_date?: string;
  target_date?: string;
  tags?: string[];
  color?: string;
  icon?: string;
  estimated_hours?: number;
  budget_amount?: number;
  template_id?: string;
  metadata?: Record<string, any>;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  visibility?: ProjectVisibility;
  project_manager?: string;
  start_date?: string;
  target_date?: string;
  tags?: string[];
  color?: string;
  icon?: string;
  estimated_hours?: number;
  actual_hours?: number;
  budget_amount?: number;
  progress_percentage?: number;
  position?: number;
  metadata?: Record<string, any>;
}

// Input types for project members
export interface CreateProjectMemberInput {
  project_id: string;
  user_id: string;
  role: ProjectMemberRole;
  permissions?: Partial<ProjectMemberPermissions>;
}

export interface UpdateProjectMemberInput {
  role?: ProjectMemberRole;
  permissions?: Partial<ProjectMemberPermissions>;
}

// Input types for milestones
export interface CreateMilestoneInput {
  project_id: string;
  title: string;
  description?: string;
  due_date?: string;
  position?: number;
}

export interface UpdateMilestoneInput {
  title?: string;
  description?: string;
  due_date?: string;
  completed_at?: string;
  position?: number;
  progress_percentage?: number;
}

// Input types for templates
export interface CreateTemplateInput {
  title: string;
  description?: string;
  category: string;
  template_data: ProjectTemplate['template_data'];
  default_milestones?: ProjectTemplate['default_milestones'];
  default_tasks?: ProjectTemplate['default_tasks'];
  is_public?: boolean;
}

export interface UpdateTemplateInput {
  title?: string;
  description?: string;
  category?: string;
  template_data?: Partial<ProjectTemplate['template_data']>;
  default_milestones?: ProjectTemplate['default_milestones'];
  default_tasks?: ProjectTemplate['default_tasks'];
  is_public?: boolean;
}

// Filter and search types
export interface ProjectFilters {
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
  created_by?: string[];
  project_manager?: string[];
  tags?: string[];
  start_date_after?: string;
  start_date_before?: string;
  target_date_after?: string;
  target_date_before?: string;
  search?: string;
}

export interface ProjectSortOptions {
  field: 'title' | 'status' | 'priority' | 'start_date' | 'target_date' | 'progress_percentage' | 'created_at' | 'updated_at';
  direction: 'asc' | 'desc';
}

// Analytics and insights types
export interface ProjectAnalytics {
  total_projects: number;
  projects_by_status: Record<ProjectStatus, number>;
  projects_by_priority: Record<ProjectPriority, number>;
  average_progress: number;
  overdue_projects: number;
  completed_this_month: number;
  total_estimated_hours: number;
  total_actual_hours: number;
  efficiency_ratio: number; // actual/estimated
}

export interface ProjectInsights {
  most_productive_day: string;
  average_completion_time: number; // days
  most_common_tags: Array<{ tag: string; count: number }>;
  project_velocity: number; // projects completed per week
  upcoming_deadlines: Array<{
    project_id: string;
    title: string;
    target_date: string;
    days_remaining: number;
  }>;
}

// Project dashboard data
export interface ProjectDashboardData {
  recent_projects: ProjectWithRelations[];
  active_projects_count: number;
  completed_projects_count: number;
  overdue_projects_count: number;
  total_progress: number;
  upcoming_milestones: Array<ProjectMilestone & { project_title: string }>;
  recent_activity: Array<{
    id: string;
    type: 'project_created' | 'project_completed' | 'milestone_completed' | 'member_added';
    project_id: string;
    project_title: string;
    description: string;
    created_at: string;
    user_id: string;
    user_name?: string;
  }>;
}

// Validation schemas (for runtime validation)
export interface ProjectValidation {
  title: {
    required: true;
    minLength: 1;
    maxLength: 200;
  };
  description: {
    maxLength: 2000;
  };
  estimated_hours: {
    min: 0;
    max: 10000;
  };
  budget_amount: {
    min: 0;
    max: 999999999.99;
  };
  progress_percentage: {
    min: 0;
    max: 100;
  };
}

// Default values
export const PROJECT_DEFAULTS = {
  status: 'planning' as ProjectStatus,
  priority: 'medium' as ProjectPriority,
  visibility: 'workspace' as ProjectVisibility,
  color: '#3b82f6',
  icon: 'folder',
  progress_percentage: 0,
  actual_hours: 0,
  position: 0,
  tags: [],
  metadata: {},
} as const;

export const PROJECT_MEMBER_DEFAULTS = {
  role: 'member' as ProjectMemberRole,
  permissions: {
    can_edit: false,
    can_delete: false,
    can_manage_members: false,
  },
} as const;

// Status and priority display configurations
export const PROJECT_STATUS_CONFIG = {
  planning: {
    label: 'Planning',
    color: 'blue',
    icon: 'calendar',
    description: 'Project is in planning phase',
  },
  active: {
    label: 'Active',
    color: 'green',
    icon: 'play',
    description: 'Project is actively being worked on',
  },
  on_hold: {
    label: 'On Hold',
    color: 'yellow',
    icon: 'pause',
    description: 'Project is temporarily paused',
  },
  completed: {
    label: 'Completed',
    color: 'green',
    icon: 'check',
    description: 'Project has been completed',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'red',
    icon: 'x',
    description: 'Project has been cancelled',
  },
  archived: {
    label: 'Archived',
    color: 'gray',
    icon: 'archive',
    description: 'Project has been archived',
  },
} as const;

export const PROJECT_PRIORITY_CONFIG = {
  low: {
    label: 'Low',
    color: 'gray',
    icon: 'arrow-down',
    score: 1,
  },
  medium: {
    label: 'Medium',
    color: 'blue',
    icon: 'minus',
    score: 2,
  },
  high: {
    label: 'High',
    color: 'orange',
    icon: 'arrow-up',
    score: 3,
  },
  urgent: {
    label: 'Urgent',
    color: 'red',
    icon: 'alert-triangle',
    score: 4,
  },
} as const;