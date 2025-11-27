import { ChecklistTask, ChecklistParameter } from '../../entities/checklist';

export interface IChecklistTaskRepository {
  findAll(): Promise<ChecklistTask[]>;
  findAllActive(): Promise<ChecklistTask[]>;
  findById(id: string): Promise<ChecklistTask | null>;
  create(task: Omit<ChecklistTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChecklistTask>;
  update(id: string, task: Partial<ChecklistTask>): Promise<ChecklistTask>;
  delete(id: string): Promise<void>;
  reorder(tasks: { id: string; order: number }[]): Promise<void>;
}

export interface IChecklistParameterRepository {
  findAll(): Promise<ChecklistParameter[]>;
  findAllActive(): Promise<ChecklistParameter[]>;
  findById(id: string): Promise<ChecklistParameter | null>;
  create(param: Omit<ChecklistParameter, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChecklistParameter>;
  update(id: string, param: Partial<ChecklistParameter>): Promise<ChecklistParameter>;
  delete(id: string): Promise<void>;
  reorder(params: { id: string; order: number }[]): Promise<void>;
}