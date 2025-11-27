export class WaterParameter {
  id: string;
  tankId: string;
  systemId?: string;
  pH: number;
  temperature: number;
  ammonia: number;
  nitrite: number;
  nitrate: number;
  salinity?: number;
  measuredAt: Date;
  userId: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<WaterParameter>) {
    Object.assign(this, data);
  }
}
