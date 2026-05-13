/**
 * Truncate Pipe
 * Smart text truncation with ellipsis and word boundary awareness
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    limit: number = 100,
    options?: {
      ellipsis?: string;
      breakWords?: boolean;
      preserveWords?: boolean;
      suffix?: string;
    }
  ): string {
    if (!value) return '';

    const opts = {
      ellipsis: '...',
      breakWords: false,
      preserveWords: true,
      suffix: '',
      ...options,
    };

    if (value.length <= limit) {
      return value + opts.suffix;
    }

    let truncated = value.substring(0, limit);

    if (opts.preserveWords && !opts.breakWords) {
      // Try to end at a word boundary
      const lastSpace = truncated.lastIndexOf(' ');
      const lastPunct = truncated.search(/[.!?;,]\s/);

      if (lastSpace > limit * 0.8) {
        // End at space if it's not too far back
        truncated = truncated.substring(0, lastSpace);
      } else if (lastPunct > limit * 0.5) {
        // End at punctuation if found
        truncated = truncated.substring(0, lastPunct + 1);
      }
    }

    return truncated.trim() + opts.ellipsis + opts.suffix;
  }
}
