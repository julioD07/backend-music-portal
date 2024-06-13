import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MusicController } from './music.controller';
import { MusicService } from './music.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    AuthModule,
  ],
  controllers: [MusicController],
  providers: [MusicService],
})
export class MusicModule {}
