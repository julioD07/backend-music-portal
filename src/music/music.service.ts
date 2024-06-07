import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { CreateSongDto } from './dto/create-song.dto';
import { PrismaClient } from '@prisma/client';
import { existsSync } from 'fs';
import { join } from 'path';
import { envs } from 'src/config';
 

@Injectable()
export class MusicService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
  }

  private readonly logger = new Logger(MusicService.name);

  //? Método que se ejecuta cuando el módulo se inicializa
  async onModuleInit() {
    //? Conectarse a la base de datos
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  async create(
    createSongDto: CreateSongDto,
    file: Express.Multer.File,
    user: any,
  ) {
    // console.log(file);
    //? Validamos que el archivo venga en la petición
    if (!file) {
      throw new BadRequestException('No se ha enviado ningún archivo');
    }

    //? Leemos el archivo que se subió al servidor
    // const rutaArchivo = `./${file.path}`;
    // const archivo = readFileSync(rutaArchivo);
    // console.log({ archivo });

    //? Guardamos la información en la base de datos
    const song = await this.song.create({
      data: {
        id: file.filename.split('.')[0],
        name: createSongDto.name,
        artist: createSongDto.artist,
        filename: file.filename,
        mimetype: file.mimetype,
        path: file.path,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    // delete song.mp3File;
    return {
      ok: true,
      song,
    };
  }

  async obtenerCancionPorNombre(name: string) {
    return this.song.findFirst({
      where: {
        name,
      },
    });
  }

  async obtenerCancionesPorUsuario(userId: string) {
    return this.song.findMany({
      where: {
        userId,
      },
    });
  }

  async obtenerArchivoCancion(id: string) {
    try {
      const song = await this.song.findFirst({
        where: { 
          id, 
        }, 
      });
 
      if (!song) {
        throw new BadRequestException('No se ha encontrado la canción');
      }

      const path = join(envs.pathFiles, song.path);
      console.log({ path });

      if (!existsSync(path)) {
        throw new BadRequestException(
          'No se ha encontrado el archivo de la canción',
        );
      }

      // path = path.replace('\\', '/');

      return path;
    } catch (error) {
      // Manejo de errores aquí
      console.error(error);
      throw new InternalServerErrorException('An error occurred while fetching file.');
    }
  }
}
