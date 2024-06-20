import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Req,
  Get,
  // ParseUUIDPipe,
  Res,
  Param,
  Query,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MusicService } from './music.service';
import { CreateSongDto } from './dto/create-song.dto';
import { fileFilter, fileNmer } from './helpers';
import { diskStorage } from 'multer';
import { Auth } from 'src/auth/decorators';
import { Request, Response } from 'express';
import { PaginationDto } from 'src/common/dto/pagination.dto';

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
        destination: './uploads/music', 
        filename: fileNmer,
      }), 
    }),
  )
  async create(
    @Body() createSongDto: CreateSongDto, 
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    // console.log(req.user);
    return this.musicService.create(createSongDto, file, req.user);
  }

  @Get()
  @Auth()
  async obtenerCancionPorUsuario(@Req() req: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const id: string = req.user.id as string;
    return this.musicService.obtenerCancionesPorUsuario(id);
  }

  @Get('file/:id')
  async obtenerArchivo(
    @Res() res: Response,
    @Param('id') id: string
  ) {
    const path = await this.musicService.obtenerArchivoCancion(id);
    // console.log(path); 
    res.sendFile(path);
  }

  @Get('image/:id')
  async obtenerImagen(
    @Res() res: Response,
    @Param('id') id: string
  ) {
    const path = await this.musicService.obtenerImagenCancion(id);
    
    res.sendFile(path);
  }

  @Get('songs')
  async obtenerCanciones(@Query() pagination: PaginationDto) {
    return this.musicService.obtenerCanciones(pagination);
  }

  @Auth()
  @Delete("song/:id")
  async deleteSong(@Param('id') id: string, @Req() req: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const idUsuario: string = req.user.id as string;
    return this.musicService.deleteSong(id, idUsuario)
  }

}
 