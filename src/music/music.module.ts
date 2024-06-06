import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MusicController } from './music.controller';
import { MusicService } from './music.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [MusicController],
  providers: [MusicService],
})
export class MusicModule {}
