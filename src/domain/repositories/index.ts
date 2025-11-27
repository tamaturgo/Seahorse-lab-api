import { User } from '../entities/user';
import { Tank, System } from '../entities/systems';
import { FeedingRecord } from '../entities/feeding';
import { WaterParameters } from '../entities/systems';
import { Animal, MedicalRecord, Medicine } from '../entities/medicine';
import { StockItem } from '../entities/stock';

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
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