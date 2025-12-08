export type DietPhase = 'juvenil' | 'jovem' | 'adulto';

export interface DietItem {
  id: string;
  dietId: string;
  foodTypeId: string;
  quantity: number;
  dayRangeStart?: number;
  dayRangeEnd?: number;
  sortOrder: number;
  notes?: string;
  foodType?: {
    id: string;
    name: string;
    unit: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class Diet {
  id: string;
  tankId: string | null; // Pode ser null para templates
  name: string;
  phase: DietPhase;
  isActive: boolean;
  startedAt?: Date | null;
  endedAt?: Date | null;
  notes?: string;
  items?: DietItem[];
  createdAt: Date;
  updatedAt: Date;
}
