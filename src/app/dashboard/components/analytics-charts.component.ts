import { Component, ChangeDetectionStrategy, inject, computed, OnInit } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { AnalyticsStore } from '../../analytics/stores/analytics.store';
import { SkeletonLoaderComponent } from '@shared/components/skeleton-loader/skeleton-loader.component';
import type { EChartsOption } from 'echarts';

@Component({
  selector: 'app-analytics-charts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxEchartsDirective, SkeletonLoaderComponent],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
      <div class="p-5 border-b border-gray-200">
        <h2 class="text-base font-bold text-gray-900">Analytics Overview</h2>
      </div>

      <div class="p-5">
        @if (analyticsStore.loading()) {
          <app-skeleton-loader variant="card" [count]="2" />
        } @else {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <!-- Event Volume Trend -->
            <div>
              <h3 class="text-sm font-semibold text-gray-700 mb-3">Event Volume</h3>
              <div echarts [options]="eventVolumeOptions()" class="w-full h-64"></div>
            </div>

            <!-- Approval Metrics -->
            <div>
              <h3 class="text-sm font-semibold text-gray-700 mb-3">Approval Status</h3>
              <div echarts [options]="approvalMetricsOptions()" class="w-full h-64"></div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class AnalyticsChartsComponent implements OnInit {
  readonly analyticsStore = inject(AnalyticsStore);

  ngOnInit(): void {
    if (!this.analyticsStore.hasData()) {
      this.analyticsStore.loadMetrics();
    }
  }

  readonly eventVolumeOptions = computed<EChartsOption>(() => {
    const metrics = this.analyticsStore.metrics();
    const dailyData = metrics?.event_metrics?.events_created_daily ?? [];

    return {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        data: dailyData.map(d => d.date),
        axisLabel: { fontSize: 11 },
      },
      yAxis: { type: 'value', minInterval: 1 },
      series: [
        {
          name: 'Events Created',
          type: 'line',
          data: dailyData.map(d => d.count),
          smooth: true,
          lineStyle: { color: '#3b82f6', width: 2 },
          areaStyle: {
            color: {
              type: 'linear' as const,
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
              ],
            },
          },
          itemStyle: { color: '#3b82f6' },
        },
      ],
    };
  });

  readonly approvalMetricsOptions = computed<EChartsOption>(() => {
    const metrics = this.analyticsStore.metrics();
    const approvalMetrics = metrics?.approval_metrics;

    return {
      tooltip: { trigger: 'item' },
      series: [
        {
          name: 'Approvals',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, formatter: '{b}: {c}', fontSize: 11 },
          data: [
            {
              value: approvalMetrics?.pending_approvals ?? 0,
              name: 'Pending',
              itemStyle: { color: '#f59e0b' },
            },
            {
              value: approvalMetrics?.approved_count ?? 0,
              name: 'Approved',
              itemStyle: { color: '#10b981' },
            },
            {
              value: approvalMetrics?.rejected_count ?? 0,
              name: 'Rejected',
              itemStyle: { color: '#ef4444' },
            },
          ],
        },
      ],
    };
  });
}
