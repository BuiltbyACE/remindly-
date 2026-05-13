/**
 * Analytics Domain Models
 * Types for dashboards, charts, and metrics
 */

export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'funnel';

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'stat' | 'list' | 'table';
  title: string;
  chart_type?: ChartType;
  data?: ChartData;
  value?: number;
  delta?: number;
  delta_positive?: boolean;
  list_items?: { label: string; value: number | string; trend?: 'up' | 'down' | 'neutral' }[];
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  date_range: { from: string; to: string };
}

// Event Analytics
export interface EventVolumeMetrics {
  total_events: number;
  events_by_status: Record<string, number>;
  events_by_priority: Record<string, number>;
  events_created_daily: { date: string; count: number }[];
  events_completed_daily: { date: string; count: number }[];
}

export interface ApprovalMetrics {
  total_approvals: number;
  pending_approvals: number;
  approved_count: number;
  rejected_count: number;
  avg_approval_time_hours: number;
  approvals_by_user: { user_id: string; user_name: string; count: number }[];
}

export interface ReminderMetrics {
  total_reminders: number;
  reminders_acknowledged: number;
  reminders_escalated: number;
  avg_acknowledge_time_minutes: number;
  escalation_rate: number;
}

export interface NotificationMetrics {
  total_sent: number;
  total_acknowledged: number;
  by_channel: Record<string, number>;
  by_priority: Record<string, number>;
  open_rate: number;
}

export interface ExecutiveSummaryMetrics {
  events_this_week: number;
  upcoming_events: number;
  pending_actions: number;
  avg_event_completion_time_hours: number;
  busiest_day: { day: string; event_count: number };
  top_collaborators: { user_id: string; user_name: string; interactions: number }[];
}

// Time ranges
export type AnalyticsTimeRange = 'today' | 'yesterday' | '7d' | '30d' | '90d' | 'custom';

export interface AnalyticsRequest {
  time_range: AnalyticsTimeRange;
  date_from?: string;
  date_to?: string;
  metrics: ('events' | 'approvals' | 'reminders' | 'notifications' | 'executive')[];
}

export interface AnalyticsResponse {
  event_metrics?: EventVolumeMetrics;
  approval_metrics?: ApprovalMetrics;
  reminder_metrics?: ReminderMetrics;
  notification_metrics?: NotificationMetrics;
  executive_summary?: ExecutiveSummaryMetrics;
}

// Chart configuration helpers
export const CHART_COLORS = {
  primary: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
  success: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
  warning: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'],
  danger: ['#ef4444', '#f87171', '#fca5a5', '#fecaca'],
  purple: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
  neutral: ['#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb'],
};
