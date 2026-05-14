/**
 * ApprovalsStore
 * Signal-based state management for the Approvals domain
 */

import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { lastValueFrom, Subscription } from 'rxjs';
import { ApprovalsService } from '../services/approvals.service';
import { ToastService } from '@shared/components/toast/toast.service';
import { WebSocketStore } from '../../websocket/websocket.store';
import type { Approval, ApprovalStatus, ApprovalFilterOptions, PaginationParams } from '../models/approval.model';

interface ApprovalsState {
  approvals: Approval[];
  selectedApproval: Approval | null;
  loading: boolean;
  error: string | null;
  filters: ApprovalFilterOptions;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

const initialState: ApprovalsState = {
  approvals: [],
  selectedApproval: null,
  loading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
};

export const ApprovalsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  
  withHooks({
    onInit(store) {
      const webSocketStore = inject(WebSocketStore);
      let wsSubscription: Subscription | null = null;
      
      // Subscribe to approval-related WebSocket messages
      wsSubscription = webSocketStore.messagesOfTypes([
        'approval.requested',
        'approval.processed',
      ]).subscribe((message) => {
        const approval = message.payload as Approval;
        
        // Update approval in the list
        const currentApprovals = store.approvals();
        const existingIndex = currentApprovals.findIndex(a => a.id === approval.id);
        
        let updatedApprovals: Approval[];
        if (existingIndex >= 0) {
          // Update existing
          updatedApprovals = currentApprovals.map(a => 
            a.id === approval.id ? approval : a
          );
        } else {
          // Add new
          updatedApprovals = [approval, ...currentApprovals];
        }
        
        patchState(store, { approvals: updatedApprovals });
        
        // Update selected if same
        const selected = store.selectedApproval();
        if (selected?.id === approval.id) {
          patchState(store, { selectedApproval: approval });
        }
      });
      
      // Cleanup on destroy
      return () => {
        if (wsSubscription) {
          wsSubscription.unsubscribe();
          wsSubscription = null;
        }
      };
    },
  }),
  
  withComputed((store) => ({
    // Computed signals for filtered counts
    pendingCount: computed(() => 
      store.approvals().filter(a => a.status === 'pending').length
    ),
    approvedCount: computed(() => 
      store.approvals().filter(a => a.status === 'approved').length
    ),
    rejectedCount: computed(() => 
      store.approvals().filter(a => a.status === 'rejected').length
    ),
    
    // Pending approvals requiring action (not requested by current user)
    actionableApprovals: computed(() =>
      store.approvals().filter(a => a.status === 'pending')
    ),
    
    // Filtered by current filter selection
    filteredApprovals: computed(() => {
      const approvals = store.approvals();
      const filters = store.filters();
      
      return approvals.filter(approval => {
        if (filters.status && approval.status !== filters.status) return false;
        if (filters.event_id && approval.event_id !== filters.event_id) return false;
        return true;
      });
    }),
  })),

  withMethods((store, approvalsService = inject(ApprovalsService), toastService = inject(ToastService)) => ({
    // Actions
    setLoading(loading: boolean): void {
      patchState(store, { loading });
    },

    setError(error: string | null): void {
      patchState(store, { error, loading: false });
    },

    clearError(): void {
      patchState(store, { error: null });
    },

    selectApproval(approval: Approval | null): void {
      patchState(store, { selectedApproval: approval });
    },

    setFilters(filters: ApprovalFilterOptions): void {
      patchState(store, { filters, pagination: { ...store.pagination(), page: 1 } });
    },

    setPage(page: number): void {
      patchState(store, { pagination: { ...store.pagination(), page } });
    },

    // Load approvals for a specific event
    async loadApprovals(eventId: string, pagination?: PaginationParams): Promise<void> {
      patchState(store, { loading: true, error: null });
      
      try {
        const response = await lastValueFrom(
          approvalsService.listApprovals(
            eventId,
            store.filters(),
            pagination || { page: store.pagination().page, page_size: store.pagination().pageSize }
          )
        );

        patchState(store, {
          approvals: response?.items ?? [],
          pagination: {
            page: response?.page ?? 1,
            pageSize: response?.page_size ?? store.pagination().pageSize,
            total: response?.total ?? 0,
          },
          loading: false,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load approvals';
        patchState(store, { error: message, loading: false });
      }
    },

    // Create approval request
    async requestApproval(eventId: string, approverMembershipId: string, comments?: string): Promise<boolean> {
      patchState(store, { loading: true, error: null });
      
      try {
        const newApproval = await lastValueFrom(
          approvalsService.createApproval(eventId, { approver_membership_id: approverMembershipId, comments })
        );

        if (newApproval) {
          patchState(store, {
            approvals: [newApproval, ...store.approvals()],
            loading: false,
          });
          toastService.success('Approval requested successfully');
          return true;
        }

        patchState(store, { loading: false });
        return false;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to request approval';
        patchState(store, { error: message, loading: false });
        toastService.error(message);
        return false;
      }
    },

    // Process approval (approve or reject)
    async processApproval(
      eventId: string,
      approvalId: string,
      action: 'approve' | 'reject',
      comments?: string
    ): Promise<boolean> {
      patchState(store, { loading: true, error: null });
      
      try {
        const updatedApproval = await lastValueFrom(
          approvalsService.processApproval(
            eventId,
            approvalId,
            { action, comments }
          )
        );

        if (updatedApproval) {
          // Update in the approvals list
          const updatedApprovals = store.approvals().map(a =>
            a.id === approvalId ? updatedApproval : a
          );
          
          patchState(store, {
            approvals: updatedApprovals,
            selectedApproval: updatedApproval,
            loading: false,
          });
          
          const actionLabel = action === 'approve' ? 'approved' : 'rejected';
          toastService.success(`Approval ${actionLabel} successfully`);
          return true;
        }

        patchState(store, { loading: false });
        return false;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to process approval';
        patchState(store, { error: message, loading: false });
        toastService.error(message);
        return false;
      }
    },

    // Reset store state
    reset(): void {
      patchState(store, initialState);
    },
  }))
);
