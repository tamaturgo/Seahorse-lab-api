import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from './auth.module';
import { FeedingRecordRepository } from '../infrastructure/repositories/feeding-record.repository';
import { FoodTypeRepository } from '../infrastructure/repositories/food-type.repository';
import { FeedingScheduleRepository } from '../infrastructure/repositories/feeding-schedule.repository';
import { DietRepository } from '../infrastructure/repositories/diet.repository';
import { TankDietRepository } from '../infrastructure/repositories/tank-diet.repository';
import { FeedingRecordService } from '../application/services/feeding/feeding-record.service';
import { FoodTypeService } from '../application/services/feeding/food-type.service';
import { FeedingScheduleService } from '../application/services/feeding/feeding-schedule.service';
import { DietService } from '../application/services/feeding/diet.service';
import { TankDietService } from '../application/services/feeding/tank-diet.service';
import { FeedingRecordController, FoodTypeController, FeedingScheduleController, DietController } from '../presentation/controllers/feeding';
import { TankDietController } from '../presentation/controllers/feeding/tank-diet.controller';

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [FeedingRecordController, FoodTypeController, FeedingScheduleController, DietController, TankDietController],
  providers: [
    {
      provide: 'IFeedingRecordRepository',
      useClass: FeedingRecordRepository,
    },
    {
      provide: 'IFoodTypeRepository',
      useClass: FoodTypeRepository,
    },
    {
      provide: 'IFeedingScheduleRepository',
      useClass: FeedingScheduleRepository,
    },
    {
      provide: 'IDietRepository',
      useClass: DietRepository,
    },
    {
      provide: 'ITankDietRepository',
      useClass: TankDietRepository,
    },
    FeedingRecordService,
    FoodTypeService,
    FeedingScheduleService,
    DietService,
    TankDietService,
  ],
  exports: [FeedingRecordService, FoodTypeService, FeedingScheduleService, DietService, TankDietService],
})
export class FeedingModule {}
