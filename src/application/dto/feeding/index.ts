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
  food: string;
  quantity: number;
  date?: Date | string;
}

export interface FeedingRecordOutput {
  id: string;
  tankId: string;
  food: string;
  quantity: number;
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
}

// Feeding Schedule DTOs
export interface CreateFeedingScheduleInput {
  tankId: string;
  intervalHours: number;
  startTime: string;
  isActive?: boolean;
  notes?: string;
}

export interface UpdateFeedingScheduleInput {
  intervalHours?: number;
  startTime?: string;
  isActive?: boolean;
  notes?: string;
}

export interface FeedingScheduleOutput {
  id: string;
  tankId: string;
  intervalHours: number;
  startTime: string;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DefaultFeedingSettingsOutput {
  id: string;
  intervalHours: number;
  startTime: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateDefaultFeedingSettingsInput {
  intervalHours?: number;
  startTime?: string;
}

// Next feeding por tanque
export interface TankNextFeedingOutput {
  tankId: string;
  tankName: string;
  lastFeeding: FeedingRecordOutput | null;
  nextFeedingTime: string;
  timeLeft: string;
  feedingIntervalHours: number;
  isOverdue: boolean;
}

export interface AllTanksNextFeedingOutput {
  tanks: TankNextFeedingOutput[];
  defaultSettings: DefaultFeedingSettingsOutput | null;
}
