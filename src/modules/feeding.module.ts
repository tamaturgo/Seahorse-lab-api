import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from './auth.module';
import { FeedingRecordRepository } from '../infrastructure/repositories/feeding-record.repository';
import { FeedingRecordService } from '../application/services/feeding/feeding-record.service';
import { FeedingRecordController } from '../presentation/controllers/feeding';

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [FeedingRecordController],
  providers: [
    {
      provide: 'IFeedingRecordRepository',
      useClass: FeedingRecordRepository,
    },
    FeedingRecordService,
  ],
  exports: [FeedingRecordService],
})
export class FeedingModule {}
