import { Injectable, Inject } from '@nestjs/common';
import type { IFeedingRecordRepository } from '../../../infrastructure/repositories/feeding-record.repository';
import type { IFeedingScheduleRepository } from '../../../infrastructure/repositories/feeding-schedule.repository';
import { FeedingRecord } from '../../../domain/entities/feeding';
import { EntityNotFoundException } from '../../../domain/exceptions';
import { CreateFeedingRecordDto, FeedingRecordResponseDto } from '../../../presentation/dto/feeding';
import type { NextFeedingOutput } from '../../dto/feeding';

@Injectable()
export class FeedingRecordService {
  constructor(
    @Inject('IFeedingRecordRepository')
    private readonly feedingRecordRepository: IFeedingRecordRepository,
    @Inject('IFeedingScheduleRepository')
    private readonly feedingScheduleRepository: IFeedingScheduleRepository,
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
    // Usa o último registro global para derivar o tanque e aplicar intervalo configurado (schedule ou default)
    const allRecords = await this.feedingRecordRepository.findAll({});
    const lastRecord = allRecords.length > 0 ? allRecords[0] : null;

    const now = new Date();

    // Buscar intervalo configurado (se houver) a partir do tanque do último registro
    let intervalHours = 4;
    let startTime = '08:00:00';
    if (lastRecord?.tankId) {
      const schedule = await this.feedingScheduleRepository.findByTankId(lastRecord.tankId);
      const defaults = await this.feedingScheduleRepository.getDefaultSettings();
      intervalHours = schedule?.intervalHours ?? defaults?.intervalHours ?? 4;
      startTime = schedule?.startTime ?? defaults?.startTime ?? '08:00:00';
    } else {
      const defaults = await this.feedingScheduleRepository.getDefaultSettings();
      intervalHours = defaults?.intervalHours ?? 4;
      startTime = defaults?.startTime ?? '08:00:00';
    }

    const nextFeedingTime = this.calculateNextFeedingTime(lastRecord?.date, intervalHours, startTime, now);

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
      feedingIntervalHours: intervalHours,
      tankId: lastRecord?.tankId,
    };
  }

  private calculateNextFeedingTime(
    lastFeedingDate: Date | undefined | null,
    intervalHours: number,
    startTime: string,
    now: Date,
  ): Date {
    if (lastFeedingDate) {
      const next = new Date(lastFeedingDate.getTime() + intervalHours * 60 * 60 * 1000);
      if (next > now) return next;
      // se passou, programe para now + intervalo
      return new Date(now.getTime() + intervalHours * 60 * 60 * 1000);
    }

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const candidate = new Date(now);
    candidate.setHours(startHour, startMinute, 0, 0);
    if (candidate > now) return candidate;
    // gera horários do dia com intervalo e pega o próximo
    const slots: Date[] = [];
    for (let i = 0; i < 24 / intervalHours; i++) {
      const slot = new Date(now);
      slot.setHours(startHour + i * intervalHours, startMinute, 0, 0);
      slots.push(slot);
    }
    const nextToday = slots.find((t) => t > now);
    if (nextToday) return nextToday;
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(startHour, startMinute, 0, 0);
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
