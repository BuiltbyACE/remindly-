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
} from '@angular/core';
import { RbacStore } from '../../../auth/stores/rbac.store';

@Directive({
  selector: '[appPermission]',
})
export class AppPermissionDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly rbacStore = inject(RbacStore);

  private readonly requiredPermissions = signal<string | string[] | null>(null);
  private readonly matchAny = signal<boolean>(false);
  private hasView = false;

  @Input()
  set appPermission(permissions: string | string[] | undefined) {
    this.requiredPermissions.set(permissions ?? null);
  }

  @Input()
  set appPermissionMatchAny(value: boolean) {
    this.matchAny.set(value ?? false);
  }

  constructor() {
    effect(() => {
      const permissions = this.requiredPermissions();
      if (!permissions) {
        this.createView();
        return;
      }

      const required = Array.isArray(permissions) ? permissions : [permissions];
      const hasPermission = this.matchAny()
        ? this.rbacStore.hasAnyPermission()(required)
        : required.every(p => this.rbacStore.hasPermission()(p));

      if (hasPermission) {
        this.createView();
      } else {
        this.clearView();
      }
    });
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

@Directive({
  selector: '[appPermissionDenied]',
})
export class AppPermissionDeniedDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly rbacStore = inject(RbacStore);

  private readonly deniedPermissions = signal<string | string[] | null>(null);
  private hasView = false;

  @Input({ required: true })
  set appPermissionDenied(permissions: string | string[]) {
    this.deniedPermissions.set(permissions);
  }

  constructor() {
    effect(() => {
      const permissions = this.deniedPermissions();
      if (!permissions) return;

      const denied = Array.isArray(permissions) ? permissions : [permissions];
      const hasAnyDenied = denied.some(p => this.rbacStore.hasPermission()(p));

      if (!hasAnyDenied) {
        this.createView();
      } else {
        this.clearView();
      }
    });
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
