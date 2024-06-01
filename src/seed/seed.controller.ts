import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  //Datos Iniciales
  @Get("ejecutar")
  ejecutarSeed() {
    return this.seedService.ejecutarSeed();
  }
}
