export class User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export class Tank {
  id: string;
  name: string;
  systemId: string;
  capacity: number;
  animals: number;
  species: string;
  status: 'active' | 'inactive';
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class System {
  id: string;
  name: string;
  tanks: Tank[];
  createdAt: Date;
  updatedAt: Date;
}

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

export class WaterParameters {
  id: string;
  tankId: string;
  pH: number;
  temperature: number;
  ammonia: number;
  nitrite: number;
  nitrate: number;
  date: Date;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Animal {
  id: string;
  tankId: string;
  species: string;
  status: 'healthy' | 'sick' | 'treatment' | 'deceased';
  dateAdded: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class MedicalRecord {
  id: string;
  animalId: string;
  diagnosis: string;
  treatment: string;
  status: 'ongoing' | 'recovered' | 'deceased';
  startDate: Date;
  endDate?: Date;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Medicine {
  id: string;
  name: string;
  dosage: string;
  application: string;
  frequency: 'daily' | 'interval' | 'decreasing';
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export class StockItem {
  id: string;
  name: string;
  category: 'food' | 'medicine' | 'equipment';
  quantity: number;
  minStock: number;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ChecklistItem {
  id: string;
  name: string;
  type: 'feeding' | 'parameters' | 'custom';
  required: boolean;
  completed: boolean;
  completedBy?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Configurações globais de checklist
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

// Re-export audit entities
export * from './audit';