import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ChecklistService } from '../../../application/services/checklist';
import {
  CreateChecklistTaskDto,
  UpdateChecklistTaskDto,
  ReorderTasksDto,
} from '../../dto/checklist';

@ApiTags('checklist')
@Controller('checklist')
export class ChecklistController {
  constructor(private readonly checklistService: ChecklistService) {}

  // ========== TASKS ==========
  @Get('tasks')
  @ApiOperation({ summary: 'Listar todas as tarefas do checklist' })
  @ApiResponse({ status: 200, description: 'Lista de tarefas retornada com sucesso' })
  async getAllTasks() {
    return this.checklistService.getAllTasks();
  }

  @Get('tasks/active')
  @ApiOperation({ summary: 'Listar tarefas ativas do checklist' })
  @ApiResponse({ status: 200, description: 'Lista de tarefas ativas retornada' })
  async getActiveTasks(@Query('day') day?: string) {
    return this.checklistService.getActiveTasks(day);
  }

  @Get('tasks/:id')
  @ApiOperation({ summary: 'Buscar tarefa por ID' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async getTaskById(@Param('id') id: string) {
    return this.checklistService.getTaskById(id);
  }

  @Post('tasks')
  @ApiOperation({ summary: 'Criar nova tarefa' })
  @ApiBody({ type: CreateChecklistTaskDto })
  @ApiResponse({ status: 201, description: 'Tarefa criada com sucesso' })
  async createTask(@Body() createTaskDto: CreateChecklistTaskDto) {
    return this.checklistService.createTask({
      ...createTaskDto,
      order: createTaskDto.order ?? 0,
      isActive: createTaskDto.isActive ?? true,
    });
  }

  @Put('tasks/:id')
  @ApiOperation({ summary: 'Atualizar tarefa' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiBody({ type: UpdateChecklistTaskDto })
  @ApiResponse({ status: 200, description: 'Tarefa atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateChecklistTaskDto,
  ) {
    return this.checklistService.updateTask(id, updateTaskDto);
  }

  @Delete('tasks/:id')
  @ApiOperation({ summary: 'Deletar tarefa' })
  @ApiParam({ name: 'id', description: 'ID da tarefa' })
  @ApiResponse({ status: 200, description: 'Tarefa deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async deleteTask(@Param('id') id: string) {
    await this.checklistService.deleteTask(id);
    return { message: 'Task deleted successfully' };
  }

  @Post('tasks/reorder')
  @ApiOperation({ summary: 'Reordenar tarefas' })
  @ApiResponse({ status: 200, description: 'Tarefas reordenadas com sucesso' })
  async reorderTasks(@Body() reorderDto: ReorderTasksDto[]) {
    await this.checklistService.reorderTasks(reorderDto);
    return { message: 'Tasks reordered successfully' };
  }
}