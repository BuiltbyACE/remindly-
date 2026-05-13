/**
 * CommandPalette Component
 * ⌘K / Ctrl+K quick navigation and action center
 */

import { Component, ChangeDetectionStrategy, inject, signal, effect, computed } from '@angular/core';
import { Router } from '@angular/router';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  action: () => void;
  category?: string;
}

interface DisplayCommand extends CommandItem {
  showCategoryHeader: boolean;
  _flatIndex: number;
}

@Component({
  selector: 'app-command-palette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'onKeydown($event)' },
  imports: [],
  template: `
    @if (isOpen()) {
      <div 
        class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
        (click)="close()">
        <div 
          class="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden"
          (click)="$event.stopPropagation()">
          
          <!-- Search Input -->
          <div class="border-b border-gray-200 p-4">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                #searchInput
                [value]="query()"
                (input)="updateQuery($any($event).target.value)"
                (keydown.arrowdown)="moveSelection(1)"
                (keydown.arrowup)="moveSelection(-1)"
                (keydown.enter)="executeSelected()"
                (keydown.escape)="close()"
                placeholder="Search commands, navigate, or find..."
                class="w-full pl-10 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none"
                autofocus
              />
            </div>
          </div>

          <!-- Results -->
          <div class="max-h-96 overflow-y-auto py-2">
            @if (filteredCommands().length === 0) {
              <div class="px-4 py-8 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="mt-2 text-sm text-gray-500">No commands found</p>
                <p class="text-xs text-gray-400">Try a different search term</p>
              </div>
            } @else {
              @for (cmd of displayCommands(); track cmd.id; let i = $index) {
                @if (cmd.showCategoryHeader && cmd.category) {
                  <div class="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {{ cmd.category }}
                  </div>
                }
                
                <button
                  type="button"
                  (click)="executeCommand(cmd)"
                  (mouseenter)="selectIndex(cmd._flatIndex)"
                  class="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors"
                  [class.bg-blue-50]="selectedIndex() === cmd._flatIndex"
                  [class.text-blue-900]="selectedIndex() === cmd._flatIndex"
                  [class.text-gray-700]="selectedIndex() !== cmd._flatIndex"
                  [class.hover.bg-gray-50]="selectedIndex() !== cmd._flatIndex">
                  
                  @if (cmd.icon) {
                    <svg class="h-5 w-5 flex-shrink-0" [class]="selectedIndex() === cmd._flatIndex ? 'text-blue-500' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="cmd.icon" />
                    </svg>
                  }
                  
                  <div class="flex-1 min-w-0">
                    <p class="font-medium truncate">{{ cmd.label }}</p>
                    @if (cmd.description) {
                      <p class="text-sm opacity-75 truncate">{{ cmd.description }}</p>
                    }
                  </div>
                  
                  @if (cmd.shortcut) {
                    <kbd class="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded">
                      {{ cmd.shortcut }}
                    </kbd>
                  }
                </button>
              }
            }
          </div>

          <!-- Footer -->
          <div class="border-t border-gray-200 px-4 py-2 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
            <div class="flex items-center gap-4">
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-white border rounded">↑↓</kbd>
                <span>Navigate</span>
              </span>
              <span class="flex items-center gap-1">
                <kbd class="px-1.5 py-0.5 bg-white border rounded">↵</kbd>
                <span>Select</span>
              </span>
            </div>
            <span class="flex items-center gap-1">
              <kbd class="px-1.5 py-0.5 bg-white border rounded">Esc</kbd>
              <span>Close</span>
            </span>
          </div>
        </div>
      </div>
    }
  `,
})
export class CommandPaletteComponent {
  private readonly router = inject(Router);
  
  readonly isOpen = signal(false);
  readonly query = signal('');
  readonly selectedIndex = signal(0);
  
