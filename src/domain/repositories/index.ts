import { User } from '../entities/user';
import { Tank, System } from '../entities/systems';
import { FeedingRecord, FoodType } from '../entities/feeding';
import { WaterParameters } from '../entities/systems';
import { Animal, MedicalRecord, Medicine } from '../entities/medicine';
import { StockItem } from '../entities/stock';
import { AuditLog, AuditAction } from '../entities/audit';

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}

export interface ITankRepository {
  findAll(): Promise<Tank[]>;
  findById(id: string): Promise<Tank | null>;
  findBySystemId(systemId: string): Promise<Tank[]>;
  create(tank: Omit<Tank, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tank>;
  update(id: string, tank: Partial<Tank>): Promise<Tank>;
  delete(id: string): Promise<void>;
}

export interface ISystemRepository {
  findAll(): Promise<System[]>;
  findById(id: string): Promise<System | null>;
  create(system: Omit<System, 'id' | 'createdAt' | 'updatedAt' | 'tanks'>): Promise<System>;
  update(id: string, system: Partial<System>): Promise<System>;
  delete(id: string): Promise<void>;
}

export interface IFeedingRecordRepository {
  findAll(): Promise<FeedingRecord[]>;
  findById(id: string): Promise<FeedingRecord | null>;
  findByTankId(tankId: string): Promise<FeedingRecord[]>;
  create(record: Omit<FeedingRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<FeedingRecord>;
  update(id: string, record: Partial<FeedingRecord>): Promise<FeedingRecord>;
  delete(id: string): Promise<void>;
}

export interface IWaterParametersRepository {
  findAll(): Promise<WaterParameters[]>;
  findById(id: string): Promise<WaterParameters | null>;
  findByTankId(tankId: string): Promise<WaterParameters[]>;
  create(params: Omit<WaterParameters, 'id' | 'createdAt' | 'updatedAt'>): Promise<WaterParameters>;
  update(id: string, params: Partial<WaterParameters>): Promise<WaterParameters>;
  delete(id: string): Promise<void>;
}

export interface IAnimalRepository {
  findAll(): Promise<Animal[]>;
  findById(id: string): Promise<Animal | null>;
  findByTankId(tankId: string): Promise<Animal[]>;
  create(animal: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Animal>;
  update(id: string, animal: Partial<Animal>): Promise<Animal>;
  delete(id: string): Promise<void>;
}

export interface IMedicalRecordRepository {
  findAll(): Promise<MedicalRecord[]>;
  findById(id: string): Promise<MedicalRecord | null>;
  findByAnimalId(animalId: string): Promise<MedicalRecord[]>;
  create(record: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicalRecord>;
  update(id: string, record: Partial<MedicalRecord>): Promise<MedicalRecord>;
  delete(id: string): Promise<void>;
}

export interface IMedicineRepository {
  findAll(): Promise<Medicine[]>;
  findById(id: string): Promise<Medicine | null>;
  create(medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medicine>;
  update(id: string, medicine: Partial<Medicine>): Promise<Medicine>;
  delete(id: string): Promise<void>;
}

export interface IStockItemRepository {
  findAll(): Promise<StockItem[]>;
  findById(id: string): Promise<StockItem | null>;
  findByCategory(category: string): Promise<StockItem[]>;
  create(item: Omit<StockItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<StockItem>;
  update(id: string, item: Partial<StockItem>): Promise<StockItem>;
  delete(id: string): Promise<void>;
}

export interface IFoodTypeRepository {
  create(foodType: Partial<FoodType>): Promise<FoodType>;
  findAll(includeInactive?: boolean): Promise<FoodType[]>;
  findById(id: string): Promise<FoodType | null>;
  findByCode(code: string): Promise<FoodType | null>;
  update(id: string, foodType: Partial<FoodType>): Promise<FoodType>;
  delete(id: string): Promise<void>;
}

// Filtros para consulta de logs de auditoria
export interface AuditLogFilters {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: AuditAction;
  entityType?: string;
  page?: number;
  limit?: number;
}

// Resposta paginada de logs de auditoria
export interface PaginatedAuditLogs {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IAuditLogRepository {
  create(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog>;
  findAll(filters?: AuditLogFilters): Promise<PaginatedAuditLogs>;
  findById(id: string): Promise<AuditLog | null>;
  findByUserId(userId: string, filters?: AuditLogFilters): Promise<PaginatedAuditLogs>;
  findByEntityId(entityType: string, entityId: string): Promise<AuditLog[]>;
  deleteOlderThan(date: Date): Promise<number>;
  getDistinctEntityTypes(): Promise<string[]>;
  getDistinctUsers(): Promise<{ id: string; name: string; email: string }[]>;
}