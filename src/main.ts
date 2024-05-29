import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { json } from 'express';

async function bootstrap() {
  let app: INestApplication;
  if (process.env.NODE_ENV === 'prd') {
    //? Configuracion de la aplicacion de SSL con una clave privada string y un certificado
    const httpsOptions = {
      passphrase: 'unibolbaq99',
      pfx: readFileSync(join('C:', 'ssl', 'unibol08282023.pfx')),
    };

    app = await NestFactory.create(AppModule, { httpsOptions });

    //? Configuracion de CORS
  app.enableCors({
    origin: [
      'http://localhost:5174',
      'http://localhost:5173',
      'http://localhost:6500',
      'http://192.168.104.15:5173',
      'http://localhost:53257',
      'https://oficina.unibol.com.co:8089',
    ],
    methods: '*',
    allowedHeaders: '*',
  });

  } else {
    app = await NestFactory.create(AppModule, {
      bodyParser: false
    });
    app.use(json({ limit: "300mb"}))
    app.enableCors();
  }

  //? Configuracion de prefijos
  app.setGlobalPrefix('api');

  //? Configuracion global de pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(3000);
}
bootstrap();
