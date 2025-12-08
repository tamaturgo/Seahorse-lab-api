import { Module } from '@nestjs/common';
import { DashboardController } from '../presentation/controllers/dashboard/dashboard.controller';
import { DashboardService } from '../application/services/dashboard/dashboard.service';
import { SystemsModule } from './systems.module';
import { WaterParametersModule } from './water-parameters.module';
import { FeedingModule } from './feeding.module';
import { ChecklistModule } from './checklist.module';
import { AuditModule } from './audit.module';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    SupabaseModule,
    AuthModule,
    SystemsModule,
    WaterParametersModule,
    FeedingModule,
    ChecklistModule,
    AuditModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
