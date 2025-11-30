import { Injectable, Inject } from '@nestjs/common';
import type { IWaterParameterRepository } from '../../../infrastructure/repositories/water-parameter.repository';
import { WaterParameter } from '../../../domain/entities/water-parameters';
import { EntityNotFoundException } from '../../../domain/exceptions';
import { CreateWaterParameterDto, WaterParameterResponseDto } from '../../../presentation/dto/water-parameters';

@Injectable()
export class WaterParameterService {
  constructor(
    @Inject('IWaterParameterRepository')
    private readonly waterParameterRepository: IWaterParameterRepository,
  ) {}

  async create(userId: string, createDto: CreateWaterParameterDto): Promise<WaterParameterResponseDto> {
    const waterParameter: Partial<WaterParameter> = {
      tankId: createDto.tankId,
      systemId: createDto.systemId,
      pH: createDto.pH,
      temperature: createDto.temperature,
      ammonia: createDto.ammonia,
      nitrite: createDto.nitrite,
      nitrate: createDto.nitrate,
      salinity: createDto.salinity,
      measuredAt: createDto.measuredAt ? new Date(createDto.measuredAt) : new Date(),
      notes: createDto.notes,
      userId,
    };

    const created = await this.waterParameterRepository.create(waterParameter);
    return this.toResponseDto(created);
  }

  async findAll(filters?: { systemId?: string; tankId?: string; startDate?: string; endDate?: string }): Promise<WaterParameterResponseDto[]> {
    const parsedFilters = {
      systemId: filters?.systemId,
      tankId: filters?.tankId,
      startDate: filters?.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters?.endDate ? new Date(filters.endDate) : undefined,
    };

    const records = await this.waterParameterRepository.findAll(parsedFilters);
    return records.map(this.toResponseDto);
  }

  async findById(id: string): Promise<WaterParameterResponseDto> {
    const record = await this.waterParameterRepository.findById(id);
    if (!record) {
      throw new EntityNotFoundException('Parâmetros de água', id);
    }
    return this.toResponseDto(record);
  }

  async findBySystemId(systemId: string): Promise<WaterParameterResponseDto[]> {
    const records = await this.waterParameterRepository.findBySystemId(systemId);
    return records.map(this.toResponseDto);
  }

  async findByTankId(tankId: string): Promise<WaterParameterResponseDto[]> {
    const records = await this.waterParameterRepository.findByTankId(tankId);
    return records.map(this.toResponseDto);
  }

  private toResponseDto(record: WaterParameter): WaterParameterResponseDto {
    return {
      id: record.id,
      tankId: record.tankId,
      systemId: record.systemId,
      pH: record.pH,
      temperature: record.temperature,
      ammonia: record.ammonia,
      nitrite: record.nitrite,
      nitrate: record.nitrate,
      salinity: record.salinity,
      measuredAt: record.measuredAt,
      userId: record.userId,
      notes: record.notes,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
