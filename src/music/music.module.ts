import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MusicController } from './music.controller';
import { MusicService } from './music.service';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/services';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    AuthModule,
  ],
  controllers: [MusicController],
  providers: [MusicService, AuthService],
})
export class MusicModule {}
