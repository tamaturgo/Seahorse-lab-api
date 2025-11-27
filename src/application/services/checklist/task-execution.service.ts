import { Injectable } from '@nestjs/common';
import { TaskExecutionRepository } from '../../../infrastructure/repositories/task-execution.repository';
import { TaskExecution } from '../../../domain/entities/checklist/task-execution.entity';
import { CreateTaskExecutionDto } from '../../../presentation/dto/checklist/task-execution.dto';

@Injectable()
export class TaskExecutionService {
  constructor(
    private readonly taskExecutionRepository: TaskExecutionRepository,
  ) {}

  async create(userId: string, dto: CreateTaskExecutionDto): Promise<TaskExecution> {
    return this.taskExecutionRepository.create({
      taskId: dto.taskId,
      userId,
      date: dto.date ? new Date(dto.date) : new Date(),
      completed: dto.completed ?? true,
      notes: dto.notes,
    });
  }

  async toggle(userId: string, taskId: string, date?: string): Promise<TaskExecution> {
    const dateStr = date || new Date().toISOString().split('T')[0];
    return this.taskExecutionRepository.toggle(taskId, userId, dateStr);
  }

  async getByDate(date?: string): Promise<TaskExecution[]> {
    const dateStr = date || new Date().toISOString().split('T')[0];
    return this.taskExecutionRepository.findByDate(dateStr);
  }

  async getByDateAndUser(userId: string, date?: string): Promise<TaskExecution[]> {
    const dateStr = date || new Date().toISOString().split('T')[0];
    return this.taskExecutionRepository.findByDateAndUser(dateStr, userId);
  }
}
