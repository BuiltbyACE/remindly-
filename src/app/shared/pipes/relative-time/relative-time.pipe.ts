/**
 * RelativeTime Pipe
 * Transforms dates into relative time strings (e.g., "2 hours ago", "in 3 days")
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeTime',
  standalone: true,
})
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | Date | null | undefined, options?: { addSuffix?: boolean; unit?: 'auto' | 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year' }): string {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const isPast = diffInSeconds >= 0;
    const absDiff = Math.abs(diffInSeconds);

    const addSuffix = options?.addSuffix ?? true;
    const unit = options?.unit ?? 'auto';

    let result = '';

    if (unit === 'auto') {
      if (absDiff < 60) {
        result = isPast ? 'just now' : 'in a few seconds';
      } else if (absDiff < 3600) {
        const minutes = Math.floor(absDiff / 60);
        result = isPast ? `${minutes} min${minutes > 1 ? 's' : ''} ago` : `in ${minutes} min${minutes > 1 ? 's' : ''}`;
      } else if (absDiff < 86400) {
        const hours = Math.floor(absDiff / 3600);
        result = isPast ? `${hours} hour${hours > 1 ? 's' : ''} ago` : `in ${hours} hour${hours > 1 ? 's' : ''}`;
      } else if (absDiff < 2592000) {
        const days = Math.floor(absDiff / 86400);
        result = isPast ? `${days} day${days > 1 ? 's' : ''} ago` : `in ${days} day${days > 1 ? 's' : ''}`;
      } else if (absDiff < 31536000) {
        const months = Math.floor(absDiff / 2592000);
        result = isPast ? `${months} month${months > 1 ? 's' : ''} ago` : `in ${months} month${months > 1 ? 's' : ''}`;
      } else {
        const years = Math.floor(absDiff / 31536000);
        result = isPast ? `${years} year${years > 1 ? 's' : ''} ago` : `in ${years} year${years > 1 ? 's' : ''}`;
      }
    } else {
      // Specific unit requested
      switch (unit) {
        case 'second':
          result = isPast ? `${absDiff} seconds ago` : `in ${absDiff} seconds`;
          break;
        case 'minute':
          const mins = Math.floor(absDiff / 60);
          result = isPast ? `${mins} minutes ago` : `in ${mins} minutes`;
          break;
        case 'hour':
          const hrs = Math.floor(absDiff / 3600);
          result = isPast ? `${hrs} hours ago` : `in ${hrs} hours`;
          break;
        case 'day':
          const ds = Math.floor(absDiff / 86400);
          result = isPast ? `${ds} days ago` : `in ${ds} days`;
          break;
        case 'month':
          const mos = Math.floor(absDiff / 2592000);
          result = isPast ? `${mos} months ago` : `in ${mos} months`;
          break;
        case 'year':
          const yrs = Math.floor(absDiff / 31536000);
          result = isPast ? `${yrs} years ago` : `in ${yrs} years`;
          break;
      }
    }

    return result;
  }
}
