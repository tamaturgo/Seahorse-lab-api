import { Module } from '@nestjs/common';
import { SystemService, TankService } from '../application/services/systems';
import { SystemController, TankController } from '../presentation/controllers/systems';
import { SystemRepository } from '../infrastructure/repositories/system.repository';
import { TankRepository } from '../infrastructure/repositories/tank.repository';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from './auth.module';

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [SystemController, TankController],
  providers: [
    SystemService,
    TankService,
    {
      provide: 'ISystemRepository',
      useClass: SystemRepository,
    },
    {
      provide: 'ITankRepository',
      useClass: TankRepository,
    },
  ],
  exports: [SystemService, TankService],
})
export class SystemsModule {}
