import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../infrastructure/guards/jwt-auth.guard';
import { CurrentUser } from '../../../infrastructure/decorators/current-user.decorator';
import { TaskExecutionService } from '../../../application/services/checklist/task-execution.service';
import { CreateTaskExecutionDto, TaskExecutionResponseDto } from '../../dto/checklist/task-execution.dto';

@ApiTags('checklist')
@Controller('checklist/task-executions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TaskExecutionController {
  constructor(private readonly taskExecutionService: TaskExecutionService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar execução de tarefa' })
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateTaskExecutionDto,
  ): Promise<TaskExecutionResponseDto> {
    return this.taskExecutionService.create(user.id, dto);
  }

  @Post('toggle')
  @ApiOperation({ summary: 'Alternar status de tarefa (completado/não completado)' })
  async toggle(
    @CurrentUser() user: any,
    @Query('taskId') taskId: string,
    @Query('date') date?: string,
  ): Promise<TaskExecutionResponseDto> {
    return this.taskExecutionService.toggle(user.id, taskId, date);
  }

  @Get()
  @ApiOperation({ summary: 'Listar execuções de tarefas por data' })
  async getByDate(
    @Query('date') date?: string,
  ): Promise<TaskExecutionResponseDto[]> {
    return this.taskExecutionService.getByDate(date);
  }

  @Get('my')
  @ApiOperation({ summary: 'Listar minhas execuções de tarefas por data' })
  async getMyExecutions(
    @CurrentUser() user: any,
    @Query('date') date?: string,
  ): Promise<TaskExecutionResponseDto[]> {
    return this.taskExecutionService.getByDateAndUser(user.id, date);
  }
}
