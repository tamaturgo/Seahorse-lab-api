export class TankDiet {
  id: string;
  tankId: string;
  dietId: string;
  isActive: boolean;
  birthDate: Date;
  startedAt: Date;
  endedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
