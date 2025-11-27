import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IFeedingRecordRepository } from '../../../infrastructure/repositories/feeding-record.repository';
import { FeedingRecord } from '../../../domain/entities/feeding';
import { CreateFeedingRecordDto, FeedingRecordResponseDto } from '../../../presentation/dto/feeding';

@Injectable()
export class FeedingRecordService {
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
      throw new NotFoundException('Registro de alimentação não encontrado');
    }
    return this.toResponseDto(record);
  }

  async findByTankId(tankId: string): Promise<FeedingRecordResponseDto[]> {
    const records = await this.feedingRecordRepository.findByTankId(tankId);
    return records.map(this.toResponseDto);
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
