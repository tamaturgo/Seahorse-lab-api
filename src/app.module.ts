import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { UserModule } from './modules/user.module';
import { AuthModule } from './modules/auth.module';
import { ChecklistModule } from './modules/checklist.module';
import { SystemsModule } from './modules/systems.module';
import { FeedingModule } from './modules/feeding.module';
import { WaterParametersModule } from './modules/water-parameters.module';
import { AuditModule } from './modules/audit.module';
import { DashboardModule } from './modules/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule, 
    AuthModule, 
    UserModule, 
    ChecklistModule, 
    SystemsModule,
    FeedingModule,
    WaterParametersModule,
    AuditModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
