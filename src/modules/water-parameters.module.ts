import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthModule } from './auth.module';
import { WaterParameterRepository } from '../infrastructure/repositories/water-parameter.repository';
import { WaterParameterService } from '../application/services/water-parameters/water-parameter.service';
import { WaterParameterController } from '../presentation/controllers/water-parameters';

@Module({
  imports: [SupabaseModule, AuthModule],
  controllers: [WaterParameterController],
  providers: [
    {
      provide: 'IWaterParameterRepository',
      useClass: WaterParameterRepository,
    },
    WaterParameterService,
  ],
  exports: [WaterParameterService],
})
export class WaterParametersModule {}
