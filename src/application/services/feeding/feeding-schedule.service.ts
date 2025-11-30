import { Injectable, Inject } from '@nestjs/common';
import type { IFeedingScheduleRepository } from '../../../infrastructure/repositories/feeding-schedule.repository';
import type { IFeedingRecordRepository } from '../../../infrastructure/repositories/feeding-record.repository';
import { FeedingSchedule, DefaultFeedingSettings } from '../../../domain/entities/feeding';
import { EntityNotFoundException } from '../../../domain/exceptions';
import type {
  CreateFeedingScheduleInput,
  UpdateFeedingScheduleInput,
  FeedingScheduleOutput,
  DefaultFeedingSettingsOutput,
  UpdateDefaultFeedingSettingsInput,
  TankNextFeedingOutput,
  AllTanksNextFeedingOutput,
  FeedingRecordOutput,
} from '../../dto/feeding';

// Interface para buscar informações do tanque
interface TankInfo {
  id: string;
  name: string;
  systemId: string;
}

@Injectable()
export class FeedingScheduleService {
  constructor(
    @Inject('IFeedingScheduleRepository')
    private readonly scheduleRepository: IFeedingScheduleRepository,
    @Inject('IFeedingRecordRepository')
    private readonly feedingRecordRepository: IFeedingRecordRepository,
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: any,
  ) {}

  // ========== Feeding Schedules (por tanque) ==========

  async findAll(): Promise<FeedingScheduleOutput[]> {
    const schedules = await this.scheduleRepository.findAll();
    return schedules.map(this.toScheduleOutput);
  }

  async findByTankId(tankId: string): Promise<FeedingScheduleOutput | null> {
    const schedule = await this.scheduleRepository.findByTankId(tankId);
    return schedule ? this.toScheduleOutput(schedule) : null;
  }

  async create(input: CreateFeedingScheduleInput): Promise<FeedingScheduleOutput> {
    // Verificar se já existe uma programação para este tanque
    const existing = await this.scheduleRepository.findByTankId(input.tankId);
    if (existing) {
      // Atualizar ao invés de criar
      return this.update(input.tankId, input);
    }

    const schedule = await this.scheduleRepository.create({
      tankId: input.tankId,
      intervalHours: input.intervalHours,
      startTime: input.startTime,
      isActive: input.isActive ?? true,
      notes: input.notes,
    });

    return this.toScheduleOutput(schedule);
  }

  async update(tankId: string, input: UpdateFeedingScheduleInput): Promise<FeedingScheduleOutput> {
    const existing = await this.scheduleRepository.findByTankId(tankId);
    if (!existing) {
      throw new EntityNotFoundException('Programação de alimentação', tankId);
    }

    const updated = await this.scheduleRepository.update(tankId, {
      intervalHours: input.intervalHours,
      startTime: input.startTime,
      isActive: input.isActive,
      notes: input.notes,
    });

    return this.toScheduleOutput(updated);
  }

  async delete(tankId: string): Promise<void> {
    const existing = await this.scheduleRepository.findByTankId(tankId);
    if (!existing) {
      throw new EntityNotFoundException('Programação de alimentação', tankId);
    }

    await this.scheduleRepository.delete(tankId);
  }

  // ========== Default Settings ==========

  async getDefaultSettings(): Promise<DefaultFeedingSettingsOutput | null> {
    const settings = await this.scheduleRepository.getDefaultSettings();
    return settings ? this.toDefaultSettingsOutput(settings) : null;
  }

  async updateDefaultSettings(input: UpdateDefaultFeedingSettingsInput): Promise<DefaultFeedingSettingsOutput> {
    const updated = await this.scheduleRepository.updateDefaultSettings({
      intervalHours: input.intervalHours,
      startTime: input.startTime,
    });

    return this.toDefaultSettingsOutput(updated);
  }

  // ========== Next Feeding Calculation ==========

  async getNextFeedingForTank(tankId: string): Promise<TankNextFeedingOutput> {
    // Buscar informações do tanque
    const tankInfo = await this.getTankInfo(tankId);
    if (!tankInfo) {
      throw new EntityNotFoundException('Tanque', tankId);
    }

    // Buscar programação do tanque ou usar configurações padrão
    const schedule = await this.scheduleRepository.findByTankId(tankId);
    const defaultSettings = await this.scheduleRepository.getDefaultSettings();

    const intervalHours = schedule?.intervalHours ?? defaultSettings?.intervalHours ?? 4;
    const startTime = schedule?.startTime ?? defaultSettings?.startTime ?? '08:00:00';

    // Buscar último registro de alimentação do tanque
    const records = await this.feedingRecordRepository.findByTankId(tankId);
    const lastRecord = records.length > 0 ? records[0] : null;

    // Calcular próxima alimentação
    const { nextFeedingTime, timeLeft, isOverdue } = this.calculateNextFeeding(
      lastRecord?.date,
      intervalHours,
      startTime,
    );

    return {
      tankId: tankInfo.id,
      tankName: tankInfo.name,
      lastFeeding: lastRecord ? this.toFeedingRecordOutput(lastRecord) : null,
      nextFeedingTime,
      timeLeft,
      feedingIntervalHours: intervalHours,
      isOverdue,
    };
  }

