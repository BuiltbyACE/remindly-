/**
 * Avatar Component
 * User/organization avatars with image fallback to initials
 */

import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarVariant = 'circle' | 'rounded' | 'square';

@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    @if (imageUrl(); as url) {
      <img 
        [src]="url"
        [alt]="alt()"
        class="object-cover"
        [class]="containerClasses()"
        (error)="onImageError($event)"
      />
    } @else {
      <div 
        class="flex items-center justify-center font-medium"
        [class]="containerClasses() + ' ' + colorClasses()">
        {{ initials() }}
      </div>
    }
  `,
})
export class AvatarComponent {
  /** Full name to generate initials from */
  readonly name = input.required<string>();
  
  /** Optional image URL - if provided, shows image; otherwise shows initials */
  readonly imageUrl = input<string | null>(null);
  
  /** Avatar size */
  readonly size = input<AvatarSize>('md');
  
  /** Avatar shape variant */
  readonly variant = input<AvatarVariant>('circle');
  
  /** Alt text for accessibility */
  readonly alt = input<string>('User avatar');
  
  /** Custom background color class (e.g., 'bg-blue-500') */
  readonly bgColor = input<string>('');
  
  /** Custom text color class (e.g., 'text-white') */
  readonly textColor = input<string>('');

  /** Computed initials from name */
  readonly initials = computed(() => {
    const name = this.name().trim();
    if (!name) return '?';
    
    const parts = name.split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  protected containerClasses(): string {
    const sizeClasses: Record<AvatarSize, string> = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
      xl: 'h-16 w-16 text-xl',
    };

    const variantClasses: Record<AvatarVariant, string> = {
      circle: 'rounded-full',
      rounded: 'rounded-lg',
      square: 'rounded-none',
    };

    return `${sizeClasses[this.size()]} ${variantClasses[this.variant()]}`;
  }

  protected colorClasses(): string {
    if (this.bgColor()) {
      return `${this.bgColor()} ${this.textColor() || 'text-white'}`;
    }
    
    // Generate deterministic color from name
    const colors = [
      'bg-red-500 text-white',
      'bg-orange-500 text-white',
      'bg-amber-500 text-white',
      'bg-yellow-500 text-gray-900',
      'bg-lime-500 text-gray-900',
      'bg-green-500 text-white',
      'bg-emerald-500 text-white',
      'bg-teal-500 text-white',
      'bg-cyan-500 text-white',
      'bg-sky-500 text-white',
      'bg-blue-500 text-white',
      'bg-indigo-500 text-white',
      'bg-violet-500 text-white',
      'bg-purple-500 text-white',
      'bg-fuchsia-500 text-white',
      'bg-pink-500 text-white',
      'bg-rose-500 text-white',
    ];
    
    const index = this.name().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }

  onImageError(event: Event): void {
    // Image failed to load, fall back to initials
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
