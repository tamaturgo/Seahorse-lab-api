import { IsString, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateTankDietDto {
  @IsString()
  @IsNotEmpty()
  tankId: string;

  @IsString()
  @IsNotEmpty()
  dietId: string;

  @IsDateString()
  @IsNotEmpty()
  birthDate: string;
}

export class TankDietResponseDto {
  id: string;
  tankId: string;
  dietId: string;
  isActive: boolean;
  birthDate: string;
  startedAt: string;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
  currentDayOfLife?: number;
  activeDietItems?: any[];
}
