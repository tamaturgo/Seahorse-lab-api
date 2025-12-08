import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../infrastructure/guards/jwt-auth.guard';
import { TankDietService } from '../../../application/services/feeding/tank-diet.service';
import { CreateTankDietDto, TankDietResponseDto } from '../../dto/feeding';

@Controller('tank-diets')
@UseGuards(JwtAuthGuard)
export class TankDietController {
  constructor(private readonly tankDietService: TankDietService) {}

  @Post()
  async create(@Body() dto: CreateTankDietDto): Promise<TankDietResponseDto> {
    const result = await this.tankDietService.create({
      tankId: dto.tankId,
      dietId: dto.dietId,
      birthDate: dto.birthDate,
    });
    return this.toResponseDto(result);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<TankDietResponseDto> {
    const result = await this.tankDietService.findById(id);
    return this.toResponseDto(result);
  }

  @Get('tank/:tankId')
  async findByTankId(@Param('tankId') tankId: string): Promise<TankDietResponseDto[]> {
    const results = await this.tankDietService.findByTankId(tankId);
    return results.map(this.toResponseDto);
  }

  @Get('tank/:tankId/active')
  async findActiveByTankId(@Param('tankId') tankId: string): Promise<TankDietResponseDto | null> {
    const result = await this.tankDietService.findActiveByTankId(tankId);
    return result ? this.toResponseDto(result) : null;
  }

  @Post(':id/deactivate')
  async deactivate(@Param('id') id: string): Promise<TankDietResponseDto> {
    const result = await this.tankDietService.deactivate(id);
    return this.toResponseDto(result);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.tankDietService.delete(id);
  }

  private toResponseDto(output: any): TankDietResponseDto {
    return {
      id: output.id,
      tankId: output.tankId,
      dietId: output.dietId,
      isActive: output.isActive,
      birthDate: output.birthDate instanceof Date 
        ? output.birthDate.toISOString() 
        : output.birthDate,
      startedAt: output.startedAt instanceof Date 
        ? output.startedAt.toISOString() 
        : output.startedAt,
      endedAt: output.endedAt instanceof Date 
        ? output.endedAt.toISOString() 
        : output.endedAt,
      createdAt: output.createdAt instanceof Date 
        ? output.createdAt.toISOString() 
        : output.createdAt,
      updatedAt: output.updatedAt instanceof Date 
        ? output.updatedAt.toISOString() 
        : output.updatedAt,
      currentDayOfLife: output.currentDayOfLife,
      activeDietItems: output.activeDietItems,
    };
  }
}