  async getAllTanksNextFeeding(): Promise<AllTanksNextFeedingOutput> {
    // Buscar todos os tanques ativos
    const { data: tanks, error } = await this.supabase
      .from('tanks')
      .select('id, name, system_id')
      .eq('status', 'active')
      .order('name');

    if (error) {
      throw new Error(`Erro ao buscar tanques: ${error.message}`);
    }

    // Buscar próxima alimentação para cada tanque
    const tanksNextFeeding: TankNextFeedingOutput[] = [];
    for (const tank of tanks || []) {
      try {
        const nextFeeding = await this.getNextFeedingForTank(tank.id);
        tanksNextFeeding.push(nextFeeding);
      } catch (e) {
        // Se houver erro para um tanque específico, continuar com os outros
        console.error(`Erro ao calcular próxima alimentação para tanque ${tank.id}:`, e);
      }
    }

    // Ordenar por tempo restante (mais urgente primeiro)
    tanksNextFeeding.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return 0;
    });

    const defaultSettings = await this.scheduleRepository.getDefaultSettings();

    return {
      tanks: tanksNextFeeding,
      defaultSettings: defaultSettings ? this.toDefaultSettingsOutput(defaultSettings) : null,
    };
  }

  // ========== Private Methods ==========

  private calculateNextFeeding(
    lastFeedingDate: Date | undefined | null,
    intervalHours: number,
    startTime: string,
  ): { nextFeedingTime: string; timeLeft: string; isOverdue: boolean } {
    const now = new Date();
    let nextFeedingTime: Date;
    let isOverdue = false;

    if (lastFeedingDate) {
      // Calcular próxima alimentação baseada no último registro + intervalo
      const lastDate = new Date(lastFeedingDate);
      nextFeedingTime = new Date(lastDate.getTime() + intervalHours * 60 * 60 * 1000);

      // Se já passou, marcar como atrasado
      if (nextFeedingTime < now) {
        isOverdue = true;
      }
    } else {
      // Se não há registros, usar horários baseados no startTime
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const feedingTimes: Date[] = [];

      // Gerar todos os horários de alimentação do dia
      for (let i = 0; i < 24 / intervalHours; i++) {
        const feedingTime = new Date(now);
        feedingTime.setHours(startHour + i * intervalHours, startMinute, 0, 0);
        feedingTimes.push(feedingTime);
      }

      // Encontrar o próximo horário
      nextFeedingTime = feedingTimes.find((t) => t > now) || feedingTimes[0];

      // Se não encontrou hoje, usar o primeiro do dia seguinte
      if (nextFeedingTime <= now) {
        nextFeedingTime = new Date(now);
        nextFeedingTime.setDate(nextFeedingTime.getDate() + 1);
        nextFeedingTime.setHours(startHour, startMinute, 0, 0);
      }
    }

    // Calcular tempo restante
    const diffMs = nextFeedingTime.getTime() - now.getTime();
    const diffMins = Math.floor(Math.abs(diffMs) / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    let timeLeft: string;
    if (isOverdue) {
      if (hours > 0) {
        timeLeft = `Atrasado ${hours}h ${mins}min`;
      } else if (mins > 0) {
        timeLeft = `Atrasado ${mins}min`;
      } else {
        timeLeft = 'Agora!';
      }
    } else {
      if (hours > 0) {
        timeLeft = `${hours}h ${mins}min`;
      } else if (mins > 0) {
        timeLeft = `${mins}min`;
      } else {
        timeLeft = 'Agora!';
      }
    }

    return {
      nextFeedingTime: nextFeedingTime.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      timeLeft,
      isOverdue,
    };
  }

  private async getTankInfo(tankId: string): Promise<TankInfo | null> {
    const { data, error } = await this.supabase
      .from('tanks')
      .select('id, name, system_id')
      .eq('id', tankId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Erro ao buscar tanque: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      systemId: data.system_id,
    };
  }

  private toScheduleOutput(schedule: FeedingSchedule): FeedingScheduleOutput {
    return {
      id: schedule.id,
      tankId: schedule.tankId,
      intervalHours: schedule.intervalHours,
      startTime: schedule.startTime,
      isActive: schedule.isActive,
      notes: schedule.notes,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };
  }

  private toDefaultSettingsOutput(settings: DefaultFeedingSettings): DefaultFeedingSettingsOutput {
    return {
      id: settings.id,
      intervalHours: settings.intervalHours,
      startTime: settings.startTime,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }

  private toFeedingRecordOutput(record: any): FeedingRecordOutput {
    return {
      id: record.id,
      tankId: record.tankId,
      food: record.food,
      quantity: record.quantity,
      date: record.date,
      userId: record.userId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
