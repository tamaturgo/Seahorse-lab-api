// Application DTOs for Systems
// Input/Output types for Application Services

export interface CreateSystemInput {
  name: string;
  description?: string;
  location?: string;
  status?: 'active' | 'inactive' | 'maintenance';
}

export interface UpdateSystemInput {
  name?: string;
  description?: string;
  location?: string;
  status?: 'active' | 'inactive' | 'maintenance';
}

export interface SystemOutput {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTankInput {
  name: string;
  systemId: string;
  capacity?: number;
  animals?: number;
  species?: string;
  status?: 'active' | 'inactive';
  observations?: string;
}

export interface UpdateTankInput {
  name?: string;
  systemId?: string;
  capacity?: number;
  animals?: number;
  species?: string;
  status?: 'active' | 'inactive';
  observations?: string;
}

export interface TankOutput {
  id: string;
  name: string;
  systemId: string;
  capacity: number | null;
  animals: number | null;
  species: string;
  status: 'active' | 'inactive';
  observations: string | null;
  createdAt: Date;
  updatedAt: Date;
}
