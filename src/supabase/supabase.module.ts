import { Global, Module } from '@nestjs/common';
import { supabase, supabaseAdmin } from '../config/supabase.config';

@Global()
@Module({
  providers: [
    {
      provide: 'SUPABASE_CLIENT',
      useValue: supabaseAdmin, // Usar cliente admin para ignorar RLS no backend
    },
    {
      provide: 'SUPABASE_CLIENT_ANON',
      useValue: supabase, // Cliente com RLS (caso precise)
    },
  ],
  exports: ['SUPABASE_CLIENT', 'SUPABASE_CLIENT_ANON'],
})
export class SupabaseModule {}