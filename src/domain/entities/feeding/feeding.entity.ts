// Contexto: Feeding - Entidades relacionadas à alimentação
export class FeedingRecord {
  id: string;
  tankId: string;
  food: string;
  quantity: number;
  date: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class FoodType {
  id: string;
  name: string;
  code: string; // ex: artemia-viva
  unit: string; // ex: ml
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class FeedingSchedule {
  id: string;
  tankId: string;
  intervalHours: number; // Intervalo entre alimentações em horas
  startTime: string; // Horário de início (ex: "08:00:00")
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DefaultFeedingSettings {
  id: string;
  intervalHours: number;
  startTime: string;
  createdAt: Date;
  updatedAt: Date;
}