import { Injectable, Inject } from '@nestjs/common';
import type { IFeedingRecordRepository } from '../../../infrastructure/repositories/feeding-record.repository';
import { FeedingRecord } from '../../../domain/entities/feeding';
import { EntityNotFoundException } from '../../../domain/exceptions';
import { CreateFeedingRecordDto, FeedingRecordResponseDto } from '../../../presentation/dto/feeding';
import type { NextFeedingOutput } from '../../dto/feeding';

@Injectable()
export class FeedingRecordService {
  // Intervalo padrão de alimentação em horas
  private readonly DEFAULT_FEEDING_INTERVAL_HOURS = 4;

  constructor(
    @Inject('IFeedingRecordRepository')
    private readonly feedingRecordRepository: IFeedingRecordRepository,
  ) {}

  async create(userId: string, createDto: CreateFeedingRecordDto): Promise<FeedingRecordResponseDto> {
    const feedingRecord: Partial<FeedingRecord> = {
      tankId: createDto.tankId,
      food: createDto.food,
      quantity: createDto.quantity,
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
    // Buscar último registro de alimentação
    const allRecords = await this.feedingRecordRepository.findAll({});
    const lastRecord = allRecords.length > 0 ? allRecords[0] : null;

    const now = new Date();
    let nextFeedingTime: Date;

    if (lastRecord) {
      // Calcular próxima alimentação baseada no último registro + intervalo
      nextFeedingTime = new Date(lastRecord.date.getTime() + this.DEFAULT_FEEDING_INTERVAL_HOURS * 60 * 60 * 1000);
      
      // Se já passou, definir próxima alimentação como agora + intervalo
      if (nextFeedingTime < now) {
        nextFeedingTime = new Date(now.getTime() + this.DEFAULT_FEEDING_INTERVAL_HOURS * 60 * 60 * 1000);
      }
    } else {
      // Se não há registros, usar horários fixos (08:00, 12:00, 16:00, 20:00)
      const fixedTimes = [8, 12, 16, 20];
      const currentHour = now.getHours();
      
      let nextHour = fixedTimes.find(h => h > currentHour);
      if (!nextHour) {
        // Se já passou de 20h, próxima é 8h do dia seguinte
        nextHour = fixedTimes[0];
        nextFeedingTime = new Date(now);
        nextFeedingTime.setDate(nextFeedingTime.getDate() + 1);
      } else {
        nextFeedingTime = new Date(now);
      }
      nextFeedingTime.setHours(nextHour, 0, 0, 0);
    }

    // Calcular tempo restante
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
      feedingIntervalHours: this.DEFAULT_FEEDING_INTERVAL_HOURS,
    };
  }

  private toResponseDto(record: FeedingRecord): FeedingRecordResponseDto {
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
