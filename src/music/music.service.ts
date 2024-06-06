import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateSongDto } from './dto/create-song.dto';
import { PrismaClient } from '@prisma/client';

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

  async create(createSongDto: CreateSongDto, file: Express.Multer.File) {
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
        id: file.filename.split('.').pop(),
        name: createSongDto.name,
        artist: createSongDto.artist,
        filename: file.filename,
        mimetype: file.mimetype,
        path: file.path,
      },
    });

    // delete song.mp3File;
    return song;
  }

  async obtenerCancionPorNombre(name: string) {
    return this.song.findFirst({
      where: {
        name
      },
    });
  }


}
