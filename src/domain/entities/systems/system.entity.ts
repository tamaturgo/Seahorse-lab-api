// Contexto: Systems - Entidades relacionadas a sistemas e tanques
export class System {
  id: string;
  name: string;
  tanks: Tank[];
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