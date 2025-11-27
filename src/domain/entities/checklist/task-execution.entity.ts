export class TaskExecution {
  id: string;
  taskId: string;
  userId: string;
  date: Date;
  completed: boolean;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<TaskExecution>) {
    Object.assign(this, partial);
  }
}
