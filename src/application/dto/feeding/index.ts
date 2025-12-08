// Application DTOs for Feeding
// Input/Output types for Application Services

export interface CreateFoodTypeInput {
  name: string;
  description?: string;
  unit?: string;
  isActive?: boolean;
}

export interface UpdateFoodTypeInput {
  name?: string;
  description?: string;
  unit?: string;
  isActive?: boolean;
}

export interface FoodTypeOutput {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFeedingRecordInput {
  tankId: string;
  foodTypeId?: string;
  food: string;
  quantity: number;
  unit?: 'ml' | 'g' | 'und';
  date?: Date | string;
}

export interface FeedingRecordOutput {
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

export interface NextFeedingOutput {
  lastFeeding: FeedingRecordOutput | null;
  nextFeedingTime: string;
  timeLeft: string;
  feedingIntervalHours: number;
  tankId?: string;
}

// Feeding Schedule DTOs
export interface CreateFeedingScheduleInput {
  tankId: string;
  feedingTimes: string[];
  isActive?: boolean;
  notes?: string;
}

export interface UpdateFeedingScheduleInput {
  feedingTimes?: string[];
  isActive?: boolean;
  notes?: string;
}

export interface FeedingScheduleOutput {
  id: string;
  tankId: string;
  feedingTimes: string[];
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DefaultFeedingSettingsOutput {
  id: string;
  feedingTimes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateDefaultFeedingSettingsInput {
  feedingTimes?: string[];
}


// Next feeding por tanque
export interface TankNextFeedingOutput {
  tankId: string;
  tankName: string;
  lastFeeding: FeedingRecordOutput | null;
  nextFeedingTime: string;
  timeLeft: string;
  feedingIntervalHours: number;
  feedingTimes: string[];
  isOverdue: boolean;
}

export interface AllTanksNextFeedingOutput {
  tanks: TankNextFeedingOutput[];
  defaultSettings: DefaultFeedingSettingsOutput | null;
}

// Diets
export interface DietItemInput {
  foodTypeId: string;
  quantity: number;
  dayRangeStart?: number;
  dayRangeEnd?: number;
  sortOrder?: number;
  notes?: string;
}

export interface CreateDietInput {
  name: string;
  phase: 'juvenil' | 'jovem' | 'adulto';
  isActive?: boolean;
  notes?: string;
  items: DietItemInput[];
}

export interface UpdateDietInput {
  name?: string;
  phase?: 'juvenil' | 'jovem' | 'adulto';
  isActive?: boolean;
  notes?: string;
  items?: DietItemInput[];
}

export interface DietItemOutput extends DietItemInput {
  id: string;
  dietId: string;
  foodType?: {
    id: string;
    name: string;
    unit: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DietOutput {
  id: string;
  tankId: string | null; // Pode ser null para templates
  name: string;
  phase: 'juvenil' | 'jovem' | 'adulto';
  isActive: boolean;
  startedAt: Date | null;
  endedAt: Date | null;
  notes?: string;
  items: DietItemOutput[];
  createdAt: Date;
  updatedAt: Date;
}

// Tank Diets
export * from './tank-diet.dto';
