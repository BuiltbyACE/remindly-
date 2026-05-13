/**
 * EmptyState Component Unit Tests
 * Example Vitest spec for shared component
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    fixture.componentRef.setInput('title', 'No Items');
    fixture.componentRef.setInput('icon', 'inbox');
    fixture.detectChanges();

    const titleElement = fixture.debugElement.query(By.css('h3'));
    expect(titleElement.nativeElement.textContent).toContain('No Items');
  });

  it('should display description when provided', () => {
    fixture.componentRef.setInput('title', 'Empty');
    fixture.componentRef.setInput('description', 'There are no items to display');
    fixture.detectChanges();

    const descElement = fixture.debugElement.query(By.css('p'));
    expect(descElement.nativeElement.textContent).toContain('There are no items to display');
  });

  it('should show correct icon based on input', () => {
    fixture.componentRef.setInput('title', 'Empty');
    fixture.componentRef.setInput('icon', 'search');
    fixture.detectChanges();

    const iconContainer = fixture.debugElement.query(By.css('[data-testid="icon-container"]'));
    expect(iconContainer).toBeTruthy();
  });

  it('should render action slot content when provided', () => {
    fixture.componentRef.setInput('title', 'Empty');
    fixture.detectChanges();

    // Check that ng-content slot exists
    const slot = fixture.debugElement.query(By.css('[data-testid="actions"]'));
    expect(slot).toBeTruthy();
  });
});
