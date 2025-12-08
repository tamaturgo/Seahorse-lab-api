import { Injectable } from '@nestjs/common';
import { SystemService } from '../systems/system.service';
import { WaterParameterService } from '../water-parameters/water-parameter.service';
import { FeedingRecordService } from '../feeding/feeding-record.service';
import { TaskExecutionService } from '../checklist/task-execution.service';
import { ChecklistService } from '../checklist/checklist.service';
import { AuditLogService } from '../audit/audit-log.service';

export interface DashboardMetrics {
  kpis: {
    totalTanks: number;
    activeTanks: number;
    totalAnimals: number;
    averageOccupancy: number;
    systemsCount: number;
  };
  checklist: {
    totalTasks: number;
    completedTasks: number;
    completionPercentage: number;
    lastCompletedAt: string | null;
    lastCompletedBy: string | null;
  };
  waterQuality: {
    last24h: {
      avgPH: number | null;
      avgTemperature: number | null;
      maxAmmonia: number | null;
      status: 'normal' | 'warning' | 'critical';
    };
  };
  feeding: {
    todayCount: number;
    weekCount: number;
  };
  recentActivity: Array<{
    id: string;
    userName: string | null;
    action: string;
    entityType: string | null;
    entityId: string | null;
    createdAt: string;
  }>;
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly systemService: SystemService,
    private readonly waterParameterService: WaterParameterService,
    private readonly feedingRecordService: FeedingRecordService,
    private readonly taskExecutionService: TaskExecutionService,
    private readonly checklistService: ChecklistService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getAggregatedMetrics(): Promise<DashboardMetrics> {
    const [
      kpis,
      checklist,
      waterQuality,
      feeding,
      recentActivity,
    ] = await Promise.all([
      this.getKPIs(),
      this.getChecklistMetrics(),
      this.getWaterQualityMetrics(),
      this.getFeedingMetrics(),
      this.getRecentActivity(),
    ]);

    return {
      kpis,
      checklist,
      waterQuality,
      feeding,
      recentActivity,
    };
  }

  private async getKPIs() {
    const systems = await this.systemService.findAll();
    const allTanks = systems.flatMap((system) => system.tanks || []);
    const activeTanks = allTanks.filter((tank) => tank.status === 'active');
    const totalAnimals = allTanks.reduce(
      (sum, tank) => sum + (tank.animals || 0),
      0,
    );

    const tanksWithCapacity = allTanks.filter((tank) => tank.capacity > 0);
    const averageOccupancy =
      tanksWithCapacity.length > 0
        ? (tanksWithCapacity.reduce((sum, tank) => {
            const occupancy = (tank.animals || 0) / tank.capacity;
            return sum + occupancy;
          }, 0) /
            tanksWithCapacity.length) *
          100
        : 0;

    return {
      totalTanks: allTanks.length,
      activeTanks: activeTanks.length,
      totalAnimals,
      averageOccupancy: Math.round(averageOccupancy * 10) / 10,
      systemsCount: systems.length,
    };
  }

  private async getChecklistMetrics() {
    const today = new Date().toISOString().split('T')[0];
    const dayOfWeek = new Date()
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();

    const [activeTasks, executions] = await Promise.all([
      this.checklistService.getActiveTasks(dayOfWeek),
      this.taskExecutionService.getByDate(today),
    ]);

    const completedExecutions = executions.filter((e) => e.completed);
    const lastCompleted = completedExecutions.sort(
      (a, b) =>
        new Date(b.completedAt || b.createdAt).getTime() -
        new Date(a.completedAt || a.createdAt).getTime(),
    )[0];

    return {
      totalTasks: activeTasks.length,
      completedTasks: completedExecutions.length,
      completionPercentage:
        activeTasks.length > 0
          ? Math.round((completedExecutions.length / activeTasks.length) * 100)
          : 0,
      lastCompletedAt: lastCompleted?.completedAt 
        ? new Date(lastCompleted.completedAt).toISOString()
        : null,
      lastCompletedBy: lastCompleted?.userId || null,
    };
  }

  private async getWaterQualityMetrics() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startDate = yesterday.toISOString().split('T')[0];

    const parameters = await this.waterParameterService.findAll({
      startDate,
    });

    if (parameters.length === 0) {
      return {
        last24h: {
          avgPH: null,
          avgTemperature: null,
          maxAmmonia: null,
          status: 'normal' as const,
        },
      };
    }

    const avgPH =
      parameters.reduce((sum, p) => sum + p.pH, 0) / parameters.length;
    const avgTemperature =
      parameters.reduce((sum, p) => sum + p.temperature, 0) / parameters.length;
    const maxAmmonia = Math.max(...parameters.map((p) => p.ammonia));

    // Determinar status baseado em thresholds
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    if (
      avgPH < 7.2 ||
      avgPH > 8.8 ||
      avgTemperature < 22 ||
      avgTemperature > 30 ||
      maxAmmonia > 1.0
    ) {
      status = 'critical';
    } else if (
      avgPH < 7.5 ||
      avgPH > 8.5 ||
      avgTemperature < 24 ||
      avgTemperature > 28 ||
      maxAmmonia > 0.5
    ) {
      status = 'warning';
    }

    return {
      last24h: {
        avgPH: Math.round(avgPH * 100) / 100,
        avgTemperature: Math.round(avgTemperature * 10) / 10,
        maxAmmonia: Math.round(maxAmmonia * 100) / 100,
        status,
      },
    };
  }

  private async getFeedingMetrics() {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStartDate = weekAgo.toISOString().split('T')[0];

    const [todayRecords, weekRecords] = await Promise.all([
      this.feedingRecordService.findAll({ startDate: today, endDate: today }),
      this.feedingRecordService.findAll({ startDate: weekStartDate }),
    ]);

    return {
      todayCount: todayRecords.length,
      weekCount: weekRecords.length,
    };
  }

  private async getRecentActivity() {
    const logs = await this.auditLogService.findAll({
      page: 1,
      limit: 8,
    });

    return logs.data.map((log) => ({
      id: log.id,
      userName: log.userName,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      createdAt: new Date(log.createdAt).toISOString(),
    }));
  }
}
