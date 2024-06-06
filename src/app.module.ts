import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';
import { MusicModule } from './music/music.module';

@Module({
  imports: [AuthModule, SeedModule, MusicModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
