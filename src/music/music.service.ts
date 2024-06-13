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
    const objectImage = await this.extractImageFromMP3(file.path, file.filename.split('.')[0]); 
    
    //? Guardamos la información en la base de datos
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
    const songs = await this.song.findMany({
      where: {
        userId,
      },
    });

    const songsImages = songs.map((song) => {
      return {
        ...song,
        //? Obtenemos la imagen de la canción
      }
    });

    return songsImages;
  }

  async extractImageFromMP3(filePath: string, nameFileNotExtension: string) {
    try {
      const metadata = await musicMetadata.parseFile(filePath);
      const pictures = metadata.common.picture;

      if (pictures && pictures.length > 0) {
        const picture = pictures[0]; // Suponemos que la primera imagen es la portada del álbum
        const imagePath = `./uploads/imgs/${nameFileNotExtension}.jpg`; // Ruta donde se guardará la imagen
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
        }, 
      });
 
      if (!song) {
        throw new BadRequestException('No se ha encontrado la canción');
      }

      const path = join(envs.pathFiles, song.path);
      // console.log({ path });

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

  async obtenerImagenCancion(name: string) {
    try {
      const song = await this.song.findFirst({
        where: { 
          pathImage: name, 
        }, 
      });
 
      if (!song) {
        throw new BadRequestException('No se ha encontrado la canción');
      }

      const path = join(envs.pathFiles, "uploads", "imgs", song.pathImage);
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

  //? Obtener las ultimas 12 canciones subidas
  async obtenerCanciones(pagination: PaginationDto) {
    const songs = await this.song.findMany({
      take: pagination.limit,
      skip: (pagination.page - 1) * pagination.limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return songs;
  }
}
