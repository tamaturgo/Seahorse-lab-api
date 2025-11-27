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