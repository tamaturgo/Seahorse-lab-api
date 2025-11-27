import { Module } from '@nestjs/common';
import { ChecklistController } from '../presentation/controllers/checklist';
import { TaskExecutionController } from '../presentation/controllers/checklist/task-execution.controller';
import { ChecklistService } from '../application/services/checklist';
import { TaskExecutionService } from '../application/services/checklist/task-execution.service';
import { ChecklistTaskRepository } from '../infrastructure/repositories/checklist-task.repository';
import { TaskExecutionRepository } from '../infrastructure/repositories/task-execution.repository';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from './auth.module';

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [ChecklistController, TaskExecutionController],
  providers: [
    ChecklistService,
    TaskExecutionService,
    {
      provide: 'IChecklistTaskRepository',
      useClass: ChecklistTaskRepository,
    },
    TaskExecutionRepository,
  ],
  exports: [ChecklistService, TaskExecutionService],
})
export class ChecklistModule {}