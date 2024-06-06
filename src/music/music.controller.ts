import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Req,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MusicService } from './music.service';
import { CreateSongDto } from './dto/create-song.dto';
import { fileFilter, fileNmer } from './helpers';
import { diskStorage } from 'multer';
import { Auth } from 'src/auth/decorators';
import { Request } from 'express';

@Controller('music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Auth()
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      // limits: { fileSize: 1000 },
      storage: diskStorage({
        destination: './uploads',
        filename: fileNmer,
      }),
    }),
  )
  async create(
    @Body() createSongDto: CreateSongDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request
  ) {
    // console.log(req.user);
    return this.musicService.create(createSongDto, file, req.user);
  }

  @Get()
  async obtenerCancionPorNombre(@Query('userId') userId: string) {
    return this.musicService.obtenerCancionesPorUsuario(userId);
  }
}
