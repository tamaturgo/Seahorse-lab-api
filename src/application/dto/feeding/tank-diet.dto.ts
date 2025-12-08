// Application DTOs for Tank Diets

export interface CreateTankDietInput {
  tankId: string;
  dietId: string;
  birthDate: Date | string;
}

export interface TankDietOutput {
  id: string;
  tankId: string;
  dietId: string;
  isActive: boolean;
  birthDate: Date;
  startedAt: Date;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Campos computados
  currentDayOfLife?: number;
  activeDietItems?: any[];
}
