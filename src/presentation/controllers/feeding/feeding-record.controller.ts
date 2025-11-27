import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../infrastructure/decorators/current-user.decorator';
import { FeedingRecordService } from '../../../application/services/feeding/feeding-record.service';
import { CreateFeedingRecordDto, FeedingRecordResponseDto } from '../../dto/feeding';

@ApiTags('feeding')
@Controller('feeding')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FeedingRecordController {
  constructor(private readonly feedingRecordService: FeedingRecordService) {}

  @Post('records')
  @ApiOperation({ summary: 'Criar registro de alimentação' })
  async create(
    @CurrentUser() user: any,
    @Body() createDto: CreateFeedingRecordDto,
  ): Promise<FeedingRecordResponseDto> {
    return this.feedingRecordService.create(user.id, createDto);
  }

  @Get('records')
  @ApiOperation({ summary: 'Listar registros de alimentação' })
  async findAll(
    @Query('tankId') tankId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<FeedingRecordResponseDto[]> {
    return this.feedingRecordService.findAll({ tankId, startDate, endDate });
  }

  @Get('records/:id')
  @ApiOperation({ summary: 'Buscar registro de alimentação por ID' })
  async findById(@Param('id') id: string): Promise<FeedingRecordResponseDto> {
    return this.feedingRecordService.findById(id);
  }

  @Get('records/tank/:tankId')
  @ApiOperation({ summary: 'Buscar registros de alimentação por tanque' })
  async findByTankId(@Param('tankId') tankId: string): Promise<FeedingRecordResponseDto[]> {
    return this.feedingRecordService.findByTankId(tankId);
  }
}