  // Navigation commands
  private readonly navigationCommands: CommandItem[] = [
    {
      id: 'nav-dashboard',
      label: 'Dashboard',
      description: 'Go to home dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      shortcut: 'G D',
      action: () => this.router.navigate(['/dashboard']),
      category: 'Navigation',
    },
    {
      id: 'nav-events',
      label: 'Events',
      description: 'View all events',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      shortcut: 'G E',
      action: () => this.router.navigate(['/events']),
      category: 'Navigation',
    },
    {
      id: 'nav-approvals',
      label: 'Approvals',
      description: 'Pending approvals',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      shortcut: 'G A',
      action: () => this.router.navigate(['/approvals']),
      category: 'Navigation',
    },
    {
      id: 'nav-notifications',
      label: 'Notifications',
      description: 'View notifications',
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      shortcut: 'G N',
      action: () => this.router.navigate(['/notifications']),
      category: 'Navigation',
    },
    {
      id: 'nav-ai',
      label: 'AI Briefing',
      description: 'Daily AI briefings',
      icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      shortcut: 'G B',
      action: () => this.router.navigate(['/ai']),
      category: 'Navigation',
    },
    {
      id: 'nav-voice',
      label: 'Voice Commands',
      description: 'Voice interface',
      icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
      shortcut: 'G V',
      action: () => this.router.navigate(['/voice']),
      category: 'Navigation',
    },
  ];

  // Action commands
  private readonly actionCommands: CommandItem[] = [
    {
      id: 'action-create-event',
      label: 'Create Event',
      description: 'Create a new event',
      icon: 'M12 4v16m8-8H4',
      shortcut: 'C E',
      action: () => this.router.navigate(['/events/create']),
      category: 'Actions',
    },
    {
      id: 'action-refresh',
      label: 'Refresh Data',
      description: 'Reload all dashboard data',
      icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
      shortcut: '⌘ R',
      action: () => window.location.reload(),
      category: 'Actions',
    },
    {
      id: 'action-help',
      label: 'Help & Support',
      description: 'View documentation',
      icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      action: () => window.open('https://docs.remindly.app', '_blank'),
      category: 'Actions',
    },
  ];

  private allCommands: CommandItem[] = [...this.navigationCommands, ...this.actionCommands];

  readonly filteredCommands = signal<CommandItem[]>(this.allCommands);

  readonly displayCommands = computed<DisplayCommand[]>(() => {
    const commands = this.filteredCommands();
    const result: DisplayCommand[] = [];
    let lastCategory: string | null = null;
    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      const category = cmd.category ?? '';
      const showHeader = category !== lastCategory;
      lastCategory = category;
      result.push({ ...cmd, showCategoryHeader: showHeader, _flatIndex: i });
    }
    return result;
  });

  constructor() {
    effect(() => {
      const q = this.query().toLowerCase().trim();
      if (!q) {
        this.filteredCommands.set(this.allCommands);
      } else {
        const filtered = this.allCommands.filter(
          cmd =>
            cmd.label.toLowerCase().includes(q) ||
            (cmd.description?.toLowerCase().includes(q) ?? false)
        );
        this.filteredCommands.set(filtered);
      }
      this.selectedIndex.set(0);
    });
  }

  onKeydown(event: KeyboardEvent): void {
    // ⌘K or Ctrl+K to open
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.toggle();
    }
  }

  open(): void {
    this.isOpen.set(true);
    this.query.set('');
    this.selectedIndex.set(0);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  updateQuery(value: string): void {
    this.query.set(value);
  }

  moveSelection(delta: number): void {
    const max = this.filteredCommands().length - 1;
    const newIndex = Math.max(0, Math.min(max, this.selectedIndex() + delta));
    this.selectedIndex.set(newIndex);
  }

  selectIndex(index: number): void {
    this.selectedIndex.set(index);
  }

  executeSelected(): void {
    const commands = this.filteredCommands();
    const index = this.selectedIndex();
    if (index >= 0 && index < commands.length) {
      this.executeCommand(commands[index]);
    }
  }

  executeCommand(command: CommandItem): void {
    command.action();
    this.close();
  }
}
