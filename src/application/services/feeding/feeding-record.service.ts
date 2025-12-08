import { Injectable, Inject } from '@nestjs/common';
import type { IFeedingRecordRepository } from '../../../infrastructure/repositories/feeding-record.repository';
import type { IFeedingScheduleRepository } from '../../../infrastructure/repositories/feeding-schedule.repository';
import { FeedingRecord } from '../../../domain/entities/feeding';
import { EntityNotFoundException } from '../../../domain/exceptions';
import { CreateFeedingRecordDto, FeedingRecordResponseDto } from '../../../presentation/dto/feeding';
import type { NextFeedingOutput } from '../../dto/feeding';
import { FeedingScheduleService } from './feeding-schedule.service';

@Injectable()
export class FeedingRecordService {
  constructor(
    @Inject('IFeedingRecordRepository')
    private readonly feedingRecordRepository: IFeedingRecordRepository,
    @Inject('IFeedingScheduleRepository')
    private readonly feedingScheduleRepository: IFeedingScheduleRepository,
    @Inject(FeedingScheduleService)
    private readonly feedingScheduleService: FeedingScheduleService,
  ) {}

  async create(userId: string, createDto: CreateFeedingRecordDto): Promise<FeedingRecordResponseDto> {
    const feedingRecord: Partial<FeedingRecord> = {
      tankId: createDto.tankId,
      foodTypeId: createDto.foodTypeId,
      food: createDto.food,
      quantity: createDto.quantity,
      unit: createDto.unit || 'ml',
      date: createDto.date ? new Date(createDto.date) : new Date(),
      userId,
    };

    const created = await this.feedingRecordRepository.create(feedingRecord);
    
    // Invalidar cache de próximas alimentações
    this.feedingScheduleService.invalidateCache();
    
    return this.toResponseDto(created);
  }

  async findAll(filters?: { tankId?: string; startDate?: string; endDate?: string }): Promise<FeedingRecordResponseDto[]> {
    const parsedFilters = {
      tankId: filters?.tankId,
      startDate: filters?.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters?.endDate ? new Date(filters.endDate) : undefined,
    };

    const records = await this.feedingRecordRepository.findAll(parsedFilters);
    return records.map(this.toResponseDto);
  }

  async findById(id: string): Promise<FeedingRecordResponseDto> {
    const record = await this.feedingRecordRepository.findById(id);
    if (!record) {
      throw new EntityNotFoundException('Registro de alimentação', id);
    }
    return this.toResponseDto(record);
  }

  async findByTankId(tankId: string): Promise<FeedingRecordResponseDto[]> {
    const records = await this.feedingRecordRepository.findByTankId(tankId);
    return records.map(this.toResponseDto);
  }

  async getNextFeeding(): Promise<NextFeedingOutput> {
    // Usa o último registro global para derivar o tanque e aplicar horários configurados (schedule ou default)
    const allRecords = await this.feedingRecordRepository.findAll({});
    const lastRecord = allRecords.length > 0 ? allRecords[0] : null;

    const now = new Date();

    // Buscar horários configurados a partir do tanque do último registro
    let feedingTimes = ['08:00', '12:00', '16:00', '20:00'];
    if (lastRecord?.tankId) {
      const schedule = await this.feedingScheduleRepository.findByTankId(lastRecord.tankId);
      const defaults = await this.feedingScheduleRepository.getDefaultSettings();
      feedingTimes = schedule?.feedingTimes ?? defaults?.feedingTimes ?? ['08:00', '12:00', '16:00', '20:00'];
    } else {
      const defaults = await this.feedingScheduleRepository.getDefaultSettings();
      feedingTimes = defaults?.feedingTimes ?? ['08:00', '12:00', '16:00', '20:00'];
    }

    const nextFeedingTime = this.calculateNextFeedingTimeFromTimes(lastRecord?.date, feedingTimes, now);

    const diffMs = nextFeedingTime.getTime() - now.getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / 60000));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    let timeLeft: string;
    if (hours > 0) {
      timeLeft = `${hours}h ${mins}min`;
    } else if (mins > 0) {
      timeLeft = `${mins}min`;
    } else {
      timeLeft = 'Agora!';
    }

    return {
      lastFeeding: lastRecord ? this.toResponseDto(lastRecord) : null,
      nextFeedingTime: nextFeedingTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      timeLeft,
      feedingIntervalHours: 0, // Deprecated - mantido por compatibilidade
      tankId: lastRecord?.tankId,
    };
  }

  private calculateNextFeedingTimeFromTimes(
    lastFeedingDate: Date | undefined | null,
    feedingTimes: string[],
    now: Date,
  ): Date {
    // Converter horários para Date de hoje
    const todayTimes = feedingTimes.map(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const date = new Date(now);
      date.setHours(hours, minutes, 0, 0);
      return date;
    }).sort((a, b) => a.getTime() - b.getTime());

    // Encontrar próximo horário hoje
    const nextToday = todayTimes.find(t => t > now);
    if (nextToday) return nextToday;

    // Se não encontrou hoje, usar o primeiro horário de amanhã
    if (todayTimes.length > 0) {
      const tomorrow = new Date(todayTimes[0]);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }

    // Fallback: 8h de amanhã
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    return tomorrow;
  }

  private toResponseDto(record: FeedingRecord): FeedingRecordResponseDto {
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
