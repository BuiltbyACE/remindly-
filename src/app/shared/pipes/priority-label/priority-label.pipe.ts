/**
 * PriorityLabel Pipe
 * Transforms priority values into human-readable labels with optional color classes
 */

import { Pipe, PipeTransform } from '@angular/core';

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low' | 'normal' | 'urgent';

@Pipe({
  name: 'priorityLabel',
  standalone: true,
})
export class PriorityLabelPipe implements PipeTransform {
  private readonly labels: Record<PriorityLevel | string, string> = {
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    normal: 'Normal',
    urgent: 'Urgent',
  };

  private readonly colorClasses: Record<PriorityLevel | string, { bg: string; text: string; border: string }> = {
    critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    high: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    low: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    normal: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
    urgent: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  };

  transform(
    value: PriorityLevel | string | null | undefined,
    format: 'label' | 'badge' | 'colors' = 'label'
  ): string {
    if (!value) return '';

    const normalized = value.toLowerCase() as PriorityLevel;

    switch (format) {
      case 'label':
        return this.labels[normalized] || value;

      case 'badge':
        const colors = this.colorClasses[normalized] || this.colorClasses['normal'];
        return `${colors.bg} ${colors.text} ${colors.border}`;

      case 'colors':
        const c = this.colorClasses[normalized] || this.colorClasses['normal'];
        return `${c.bg} ${c.text}`;

      default:
        return this.labels[normalized] || value;
    }
  }
}
