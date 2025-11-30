import { Module } from '@nestjs/common';
import { UserController } from '../presentation/controllers/user.controller';
import { UserService } from '../application/services/user.service';
import { UserRepository } from '../infrastructure/repositories/user.repository';
import { AuthModule } from './auth.module';
import { SupabaseModule } from '../supabase/supabase.module';
import type { IUserRepository } from '../domain/repositories';

@Module({
  imports: [AuthModule, SupabaseModule],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
  exports: [UserService],
})
export class UserModule {}