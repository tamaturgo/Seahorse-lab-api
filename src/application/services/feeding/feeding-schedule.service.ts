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

// Cache para próximas alimentações
let nextFeedingCache: AllTanksNextFeedingOutput | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 600000; // 10 minuto

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

  // Invalidar cache (chamado quando há mudanças)
  public invalidateCache(): void {
    nextFeedingCache = null;
    cacheTimestamp = 0;
  }

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
      feedingTimes: input.feedingTimes,
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
      feedingTimes: input.feedingTimes,
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
      feedingTimes: input.feedingTimes,
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

    const feedingTimes = schedule?.feedingTimes ?? defaultSettings?.feedingTimes ?? ['08:00', '12:00', '16:00', '20:00'];

    // Buscar último registro de alimentação do tanque
    const records = await this.feedingRecordRepository.findByTankId(tankId);
    const lastRecord = records.length > 0 ? records[0] : null;

    // Calcular próxima alimentação
    const { nextFeedingTime, timeLeft, isOverdue } = this.calculateNextFeedingFromTimes(
      lastRecord?.date,
      feedingTimes,
    );

    return {
      tankId: tankInfo.id,
      tankName: tankInfo.name,
      lastFeeding: lastRecord ? this.toFeedingRecordOutput(lastRecord) : null,
      nextFeedingTime,
      timeLeft,
      feedingIntervalHours: 0, // Deprecated - mantido por compatibilidade
      feedingTimes,
      isOverdue,
    };
  }

  async getAllTanksNextFeeding(): Promise<AllTanksNextFeedingOutput> {
    // Verificar cache
    const now = Date.now();
    if (nextFeedingCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return nextFeedingCache;
    }

    // Buscar configurações padrão uma vez
    const defaultSettings = await this.scheduleRepository.getDefaultSettings();
    const defaultTimes = defaultSettings?.feedingTimes ?? ['08:00', '12:00', '16:00', '20:00'];

    // Buscar todos os dados necessários em paralelo com uma única query otimizada
    const [tanksResult, schedulesResult, recordsResult] = await Promise.all([
      // Tanques ativos
      this.supabase
        .from('tanks')
        .select('id, name, system_id')
        .eq('status', 'active')
        .order('name'),
      
      // Todas as programações de uma vez
      this.supabase
        .from('feeding_schedules')
        .select('*'),
      
      // Últimos registros de cada tanque usando uma query otimizada
      this.supabase
        .from('feeding_records')
        .select('tank_id, date, food, quantity, user_id, created_at, updated_at, id')
        .order('date', { ascending: false })
        .limit(100), // Limitar para performance
    ]);

    if (tanksResult.error) {
      throw new Error(`Erro ao buscar tanques: ${tanksResult.error.message}`);
    }

    const tanks = tanksResult.data || [];
    const schedules = schedulesResult.data || [];
    const allRecords = recordsResult.data || [];

    // Criar mapas para acesso rápido
    const scheduleMap = new Map(
      schedules.map(s => [s.tank_id, s])
    );

    // Agrupar registros por tanque (pegar o mais recente de cada)
    const recordsByTank = new Map<string, any>();
    for (const record of allRecords) {
      if (!recordsByTank.has(record.tank_id)) {
        recordsByTank.set(record.tank_id, record);
      }
    }

    // Processar todos os tanques em paralelo
    const tanksNextFeeding: TankNextFeedingOutput[] = tanks.map(tank => {
      const schedule = scheduleMap.get(tank.id) as any;
      const feedingTimes = schedule?.feeding_times ?? defaultTimes;
      const lastRecord = recordsByTank.get(tank.id);

      const { nextFeedingTime, timeLeft, isOverdue } = this.calculateNextFeedingFromTimes(
        lastRecord?.date ? new Date(lastRecord.date) : null,
        feedingTimes,
      );

      return {
        tankId: tank.id,
        tankName: tank.name,
        lastFeeding: lastRecord ? {
          id: lastRecord.id,
          tankId: lastRecord.tank_id,
          food: lastRecord.food,
          quantity: lastRecord.quantity,
          date: lastRecord.date,
          userId: lastRecord.user_id,
          createdAt: lastRecord.created_at,
          updatedAt: lastRecord.updated_at,
        } : null,
        nextFeedingTime,
        timeLeft,
        feedingIntervalHours: 0, // Deprecated
        feedingTimes,
        isOverdue,
      };
    });

    // Ordenar por urgência
    tanksNextFeeding.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return 0;
    });

    const result = {
      tanks: tanksNextFeeding,
      defaultSettings: defaultSettings ? this.toDefaultSettingsOutput(defaultSettings) : null,
    };

    // Atualizar cache
    nextFeedingCache = result;
    cacheTimestamp = now;

    return result;
  }

  private mapToScheduleEntity(data: any): FeedingSchedule {
    return {
      id: data.id,
      tankId: data.tank_id,
      feedingTimes: data.feeding_times,
      isActive: data.is_active,
      notes: data.notes,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  // ========== Private Methods ==========

  private calculateNextFeedingFromTimes(
    lastFeedingDate: Date | undefined | null,
    feedingTimes: string[],
  ): { nextFeedingTime: string; timeLeft: string; isOverdue: boolean } {
    const now = new Date();
    let nextFeedingTime: Date | null = null;
    let isOverdue = false;

    // Converter horários de string para Date de hoje
    const todayTimes = feedingTimes.map(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const date = new Date(now);
      date.setHours(hours, minutes, 0, 0);
      return date;
    }).sort((a, b) => a.getTime() - b.getTime());

    // Encontrar próximo horário hoje
    nextFeedingTime = todayTimes.find(t => t > now) || null;

    // Se não encontrou hoje, usar o primeiro horário de amanhã
    if (!nextFeedingTime && todayTimes.length > 0) {
      nextFeedingTime = new Date(todayTimes[0]);
      nextFeedingTime.setDate(nextFeedingTime.getDate() + 1);
    }

    // Se não há horários definidos, usar padrão
    if (!nextFeedingTime) {
      nextFeedingTime = new Date(now);
      nextFeedingTime.setHours(8, 0, 0, 0);
      if (nextFeedingTime <= now) {
        nextFeedingTime.setDate(nextFeedingTime.getDate() + 1);
      }
    }

    // Verificar se está atrasado (se houve alimentação anterior)
    if (lastFeedingDate) {
      const lastDate = new Date(lastFeedingDate);
      
      // Encontrar qual deveria ser o próximo horário depois da última alimentação
      const expectedNextTimes = feedingTimes.map(time => {
        const [hours, minutes] = time.split(':').map(Number);
        const date = new Date(lastDate);
        date.setHours(hours, minutes, 0, 0);
        
        // Se o horário é antes da última alimentação, considerar para o próximo dia
        if (date <= lastDate) {
          date.setDate(date.getDate() + 1);
        }
        return date;
      }).sort((a, b) => a.getTime() - b.getTime());

      const expectedNext = expectedNextTimes[0];
      if (expectedNext && now > expectedNext) {
        isOverdue = true;
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
      feedingTimes: schedule.feedingTimes,
      isActive: schedule.isActive,
      notes: schedule.notes,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };
  }

  private toDefaultSettingsOutput(settings: DefaultFeedingSettings): DefaultFeedingSettingsOutput {
    return {
      id: settings.id,
      feedingTimes: settings.feedingTimes,
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
      unit: record.unit || 'ml',
      date: record.date,
      userId: record.userId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
