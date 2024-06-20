import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { CreateSongDto } from './dto/create-song.dto';
import { PrismaClient } from '@prisma/client';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { envs } from 'src/config';
import * as musicMetadata from 'music-metadata';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class MusicService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
  }

  private readonly logger = new Logger(MusicService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  async create(
    createSongDto: CreateSongDto,
    file: Express.Multer.File,
    user: any,
  ) {
    if (!file) {
      throw new BadRequestException('No se ha enviado ningún archivo');
    }

    const objectImage = await this.extractImageFromMP3(file.path, file.filename.split('.')[0]);

    const song = await this.song.create({
      data: {
        id: file.filename.split('.')[0],
        name: createSongDto.name,
        artist: createSongDto.artist,
        filename: file.filename,
        mimetype: file.mimetype,
        path: file.path,
        pathImage: objectImage.nameImage,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return {
      ok: true,
      song,
    };
  }

  async obtenerCancionPorNombre(name: string) {
    return this.song.findFirst({
      where: {
        name,
        state: true, // Asegurarse de que solo las canciones con estado true se devuelvan
      },
    });
  }

  async obtenerCancionesPorUsuario(userId: string) {
    const songs = await this.song.findMany({
      where: {
        userId,
        state: true, // Filtrar por canciones con estado true
      },
    });

    const songsImages = songs.map((song) => {
      return {
        ...song,
      };
    });

    return songsImages;
  }

  async extractImageFromMP3(filePath: string, nameFileNotExtension: string) {
    try {
      const metadata = await musicMetadata.parseFile(filePath);
      const pictures = metadata.common.picture;

      if (pictures && pictures.length > 0) {
        const picture = pictures[0];
        const imagePath = `./uploads/imgs/${nameFileNotExtension}.jpg`;
        writeFileSync(imagePath, picture.data);
        return {
          imagePath,
          nameImage: `${nameFileNotExtension}.jpg`,
        };
      } else {
        throw new Error('No se encontraron imágenes en el archivo MP3.');
      }
    } catch (error) {
      throw new Error(`Error extrayendo la imagen: ${error.message}`);
    }
  }

  async obtenerArchivoCancion(name: string) {
    try {
      const song = await this.song.findFirst({
        where: {
          filename: name,
          state: true, // Filtrar por canciones con estado true
        },
      });

      if (!song) {
        throw new BadRequestException('No se ha encontrado la canción');
      }

      const path = join(envs.pathFiles, song.path);

      if (!existsSync(path)) {
        throw new BadRequestException('No se ha encontrado el archivo de la canción');
      }

      return path;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('An error occurred while fetching file.');
    }
  }

  async obtenerImagenCancion(name: string) {
    try {
      const song = await this.song.findFirst({
        where: {
          pathImage: name,
          state: true, // Filtrar por canciones con estado true
        },
      });

      if (!song) {
        throw new BadRequestException('No se ha encontrado la canción');
      }

      const path = join(envs.pathFiles, 'uploads', 'imgs', song.pathImage);

      if (!existsSync(path)) {
        throw new BadRequestException('No se ha encontrado el archivo de la canción');
      }

      return path;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('An error occurred while fetching file.');
    }
  }

  async obtenerCanciones(pagination: PaginationDto) {
    const songs = await this.song.findMany({
      where: {
        state: true, // Filtrar por canciones con estado true
      },
      take: pagination.limit,
      skip: (pagination.page - 1) * pagination.limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return songs;
  }

  async deleteSong(songId: string, idUsuario: string) {
    const song = await this.song.updateMany({
      where: { 
        id: songId,
        userId: idUsuario,
        state: true // Solo permitir la eliminación si la canción está activa
      },
      data: { state: false },
    });
  
    if (song.count === 0) {
      throw new BadRequestException('No se ha encontrado la canción para eliminar o no está autorizada para este usuario');
    }
  
    return {
      ok: true,
      message: 'Canción eliminada correctamente',
    };
  }
}
