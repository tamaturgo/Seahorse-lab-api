// Contexto: Medicine - Entidades relacionadas à saúde animal
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