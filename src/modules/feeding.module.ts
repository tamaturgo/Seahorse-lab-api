import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from './auth.module';
import { FeedingRecordRepository } from '../infrastructure/repositories/feeding-record.repository';
import { FoodTypeRepository } from '../infrastructure/repositories/food-type.repository';
import { FeedingScheduleRepository } from '../infrastructure/repositories/feeding-schedule.repository';
import { FeedingRecordService } from '../application/services/feeding/feeding-record.service';
import { FoodTypeService } from '../application/services/feeding/food-type.service';
import { FeedingScheduleService } from '../application/services/feeding/feeding-schedule.service';
import { FeedingRecordController, FoodTypeController, FeedingScheduleController } from '../presentation/controllers/feeding';

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [FeedingRecordController, FoodTypeController, FeedingScheduleController],
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
    FeedingRecordService,
    FoodTypeService,
    FeedingScheduleService,
  ],
  exports: [FeedingRecordService, FoodTypeService, FeedingScheduleService],
})
export class FeedingModule {}
