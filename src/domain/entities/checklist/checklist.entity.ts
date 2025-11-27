// Contexto: Checklist - Entidades relacionadas ao checklist diário

// Configuração global do checklist
export class ChecklistTask {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ChecklistParameter {
  id: string;
  name: string;
  unit?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Execução diária do checklist
export class DailyChecklist {
  id: string;
  date: Date;
  completedBy?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class DailyChecklistTaskExecution {
  id: string;
  dailyChecklistId: string;
  taskId: string;
  completed: boolean;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DailyChecklistParameterReading {
  id: string;
  dailyChecklistId: string;
  parameterId: string;
  tankId: string;
  value: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DailyChecklistFeedingRecord {
  id: string;
  dailyChecklistId: string;
  tankId: string;
  systemId: string;
  foodType: string;
  quantity: number;
  completedAt: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}