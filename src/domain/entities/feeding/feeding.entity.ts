// Contexto: Feeding - Entidades relacionadas à alimentação
export class FeedingRecord {
  id: string;
  tankId: string;
  foodTypeId?: string;
  food: string;
  quantity: number;
  unit: 'ml' | 'g' | 'und';
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
  feedingTimes: string[]; // Horários fixos de alimentação (ex: ["08:00", "12:00", "16:00", "20:00"])
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DefaultFeedingSettings {
  id: string;
  feedingTimes: string[]; // Horários padrão de alimentação
  createdAt: Date;
  updatedAt: Date;
}