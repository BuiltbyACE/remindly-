/**
 * PermissionDirective
 * Structural directive for RBAC visibility control
 * Usage: *appPermission="'admin'" or *appPermission="['admin', 'editor']"
 */

import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
  effect,
  signal,
  OnDestroy,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService, type UserProfile } from '../../../auth/services/auth.service';

@Directive({
  selector: '[appPermission]',
  standalone: true,
})
export class AppPermissionDirective implements OnDestroy {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);

  private readonly requiredPermissions = signal<string | string[] | null>(null);
  private readonly matchAny = signal<boolean>(false);
  private readonly userSignal = toSignal(this.authService.getCurrentUser());
  private hasView = false;

  /**
   * Required permission(s) to show the content
   * Can be a single permission string or array of permissions
   */
  @Input({ required: true })
  set appPermission(permissions: string | string[]) {
    this.requiredPermissions.set(permissions);
  }

  /**
   * When true, content shows if user has ANY of the listed permissions
   * When false (default), user needs ALL listed permissions
   */
  @Input()
  set appPermissionMatchAny(value: boolean) {
    this.matchAny.set(value ?? false);
  }

  constructor() {
    effect(() => {
      const permissions = this.requiredPermissions();
      if (!permissions) return;

      const user = this.userSignal();
      if (!user) {
        this.clearView();
        return;
      }

      const userPermissions = (user as UserProfile & { permissions?: string[] }).permissions ?? [];
      const required = Array.isArray(permissions) ? permissions : [permissions];

      const hasPermission = this.matchAny()
        ? required.some(p => userPermissions.includes(p))
        : required.every(p => userPermissions.includes(p));

      if (hasPermission) {
        this.createView();
      } else {
        this.clearView();
      }
    });
  }

  ngOnDestroy(): void {
    this.clearView();
  }

  private createView(): void {
    if (!this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    }
  }

  private clearView(): void {
    if (this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}

/**
 * Permission Denied Directive
 * Shows content only when user does NOT have the permission
 * Usage: *appPermissionDenied="'admin'"
 */
@Directive({
  selector: '[appPermissionDenied]',
  standalone: true,
})
export class AppPermissionDeniedDirective implements OnDestroy {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);

  private readonly deniedPermissions = signal<string | string[] | null>(null);
  private readonly userSignal = toSignal(this.authService.getCurrentUser());
  private hasView = false;

  @Input({ required: true })
  set appPermissionDenied(permissions: string | string[]) {
    this.deniedPermissions.set(permissions);
  }

  constructor() {
    effect(() => {
      const permissions = this.deniedPermissions();
      if (!permissions) return;

      const user = this.userSignal();
      if (!user) {
        this.createView();
        return;
      }

      const userPermissions = (user as UserProfile & { permissions?: string[] }).permissions ?? [];
      const denied = Array.isArray(permissions) ? permissions : [permissions];
      const hasAnyDenied = denied.some(p => userPermissions.includes(p));

      if (!hasAnyDenied) {
        this.createView();
      } else {
        this.clearView();
      }
    });
  }

  ngOnDestroy(): void {
    this.clearView();
  }

  private createView(): void {
    if (!this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    }
  }

  private clearView(): void {
    if (this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}
